const got = require("got");
module.exports = {
    name: "mostused",
    cooldown: 3000,
    aliases: ["7tvstats", "mostusedemotes", "topemotes"],
    description: `mostused <7tv emote> https://osh-1.gitbook.io/osh_______/7tv/mostused`,
    execute: async context => {
        try {
            let message = '';
            let user = '';
            console.log(user)
            user
            if (!context.message.args[0]) {
                user = `c/${context.channel.login}`
            }
            else {
                user = `c/${context.message.args[0].replace('@', '').replace('#', '')}`
                if (context.message.args[0].includes('/')) {
                    return {
                        text: 'Invalid Username! oshDank', reply: true
                    };
                }
            }

            if (context.message.args[0] == '#top') { user = 'top' }

            let data;
            try {
                data = await got(`https://7tv.markzynk.com/${user}`).json()
            } catch (err) {
                return {
                    text: `Either no 7tv emotes are enabled in this channel, or their usage statistics haven't been tracked yet oshDank`, reply: true
                }
            }

            if (!data) {
                return {
                    text: 'Invalid Username! oshDank', reply: true
                };
            } if (data.success == false) {
                return {
                    text: 'No emotes found for this channel.', reply: true
                };
            }

            let emoteName

            message = `top 5 7tv emotes in #${data.user?.twitch_username ?? user}`
            for (let i = 0; i < 5; i++) {
                emoteName = data.emotes[i].alias ?? data.emotes[i].name
                message = message.concat(` • ${emoteName} (${data.emotes[i].count.toLocaleString()})`)
            }

            return {
                text: message,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};