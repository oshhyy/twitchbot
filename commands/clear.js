const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')
module.exports = {
    name: "clear",
    cooldown: 15000,
    aliases: [],
    description: `clear <i:number> - clears the chat i times (MODERATOR ONLY) - default is 100, max is 500`,
    execute: async context => {
        try {
            // command code

            
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster) {
                return {};
            }
            if(!ModeratorOf.includes(context.channel.id)) {
                return {
                    text: `I can't perform this command because I am not moderator! NOIDONTTHINKSO`, reply: true
                };
            }

            const amount = context.message.params.i ?? 100;

            if(amount > 2000) {
                return {text: `Max amount of clear is 2000! NOIDONTTHINKSO`, return:true}
            }

            if(amount < 25) {
                return {text: `Min amount of clear is 25! NOIDONTTHINKSO`, return:true}
            }

            for (let i = 0; i < amount; i++)
            twitchapi.clearChat(context.channel.id)
            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};