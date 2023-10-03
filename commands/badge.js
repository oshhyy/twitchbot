const got = require("got");

module.exports = {
    name: "badge",
    cooldown: 3000,
    aliases: ['badges'],
    description: `badge <username> - gets badge name of user as well as `,
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

            let badgeName = data[0].badges.map(x=>x.title).join(', ')
            let badgeDescription = data[0].badges.map(x=>x.description).join(', ')
            let badgeID = data[0].badges.map(x=>x.setID).join(', ')

            if (!badgeName) {
                return {
                    text: `user ${user} has no badge applied!`,
                    reply: true,
                };
            }

            return {
                text: `applied vanity badge for ${user}: ${badgeName} • description: ${badgeDescription} (id: ${badgeID})`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};