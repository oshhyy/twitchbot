const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "topalbums",
    cooldown: 3000,
    aliases: ["topalbum"],
    description: `topalbums [lastfm-username] - shows top albums for last.fm`,
    execute: async context => {
        try {
            // command code
            const userData = await bot.db.users.findOne({id: context.user.id})
            const lastfmName = context.message.args[0] ?? userData?.lastfm
            if(!lastfmName){
                return{text:`No last.fm username provided! To link your account, do '+link <username>'`, reply:true}
            }
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            let message = `top albums for ${data.topalbums[`@attr`].user}`
            for(let i = 0; i < 5; i++) {
                message = message.concat(` • ${data.topalbums.album[i].artist.name} - ${data.topalbums.album[i].name} (${data.topalbums.album[i].playcount.toLocaleString()})`)
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