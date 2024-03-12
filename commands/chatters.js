const got = require("got");

module.exports = {
    name: "chatters",
    cooldown: 5000,
    aliases: ['chattercount'],
    description: `chatters [channel] | shows the number of chatters in specified/current channel`,
    execute: async context => {
        try {
            // command code
            let channel = context.message.args[0] ?? context.channel.login;
            channel = channel.replace('@','');
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
    
            const data = await got(`https://api.markzynk.com/twitch/chatters/${channel}/count`, {throwHttpErrors:false}).json();

            if (!data.count) {
                return {
                    text:'Invalid Username! oshDank', reply:true
                };
            }

            return{text:`there are ${data.count} chatters in ${channel}'s chat.`, return:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};