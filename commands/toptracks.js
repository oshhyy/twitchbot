const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "toptracks",
    cooldown: 3000,
    aliases: ["toptrack"],
    description: `toptracks [lastfm-username] - shows top tracks for last.fm`,
    execute: async context => {
        try {
            // command code
            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = context.message.args[0] ?? userData?.lastfm
            if(!lastfmName){
                return{text:`No last.fm username provided! To link your account, do '+link <username>'`, reply:true}
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${lastfmName}&api_key=${config.lastfmKey}&format=json&limit=1&extended=1`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            let message = `top tracks for ${data.toptracks[`@attr`].user}`

            for(let n = 0; n < 5; n++) {
                message = message.concat(` • ${data.toptracks.track[n].artist.name} - ${data.toptracks.track[n].name} (${data.toptracks.track[n].playcount.toLocaleString()})`)
            }

            return{text:message, reply:true}
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};