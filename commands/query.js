const config = require("../config.json");
const got = require('got')
module.exports = {
    name: "query",
    cooldown: 5000,
    aliases: ['q', 'question', 'ask', 'wa', 'wolframalpha', 'wolfram'],
    description: `query <query> - Wolfram|Alpha query`,
    execute: async context => {
        try {
            // command code
            const key = config.wolframAlphaKey
            
            if (!context.message.args.length) return { text: 'Please enter a query! oshDank', reply: true}

            const { body: res } = await got(`https://api.wolframalpha.com/v1/result`,
                {
                    throwHttpErrors: false,
                    searchParams: {
                        appid: key,
                        i: context.message.args.join(' ')
                    }
                })

            return {
                text: res,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};