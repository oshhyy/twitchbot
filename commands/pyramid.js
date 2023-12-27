module.exports = {
    name: "pyramid",
    cooldown: 15000,
    aliases: ['pyr'],
    description: `pyr <num> <emote|phrase> | https://bot.oshgay.xyz/util/pyramid`,
    execute: async context => {
        try {
            // command code

            if (context.user.id == '489223884') {
                message = context.message.args.slice(1).filter(x => !x.includes("delay:") && !x.includes("channel:"));

            }
            else {
                message = context.message.args.slice(1).filter(x => !x.includes("!") && !x.includes("|") && !x.includes("$") && !x.includes("*") && !x.includes("delay:") && !x.includes("channel:"));
            }

            let phrase = `${message.join(" ")} `


            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP && context.user.id != "489223884") {
                return {};
            }
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster && !context.message.params.channel) {
                return {
                    text:"I can't perform this command because I am not moderator or vip! forsenNOIDONTTHINKSO",reply:true
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
            let channel = context.message.params.channel ?? context.channel.login;
            
            if(context.message.params.channel) {
                if (context.user.id != '489223884') {
                    return { text:'You do not have permission to specify channel!', reply:true }
                }
            }

            if (phrase.charAt(0) == "+") {
                phrase = phrase.replace("+", "➕")
            }

            if(bot.Utils.regex.slurs.test(phrase) || bot.Utils.regex.tos.test(phrase) || bot.Utils.regex.racism.test(phrase)) {
                return{text:"Message contains banned phrase! elisBruh", reply:true};
            }

            console.log(context.message.args[0])
            for (let i = 1; i <= context.message.args[0] ; i++) {
                bot.Client.privmsg(channel, `. ${phrase.repeat(i)}`);
                await bot.Utils.sleep(delay)
            }

            for (let i = (context.message.args[0] - 1); i > 0; i--) {
                bot.Client.privmsg(channel, `. ${phrase.repeat(i)}`);
                await bot.Utils.sleep(delay)
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};