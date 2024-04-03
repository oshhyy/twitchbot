const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "album",
    cooldown: 3000,
    aliases: ["getalbum"],
    description: `topalbums [lastfm-username] - gets album info from last.fm`,
    execute: async context => {
        try {
            const input = context.message.args.join(' ');
            
            const [albumPart, artistPart] = input.split(" by ");
            const albumName = albumPart.trim();
            const artistName = artistPart.trim();

            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = context.message.args[0] ?? userData?.lastfm

            // for some reason in lfm api the album name doesnt show if there is no username so junk username will have to be put in
            let nameParam = "&username=none"
            if(lastfmName){
                nameParam = `&username=${lastfmName}`
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${config.lastfmKey}&artist=${artistName}&album=${albumName}&autocorrect=1${nameParam}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            
            let userPlayCount = ""
            if(nameParam != "&username=none") {
                userPlayCount = `• play count: ${data.album.userplaycount.toLocaleString()}`
            }
            let album = data.album.name
            let artist = data.album.artist
            let tags = "• tags: "

            for (tag in album.tags.tag) {
                tags = tags.concat(`${tag.name}`)
                if(tag != album.tags.tag[album.tags.tag.length - 1]) {
                    tags = tags.concat(`,`)
                }
            }

            let url = data.album.url

            return{text:` ${album} (album) by ${artist} ${userPlayCount} • tracks: ${data.album.tracks.track.length} • total plays: ${data.album.playcount.toLocaleString()} ${tags} • ${url}`, reply:true}
            
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};