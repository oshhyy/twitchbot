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

            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }

            if(!data.topalbums.album[0]) {return{text:"This user has not listened to any albums!", reply:true}}

            let message = `top albums for ${data.topalbums[`@attr`].user}`
            for(let i = 0; i < 5; i++) {
                if(!data.topalbums.album[i]) break
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