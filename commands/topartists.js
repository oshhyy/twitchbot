const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "topartists",
    cooldown: 3000,
    aliases: ["topartist", "topsongs", "topartists"],
    description: `topartists [lastfm-username] - shows top artists for last.fm`,
    execute: async context => {
        try {
            // command code
            let userData
            let lastfmName
            let method = "user.gettopartists"
            let listType = "alltime"
            if(context.message.args.includes("weekly")) {
                method = "user.getWeeklyartistChart"
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
                if(!data.weeklyartistchart.artist[0]) {
                    return{text:"This user has not listened to any artists!", reply:true}
                }
                message = `top ${listType} artists for ${data.weeklyartistchart[`@attr`].user}`
            } else {
                if(!data.topartists.artist[0]) {
                    return{text:"This user has not listened to any artists!", reply:true}
                }
                message = `top ${listType} artists for ${data.topartists[`@attr`].user}`
            }

            
            for(let i = 0; i < 5; i++) {
                if(listType == "weekly") {
                    // weekly
                    if(!data.weeklyartistchart.artist[i]) break
                    message = message.concat(` • ${data.weeklyartistchart.artist[i].artist[`#text`]} - ${data.weeklyartistchart.artist[i].name} (${data.weeklyartistchart.artist[i].playcount.toLocaleString()})`)
                } else {
                    // alltime
                    if(!data.topartists.artist[i]) break
                    message = message.concat(` • ${data.topartists.artist[i].artist.name} - ${data.topartists.artist[i].name} (${data.topartists.artist[i].playcount.toLocaleString()})`)
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