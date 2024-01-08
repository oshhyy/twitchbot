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

            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            if(!data.topartists.artist) {return{text:"This user has not listened to any artists!", reply:true}}

            let message = `top artists for ${data.topartists[`@attr`].user}`
            for(let i = 0; i < 10; i++) {
                if(!data.topartists.artist[i]) break
                message = message.concat(` • ${data.topartists.artist[i].name} (${data.topartists.artist[i].playcount.toLocaleString()})`)
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