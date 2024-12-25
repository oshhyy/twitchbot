const got = require("got");
const config = require("../config.json");
module.exports = {
    name: "time",
    cooldown: 3000,
    aliases: [],
    description: `time <city|town> - shows local time for given or linked location`,
    execute: async context => {
        try {
            // command code
            function epochToDateTime(epochTime, timezone) {
                const date = new Date(epochTime * 1000);
            
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short'
                });
                const formattedDate = formatter.format(date);
                return formattedDate;
            }
            
            let userData
            let location
            if(context.message.args[0]?.startsWith("@")) {
                userData = await bot.db.users.findOne({username: context.message.args[0].replace("@", "")})
                location = userData?.location
                if(!location){
                    return{text:`This user does not have a linked location!`, reply:true}
                }
            } else {
                userData = await bot.db.users.findOne({id: context.user.id})
                location = context.message.args.slice(0).join(" ")
                if(location == ""){
                    location = userData?.location
                    if (!location) return{text:`No location provided!`, reply:true}
                }
            }

            let data
            try {
                data = await got(`http://api.weatherapi.com/v1/current.json?key=${config.weatherKey}&q=${encodeURIComponent(location)}&aqi=no`).json()
            } catch(err) {
                return{text: `No Matching Location Found.`, reply:true}
            }

            console.log(data)
            let emoji = ""
            if(data.current.is_day == 1) {
                emoji = "🏙️ "
            } else emoji = "🌃 "

            timeText = epochToDateTime(data.location.localtime_epoch, data.location.tz_id)

            return {
                text: `${emoji}Time in ${data.location.name}, ${data.location.region} (${data.location.country}): ${timeText}.`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};