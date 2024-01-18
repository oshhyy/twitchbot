const got = require("got");
module.exports = {
    name: "pfp",
    cooldown: 3000,
    aliases: ['profilepic', 'profilepicture', 'avatar', 'useravatar'],
    description: `pfp [username] - gets the link to a person's twitch profile picture`,
    execute: async context => {
        try {
            // command code
            const user = context.message.args[0] ?? context.user.login;
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! oshDank', reply:true
                    };
                }
            }
    
            const data = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();

            if (!data[0]) {
                return {
                    text:'Invalid Username! oshDank', reply:true
                };
            }

            const pfp = data[0].logo
            return {
                text: `${user}'s profile picture is ${pfp}`,
                reply: true,
            };

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};