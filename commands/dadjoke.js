const got = require("got");
module.exports = {
    name: "dadjoke",
    cooldown: 5000,
    aliases: ['dj', 'joke'],
    description: `dadjoke`,
    execute: async context => {
        try {
            // command code
            const { joke } = await got("https://icanhazdadjoke.com/").json()
            return {
                text: `${joke} elisLUL`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};