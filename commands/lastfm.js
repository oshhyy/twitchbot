const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "lastfm",
    cooldown: 3000,
    aliases: ["currentsong"],
    description: `lastfm [lastfm-username] - shows stats for last.fm`,
    execute: async context => {
        try {
            // command code
            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = context.message.args[0] ?? userData?.lastfm
            if(!lastfmName){
                return{text:`No last.fm username provided! To link your account, do '+link <username>'`, reply:true}
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${lastfmName}&api_key=${config.lastfmKey}&format=json&limit=1&extended=1`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            return{text:` last.fm stats for ${data.user.name} • ${data.user.playcount} plays • ${data.user.artist_count} artists • ${data.user.track_count} tracks • ${data.user.album_count} albums`, reply:true}
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};