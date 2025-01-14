const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "color",
    cooldown: 15000,
    aliases: ['colour'],
    description: `color [username/hexcode] | gets chat color for given user or hex code`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login;
            user = user.replace('@','');
            let color;
            let delay;
            let data;

            if(!ModeratorOf.includes(context.channel.id)) {
                delay = 1000
            } else {
                delay = 0
            }

            if (!context.message.args[0]) {
                color = context.user.colorRaw.replace('#',"")
                console.log(color)
            }
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! oshDank', reply:true
                    };
                }

                if (context.message.args[0].startsWith('#')) {
                    color = context.message.args[0].replace('#',"")
                }
                else {
                    data = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
                    
                    if (!data[0]) {
                        return{
                            text:'Invalid Username/Hex Code! To use hex codes, make sure the code starts with # oshDank', reply:true
                        };
                    }
                    if (data[0].chatColor == null) {
                        return {
                            text:"That user doesn't not have a chat color! WutFace graynames", reply:true
                        }
                    }
                    color = data[0].chatColor.replace('#',"")
                }
            }

            
            const encodedUser = encodeURIComponent(`#${color}`)
            await twitchapi.changeColor(encodedUser)
            const colorAPI = await got(`https://www.thecolorapi.com/id?hex=${color}`).json();
            await bot.Utils.sleep(1000)
            
            bot.Client.sendRaw(`@reply-parent-msg-id=${context.message.id} PRIVMSG #${context.channel.login} :/me • color for ${user}: ${colorAPI.name.value} • █████████████ • #${color}`)
            
            // await bot.Utils.sleep(1000)
            // const encodedBot = encodeURIComponent(botColor)
            // twitchapi.changeColor(encodedBot)

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};