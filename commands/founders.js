const got = require("got");
module.exports = {
    name: "founders",
    cooldown: 3000,
    aliases: ['founder'],
    description: `founders <channel> - shows list of founders of specific channel`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.channel.login;
            user = user.toLowerCase().replace("@", "")
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! oshDank', reply:true
                    };
                }
            }
            
            const data = await got(`https://api.ivr.fi/v2/twitch/founders/${user}`, {throwHttpErrors:false}).json();
            if (!data.statusCode) {}
            else {
                if (data[0].error.message = 'Specified user has no founders') {
                    return{text: 'Specified user has no founders! oshDank'}
                }
                return {
                    text:'Invalid Username! oshDank', reply:true
                };
            }

            let founderList = [];
            let founderName

            for (const element of data.founders) {
                console.log(founderList)
                founderName = element.login
                founderList.push(founderName.slice(0, 3) + "󠀀" + founderName.slice(3))
            }

            return {
                text: `list of founders for ${user}: ${founderList.join(', ')}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};