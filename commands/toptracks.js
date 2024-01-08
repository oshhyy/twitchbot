const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "toptracks",
    cooldown: 3000,
    aliases: ["toptrack", "topsongs", "toptracks"],
    description: `toptracks [lastfm-username] - shows top tracks for last.fm`,
    execute: async context => {
        try {
            // command code
            let userData
            let lastfmName
            let method = "user.gettoptracks"
            let listType = "alltime"
            if(context.message.args.includes("weekly")) {
                method = "user.getWeeklyTrackChart"
                context.message.args.splice(context.message.args.indexOf("weekly"), 1)
                listType = "weekly"
            }
            console.log(method)
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

            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=${method}&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            
            let message

            if(listType == "weekly") {
                if(!data.weeklytrackchart.track[0]) {
                    return{text:"This user has not listened to any tracks!", reply:true}
                }
                message = `top ${listType} tracks for ${data.weeklytrackchart[`@attr`].user}`
            } else {
                if(!data.toptracks.track[0]) {
                    return{text:"This user has not listened to any tracks!", reply:true}
                }
                message = `top ${listType} tracks for ${data.toptracks[`@attr`].user}`
            }

            
            for(let i = 0; i < 5; i++) {
                if(listType == "weekly") {
                    // weekly
                    if(!data.weeklytrackchart.track[i]) break
                    message = message.concat(` • ${data.weeklytrackchart.track[i].artist[`#text`]} - ${data.weeklytrackchart.track[i].name} (${data.weeklytrackchart.track[i].playcount.toLocaleString()})`)
                } else {
                    // alltime
                    if(!data.toptracks.track[i]) break
                    message = message.concat(` • ${data.toptracks.track[i].artist.name} - ${data.toptracks.track[i].name} (${data.toptracks.track[i].playcount.toLocaleString()})`)
                }
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