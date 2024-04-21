const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "song",
    cooldown: 3000,
    aliases: ["currentsong", "currenttrack", "fm"],
    description: `song [lastfm-username] - shows what you are listening to on last.fm! if no username is chosen, linked username using '+link <username>' will be used!`,
    execute: async context => {
        try {
            // command code
            let userData
            let lastfmName
            if(context.message.args[0]?.startsWith("@")) {
                userData = await bot.db.users.findOne({username: context.message.args[0].replace("@", "")})
                lastfmName = userData.lastfm
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
            let songName, artistName, url
            try {
                songName = data.recenttracks.track[0].name
                artistName = data.recenttracks.track[0].artist.name
                url = data.recenttracks.track[0].url
            } catch(err) {
                songName = data.recenttracks.track.name
                artistName = data.recenttracks.track.artist.name
                url = data.recenttracks.track.url
            }

            const songData = await got(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${config.lastfmKey}&artist=${artistName}&track=${songName}&autocorrect=1&username=${lastfmName}&format=json`, {throwHttpErrors:false}).json()
            let playCount = songData.track.userplaycount ?? "?"

            return{text:`/me 🎵 ${artistName} • ${songName} elisVibe ${url} • play #${playCount}`, reply:true}
            
        } catch (err) {
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} NAILS`)
        }
    },
};