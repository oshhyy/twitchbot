const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "topalbums",
    cooldown: 3000,
    aliases: ["topalbum", "topsongs", "topalbums"],
    description: `topalbums [lastfm-username] - shows top albums for last.fm`,
    execute: async context => {
        try {
            // command code
            let userData
            let lastfmName
            let method = "user.gettopalbums"
            let listType = "alltime"
            if(context.message.args.includes("weekly")) {
                method = "user.getWeeklyalbumChart"
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
                if(!data.weeklyalbumchart.album[0]) {
                    return{text:"This user has not listened to any albums!", reply:true}
                }
                message = `top ${listType} albums for ${data.weeklyalbumchart[`@attr`].user}`
            } else {
                if(!data.topalbums.album[0]) {
                    return{text:"This user has not listened to any albums!", reply:true}
                }
                message = `top ${listType} albums for ${data.topalbums[`@attr`].user}`
            }

            
            for(let i = 0; i < 5; i++) {
                if(listType == "weekly") {
                    // weekly
                    if(!data.weeklyalbumchart.album[i]) break
                    message = message.concat(` • ${data.weeklyalbumchart.album[i].artist[`#text`]} - ${data.weeklyalbumchart.album[i].name} (${data.weeklyalbumchart.album[i].playcount.toLocaleString()})`)
                } else {
                    // alltime
                    if(!data.topalbums.album[i]) break
                    message = message.concat(` • ${data.topalbums.album[i].artist.name} - ${data.topalbums.album[i].name} (${data.topalbums.album[i].playcount.toLocaleString()})`)
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