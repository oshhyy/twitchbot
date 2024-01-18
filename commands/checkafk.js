const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

function afkStatus(status){
    let res = 'currently AFK'
    if (status == 'gn') { res = 'currently sleeping' }
    if (status == 'brb') { res = 'going to be right back' }
    if (status == 'shower') { res = 'currently showering' }
    if (status == 'food') { res = 'currently eating' }
    if (status == 'lurk') { res = 'currently lurking' }
    if (status == 'poop' || status == '💩') { res = 'currently pooping' }
    if (status == 'work') { res = 'currently working' }
    if (status == 'study') { res = 'currently studying' }
    if (status == 'nap') { res = 'currently napping'}
    return res;
}

const config = require("../config.json");

module.exports = {
    name: "checkafk",
    cooldown: 3000,
    aliases: ["isafk"],
    description: `checkafk <username> - checks to see if a user is afk using supibot`,
    execute: async context => {
        try {
            // command code
            if(!context.message.args[0]) {
                return{
                    text:`usage: ${bot.Config.prefix}checkafk <username>`, reply:true
                }
            }

            let user = context.message.args[0]
            user = user.replace("@", "").toLowerCase()

            let data

            try {
                // twitchapi.checkAfk(user)
                data = await got(`https://supinic.com/api/bot/afk/check?username=${user}`, { headers: {
                        "Authorization": config.supiAuth
                    }}).json();
            } catch (err) {
                console.log(err)
                return{
                    text:`Error getting this user's afk status!`, reply:true
                }
            }

            console.log(data)

            if(data.data.status == null) {
                return {text:`The user ${user} is not afk.`, reply:true}
            }

            let currentDate = new Date();
            let givenDate = new Date(data.data.status.started);
            const durationInMs = givenDate.getTime() - currentDate.getTime();

            return {
                text: `User ${data.data.status.name} is ${afkStatus(data.data.status.status)}: ${data.data.status.text} (${bot.Utils.humanize(durationInMs)} ago)`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};