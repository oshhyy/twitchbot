const got = require('got')
module.exports = {
    name: "cat",
    cooldown: 3000,
    aliases: ['meow'],
    description: `cat - gets a random image of a cat meow`,
    execute: async context => {
        try {
            // command code
            const cat = await got('https://api.thecatapi.com/v1/images/search').json()
            return { text: `${cat[0].url} CoolCat`, reply: true }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};