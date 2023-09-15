module.exports = {
    name: "hug",
    cooldown: 3000,
    aliases: [],
    description: `hug <username> [emote] - hug someone 🫂`,
    execute: async context => {
        try {
            // command code
                
            if (!context.message.args[0]) {
                return {
                    text:"Enter a user t󠀀o hug elisFail",reply:true
                };
            }
            if (context.message.args[0] == context.user.login || context.message.args[0] == context.user.login) {
                return {
                    text:`${context.user.login} hugs themself veiDespair`,reply:false
                };
            }
            if (!context.message.args[1]) context.message.args[1] = 'elisHug';
            return {
                text:`${context.user.login} hugs ${context.message.args[0]} ${context.message.args[context.message.args.length - 1]}`,reply:false
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};