const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "artist",
    cooldown: 3000,
    aliases: ["getartist"],
    description: `artist <artist> - gets artist info from last.fm`,
    execute: async context => {
        try {
            const artistName = context.message.args[0];
            if(!artistName) {
                return{text:`Usage: +artist <artist>`, reply:true}
            }

            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = userData?.lastfm

            // for some reason in lfm api the album name doesnt show if there is no username so junk username will have to be put in
            let nameParam = "&username=none"
            if(lastfmName){
                nameParam = `&username=${lastfmName}`
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${config.lastfmKey}&artist=${artistName}&autocorrect=1${nameParam}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            
            let userPlayCount = ""
            if(nameParam === `&username=${lastfmName}`) {userPlayCount = `• play count: ${data.artist.stats.userplaycount}`}
            let artist = data.artist.name

            let url = data.artist.url
            const tags = data.artist.tags.tag.map(tag => tag.name);

            return{text:`${artist} ${userPlayCount} • total plays: ${data.artist.stats.playcount} • ${url} • tags: ${tags.split(", ")}`, reply:true}
            
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};