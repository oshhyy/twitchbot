const got = require("got");
module.exports = {
    name: "ascii",
    cooldown: 3000,
    aliases: ['a'],
    description: `ascii <emote> - ascii arts a twitch emote`,
    execute: async context => {
        try {
            // command code
            let m = context.message.args.join(" ");
            
            let h = m.split('#');
            let c = context.channel.login;
            if (h.length > 1 && !/\\s/.test(h[h.length - 1])){ c = h.pop() }
            let data = await got(`https://fun.joet.me/ascii?q=${encodeURIComponent(h.join('#'))}&c=${(c)}&e=${encodeURIComponent(JSON.stringify(context.emotes))}`).json()
            console.log(data)
            if (!data.ok) {
                return {
                    text: "An error occurred getting the ASCII for this query.", reply: true
                }
            }

            return {
                text: `.me ${data.msg}`, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};