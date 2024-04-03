const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "track",
    cooldown: 3000,
    aliases: ["gettrack", "getsong"],
    description: `track <track-name> by <artist> - gets track info from last.fm`,
    execute: async context => {
        try {
            const input = context.message.args.join(' ');
            let trackName, artistName
            try{            
                const [trackPart, artistPart] = input.split(" by ");
                trackName = trackPart.trim();
                artistName = artistPart.trim();
            } catch (err) {
                return{text:`Usage: +track <track-name> by <artist>`, reply:true}
            }

            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = userData?.lastfm

            let nameParam = "&username=none"
            if(lastfmName){
                nameParam = `&username=${lastfmName}`
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${config.lastfmKey}&artist=${artistName}&track=${trackName}&autocorrect=1${nameParam}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            
            let userPlayCount = ""
            if(nameParam === `&username=${lastfmName}`) {userPlayCount = `• play count: ${data.track.userplaycount}`}
            let track = data.track.name
            let artist = data.track.artist.name

            let url = data.track.url
            const tags = data.track.toptags.tag.map(tag => tag.name);

            return{text:`${track} by ${artist} ${userPlayCount} • total plays: ${data.track.playcount} • ${url} • tags: ${tags.split(", ")}`, reply:true}
            
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};