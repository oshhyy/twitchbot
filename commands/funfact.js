const got = require('got')
const config = require("../config.json");

module.exports = {
    name: "funfact",
    cooldown: 5000,
    aliases: ["fact"],
    description: `fact - i yoinked this command from val ty val xd`,
    execute: async context => {
        try {
            // command code
            const apiKey = config.apiNinjasKey;

            const data = await got(`https://api.api-ninjas.com/v1/facts`, {headers: {'X-Api-Key': apiKey}}).json()
            return { text: `${data[0].fact} :)`, reply: true }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};