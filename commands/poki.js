module.exports = {
    name: "poki",
    cooldown: 15000,
    aliases: ['thankegg'],
    description: `pokiC - poki my queen pokiW ThankEgg`,
    execute: async context => {
        try {
            // command code
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP) {
                return {};
            }
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster) {
                return {
                    text: `I can't perform this command because I am not moderator or vip! forsenNOIDONTTHINKSO`, reply: true
                };
            }

            bot.Client.privmsg(context.channel.login, "ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow pokiWow pokiWow pokiWow pokiWow pokiWow pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow poki1 poki2 pokiW poki1 poki2 pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow poki3 poki1 poki2 poki3 poki4 pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow pokiW poki3 poki1 poki2 pokiW pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow poki1 poki2 poki3 poki1 poki2 pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow poki3 poki4 pokiW poki3 poki4 pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg pokiWow pokiWow pokiWow pokiWow pokiWow pokiWow pokiWow ThankEgg ");
            await bot.Utils.sleep(90);
            bot.Client.privmsg(context.channel.login, "ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ThankEgg ");
            

            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};