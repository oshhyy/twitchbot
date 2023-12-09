const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "topartists",
    cooldown: 3000,
    aliases: ["topartist"],
    description: `topartists [lastfm-username] - shows top artists for last.fm`,
    execute: async context => {
        try {
            // command code
            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = context.message.args[0] ?? userData?.lastfm
            if(!lastfmName){
                return{text:`No last.fm username provided! To link your account, do '+link <username>'`, reply:true}
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            let message = `top artists for ${data.topartists[`@attr`].user}`
            for(let i = 0; i < 5; i++) {
                message = message.concat(` • ${data.topartists.artist[i].artist.name} - ${data.topartists.artist[i].name} (${data.topartists.artist[i].playcount.toLocaleString()})`)
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