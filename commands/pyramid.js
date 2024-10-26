const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "pyramid",
    cooldown: 15000,
    aliases: ['pyr'],
    description: `pyr <num> <emote|phrase> | makes a pyramid in chat`,
    execute: async context => {
        try {
            // command code

            if (context.user.id == '489223884') {
                message = context.message.args.slice(1).filter(x => !x.includes("delay:"));

            }
            else {
                message = context.message.args.slice(1).filter(x => !x.includes("!") && !x.includes("|") && !x.includes("$") && !x.includes("*") && !x.includes("delay:"));
            }

            let phrase = `${message.join(" ")} `


            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && context.user.id != "489223884") {
                return {};
            }
            if(!ModeratorOf.includes(context.channel.id)) {
                return {
                    text:"I can't perform this command because I am not moderator! buh",reply:true
                };
            }

            let messageLength = phrase.length * context.message.args[0]
            let maxMessageLength = 0
            let count = 0

            if (messageLength > 500) {
                for (let i = 0; i < 500; i += phrase.length) {
                    count++
                }
                return {
                    text:`Maximum pyramid size for this phrase is ${count} NOIDONTTHINKSO`,reply:true
                };
            }
            if (context.message.args[0]  < 3) {
                return {
                    text:"Minimum pyramid size is 3 NOIDONTTHINKSO",reply:true
                };
            }

            let delay = context.message.params.delay ?? 35;

            if (phrase.charAt(0) == "+") {
                phrase = phrase.replace("+", "➕")
            }

            if(bot.Utils.regex.slurs.test(phrase) || bot.Utils.regex.tos.test(phrase) || bot.Utils.regex.racism.test(phrase)) {
                return{text:"Message contains banned phrase! elisBruh", reply:true};
            }

            console.log(context.message.args[0])
            for (let i = 1; i <= context.message.args[0] ; i++) {
                twitchapi.sendMessage(context.channel.id, `. ${phrase.repeat(i)}`)
                await bot.Utils.sleep(delay)
            }

            for (let i = (context.message.args[0] - 1); i > 0; i--) {
                twitchapi.sendMessage(context.channel.id, `. ${phrase.repeat(i)}`)
                await bot.Utils.sleep(delay)
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};