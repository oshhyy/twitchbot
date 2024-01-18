module.exports = {
    name: "tuck",
    cooldown: 3000,
    aliases: [],
    description: `tuck <user> [emote] - tuck someone into bed HypeSleep`,
    execute: async context => {
        try {
            // command code

            if (!context.message.args[0]) {
                return {
                    text:`Enter a user to tuck elisFail`, reply:true
                };
            }
            if (!context.message.args[1]) context.message.args[1] = 'FeelsOkayMan';
            return {
                text: `${context.user.login} tucks ${context.message.args[0]} to bed ${context.message.args[context.message.args.length - 1]} 👉 HypeSleep`,
                reply: false,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};