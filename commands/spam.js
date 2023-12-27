const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "spam",
    cooldown: 10000,
    aliases: [],
    description: `spam <num> <phrase> | SPAM IT LuL https://bot.oshgay.xyz/util/spam`,
    execute: async context => {
        try {
            // command code
            console.log(context.message.args.slice(0)) 
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP && context.user.id != "489223884") {
                return {};
            }
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasBroadcaster && !context.message.params.channel) {
                return {
                    text: `I can't perform this command because I am not moderator! forsenNOIDONTTHINKSO`, reply: true
                };
            }

            if (context.message.args.length == 0) {
                return {
                    text: `usage: +spam <number 1-100> <phrase> • Moderator/VIP only`, reply: true
                };
            }

            let delay = context.message.params.delay ?? 0;
            if (delay > 5000 && context.user.id != '489223884') {
                return{
                    text:"Delay can't be more than 5000ms (5 Seconds) oshDank",reply:true
                }
            }
            let channel = context.message.params.channel ?? context.channel.login;

            let phrase = ''
            let message = context.message.args.slice(1)

            if (context.user.id == '489223884') {
                message = message.filter(x => !x.includes("fill:") && !x.includes("delay:") && !x.includes("channel:") && !x.includes("p:") && !x.includes("ann:") && !x.includes("announce:"));
                if (context.message.args[0] > 100 ) {
                    delay = context.message.params.delay ?? 15;
                }
            }
            else {
                message = message.filter(x => !x.includes("!") && !x.includes("+") && !x.includes("|") && !x.includes("$") && !x.includes("*") && !x.includes("=") && !x.includes("fill:") && !x.includes("delay:") && !x.includes("channel:") && !x.includes("p:") && !x.includes("ann:") && !x.includes("announce:"));
                if (context.message.args[0] > 100 ) {
                    return {
                        text: `Maximum spam value is 100 NOIDONTTHINKSO`, reply: true
                    };
                }
            }
            
            if(context.message.params.fill) {
                let length = 0;
                let limit = 500;
                let result = [];
                while (length < limit) {
                    result.push(message.join(" "));
                    length += message.join(" ").length + 1;
                }
                phrase = result.slice(0, -1).join(" ");
            }
            else {
                phrase = `${message.join(" ")}`
            }
            
            if(context.message.params.channel) {
                if (context.user.id != '489223884') {
                    return { text:'You do not have permission to specify channel!', reply:true }
                }
            }

            if(bot.Utils.regex.slurs.test(phrase) || bot.Utils.regex.tos.test(phrase) || bot.Utils.regex.racism.test(phrase)) {
                return{text:"Message contains banned phrase! elisBruh", reply:true};
            }

            if(context.message.params.ann || context.message.params.announce) {
                if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasBroadcaster) {
                    return {
                        text: `You do not have permission do add an announcement parameter! oshDank`, reply: true
                    };
                }
                let channelSpamID = context.channel.id
                if(context.message.params.channel) {
                    const data = await got(`https://api.ivr.fi/v2/twitch/user?login=${context.message.params.channel}`).json();
                    if (!data[0]) {
                        return {
                            text:'Invalid Username! oshDank', reply:true
                        };
                    }
                    channelSpamID = data[0].id
                }
                for (let i = 0; i < context.message.args[0]; i++) {
                    twitchapi.announceMessage(channelSpamID, phrase)
                    await bot.Utils.sleep(delay)
                }
            } else if(!context.message.params.p) {
                for (let i = 0; i < context.message.args[0]; i++) {
                    bot.Client.privmsg(channel, `${phrase}`)
                    await bot.Utils.sleep(delay)
                }
            } else{
                for (let i = 0; i < context.message.args[0]; i++) {
                    bot.Client.say(channel, `${phrase}`)
                    await bot.Utils.sleep(delay)
                }
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};