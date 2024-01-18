module.exports = {
    name: "suggest",
    cooldown: 10000,
    aliases: ["suggestion"],
    description: `suggest <msg> - suggest something :)`,
    execute: async context => {
        try {
            // command code

            bot.Webhook.suggest(context.user.login, context.message.args.join(' '))

            return {
                text: `Suggestion saved! FeelsOkayMan`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};