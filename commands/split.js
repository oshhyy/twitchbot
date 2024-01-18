module.exports = {
    name: "split",
    cooldown: 10000,
    aliases: [],
    description: `split <num> <phrase> | https://bot.oshgay.xyz/util/split`,
    execute: async context => {
        try {
            // command code
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP) {
                return {};
            }

            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster) {
                return {
                    text: `I can't perform this command because I am not mod or vip! forsenNOIDONTTHINKSO`, reply: true
                };
            }
                
            if (context.message.args.slice(0).length > 100) {
                return {
                    text:"Maximum split size is 100 NOIDONTTHINKSO",reply:true
                };
            }
    
            let phrase = context.message.args.slice(0)
            phrase = phrase.filter(x => !x.includes("!") && !x.includes("|") && !x.includes("$") && !x.includes("*"));

            if(bot.Utils.regex.slurs.test(phrase) || bot.Utils.regex.tos.test(phrase) || bot.Utils.regex.racism.test(phrase)) {
                return{text:"Message contains banned phrase! elisBruh", reply:true};
            }

            for (let split of phrase) {
                if (split.charAt(0) == "+") {
                    split = split.replace("+", "➕")
                }
                bot.Client.privmsg(context.channel.login, `. ${split}`);
                await new Promise(r=> setTimeout(r, 20));
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};