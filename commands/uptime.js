const got = require("got");

module.exports = {
    name: "uptime",
    cooldown: 5000,
    aliases: ['downtime'],
    description: `uptime [channel] | checks how long a channel has been online/offline`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.channel.login;
            user = user.replace('@','');
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    if (context.message.args[0].includes('/')) {
                        return {
                            text:'Invalid Username! oshDank', reply:true
                        };
                    }
                }
            }
    
            const data = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();


            if (!data[0]) {
                return {
                    text:'Invalid Username! oshDank', reply:true
                };
            }

            const currentDate = new Date();
            let year
            let month
            let date
            let lastStreamedDate
            let lastStreamedTime
    
            if (data[0].stream == null) {
                if (data[0].lastBroadcast.startedAt == null) {
                    return{
                        text:`${data[0].displayName} has never been live before.`, reply:true
                    };
                } else {
                    lastStreamedDate = new Date(data[0].lastBroadcast.startedAt)

                    year = lastStreamedDate.getFullYear()
                    month = lastStreamedDate.getMonth() + 1
                    date = lastStreamedDate.getDate()

                    lastStreamedTime = lastStreamedDate.getTime() - currentDate.getTime();

                } return{
                    text:`${data[0].displayName} has been offline for ${bot.Utils.humanize(lastStreamedTime)}.`, reply:true
                };
                
            }

            streamStart = new Date(data[0].stream.createdAt)
            const uptime = streamStart.getTime() - currentDate.getTime();
            
            return {
                text: `${data[0].displayName} has been live for ${bot.Utils.humanize(uptime)}.`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};