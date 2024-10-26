const got = require("got");

module.exports = {
    name: "si",
    cooldown: 5000,
    aliases: ['streaminfo'],
    description: `si [channel] | shows a channel's stream info`,
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

            if (user == "oshhyy") {
                return {
                    text:'NOIDONTTHINKSO', reply:true
                };
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
                        text:`${data[0].displayName} is offline, and they have never streamed before. FeelsBadMan`, reply:true
                    };
                } else {
                    lastStreamedDate = new Date(data[0].lastBroadcast.startedAt)

                    year = lastStreamedDate.getFullYear()
                    month = lastStreamedDate.getMonth() + 1
                    date = lastStreamedDate.getDate()

                    lastStreamedTime = lastStreamedDate.getTime() - currentDate.getTime();

                } return{
                    text:`${data[0].displayName} is offline. FeelsBadMan They last streamed on ${year}-${month}-${date} (${bot.Utils.humanize(lastStreamedTime)} ago) at twitch.tv/${user} • Last Title: ${data[0].lastBroadcast.title} `, reply:true
                };
                
            }
            
            let game = data[0].stream.game?.displayName
            console.log(game)
            if (game == undefined) {
                game = "<no category>"
            }

            streamStart = new Date(data[0].stream.createdAt)
            const uptime = streamStart.getTime() - currentDate.getTime();
            
            return {
                text: `${data[0].displayName} is live playing ${game} to ${data[0].stream.viewersCount} viewers at twitch.tv/${user} PogBones • Current Title: ${data[0].stream.title} • They have been live for ${bot.Utils.humanize(uptime)}.`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};