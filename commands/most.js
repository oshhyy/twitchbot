const got = require("got");
module.exports = {
    name: "most",
    cooldown: 3000,
    aliases: ["more"],
    description: `most | returns the most`,
    execute: async context => {
        try {
            // command code
            return {
                text: `the most: @${context.user.login}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};