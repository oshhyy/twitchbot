const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "song",
    cooldown: 3000,
    aliases: ["currentsong", "currenttrack", "fm"],
    description: `song [lastfm-username] - shows what you are listening to on last.fm! if no username is chosen, linked username using '+link <username>' will be used!`,
    execute: async context => {
        try {

            function incrementString(str) {
                var count = str.match(/\d*$/);
                return str.substr(0, count.index) + (++count[0]);
              };
              
            // command code
            let userData
            let lastfmName
            if(context.message.args[0]?.startsWith("@")) {
                userData = await bot.db.users.findOne({username: context.message.args[0].replace("@", "")})
                lastfmName = userData?.lastfm
                if(!lastfmName){
                    return{text:`This user does not have a linked last.fm profile!`, reply:true}
                }

            } else {
                userData = await bot.db.users.findOne({id: context.user.id})
                lastfmName = context.message.args[0] ?? userData?.lastfm
                if(!lastfmName){
                    return{text:`No last.fm username provided! To link your account, do '+link lastfm <username>'`, reply:true}
                }
            }
            
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmName}&api_key=${config.lastfmKey}&format=json&limit=1&extended=1`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            let status
            try{
                status = data.recenttracks.track[0][`@attr`]?.nowplaying ? `yes` : `no`
            } catch(err) {
                try{
                    status = data.recenttracks.track[`@attr`]?.nowplaying ? `yes` : `no`
                } catch (err) {
                    return {text:`No songs on last.fm profile! Remember to link your last.fm account and spotify on the website.`, reply:true}
                }
            }
            if(status == 'no'){
                return{text:`User ${lastfmName} is currently not listening to anything!`, reply:true}
            }

            let playCount = ""

            let songName = "", artistName = "", url = ""
            try {
                songName = data.recenttracks.track[0].name
                artistName = data.recenttracks.track[0].artist.name
            } catch(err) {
                songName = data.recenttracks.track.name
                artistName = data.recenttracks.track.artist.name
            }

            try{
                const songData = await got(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${config.lastfmKey}&artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(songName)}&autocorrect=1&username=${lastfmName}&format=json`, {throwHttpErrors:false}).json()
                if(songData.track.userplaycount) {
                    playCount = incrementString(`• play #${songData.track.userplaycount ?? 0}`)
                }
            } catch {}

            try{
                const urlData = await got(`https://songwhip.com/api?q=${encodeURIComponent(`${songName} ${artistName}`)}`, {throwHttpErrors:false}).json()
                url = urlData.data.tracks[0].sourceUrl
            } catch(err) {}

            return{text:`/me 🎵 ${artistName} • ${songName} elisVibe ${url} ${playCount}`, reply:true}
            
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} NAILS`)
        }
    },
};