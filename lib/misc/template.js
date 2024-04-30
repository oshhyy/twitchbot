module.exports = {
    name: "CHANGE THIS TO NAME OF COMMAND",
    cooldown: 3000,
    aliases: [],
    description: `- `,
    execute: async context => {
        try {
            // command code
            



            return {
                text: ``,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};