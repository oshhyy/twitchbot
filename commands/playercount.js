const got = require("got");

module.exports = {
    name: "playercount",
    cooldown: 5000,
    aliases: ['pc', 'players'],
    description: `playercount [channel] | shows current player count in mcsr ranked`,
    execute: async context => {
        try {
            // command code
            try {
            const rankedData = await got(`https://mcsrranked.com/api/live`, {throwHttpErrors:false}).json();
        } catch(err) {
            return {
                ext:'An API error occured. FallCry', reply:true
            };
        }

            return{text:`there are ${rankedData.data.players} players currently playing ranked.`, return:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};