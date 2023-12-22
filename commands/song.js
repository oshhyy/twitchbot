const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "song",
    cooldown: 3000,
    aliases: ["currentsong", "track", "currenttrack"],
    description: `song [lastfm-username] - shows what you are listening to on last.fm! if no username is chosen, linked username using '+link <username>' will be used!`,
    execute: async context => {
        try {
            // command code
            let userData
            let lastfmName
            if(context.message.args[0].startsWith("@")) {
                userData = await bot.db.users.findOne({username: context.message.args[0].replace("@", "")})
                lastfmName = userData.lastfm
                if(!lastfmName){
                    return{text:`This user does not have a linked last.fm profile!'`, reply:true}
                }

            } else {
                userData = await bot.db.users.findOne({id: context.user.id})
                lastfmName = context.message.args[0] ?? userData?.lastfm
                if(!lastfmName){
                    return{text:`No last.fm username provided! To link your account, do '+link <username>'`, reply:true}
                }
            }
            
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmName}&api_key=${config.lastfmKey}&format=json&limit=1&extended=1`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            
            const status = data.recenttracks.track[0][`@attr`]?.nowplaying ? `yes` : `no`
            if(status == 'no'){
                return{text:`User ${lastfmName} is currently not listening to anything!`, reply:true}
            } else {
                const songName = data.recenttracks.track[0].name
                const artistName = data.recenttracks.track[0].artist.name
                const url = data.recenttracks.track[0].url
                return{text:`/me 🎵 ${artistName} • ${songName} elisVibe ${url}`, reply:true}
            }
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};