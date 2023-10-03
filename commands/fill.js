module.exports = {
    name: "fill",
    cooldown: 15000,
    aliases: [],
    description: `fill <emote> - fills an emote in the bot's chat message`,
    execute: async context => {
        try {
            // command code
            
            if (context.message.args.slice(0) == '') {
                return{
                    text: `Enter a phrase/emote t󠀀o be filled oshDank`, reply: true
                };
            }
            
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster) {
                fillLimit = 300;
            }
            else {
                fillLimit = 500;
            }
            
            console.log(context.message.args.slice(0))
            let fillMessage = ''
            let base = context.message.args.slice(0).join(" ");

            if (base.charAt(0) == "+") {
                base = base.replace("+", "➕")
            }

            while (fillMessage.length + base.length + 1< fillLimit) fillMessage += ' ' + base.repeat(1);

            return{text:`. ${fillMessage}`, reply:false}
            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};