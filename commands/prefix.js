module.exports = {
    name: "prefix",
    cooldown: 3000,
    aliases: ["setprefix"],
    description: `prefix <new-prefix> | Sets the prefix of the bot in the current channel`,
    execute: async context => {
        try {
            const { prefix } = await bot.db.channels.findOne({id: context.channel.id});
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster) {
                return {text:`The current prefix in this channel is "${prefix}".`, reply:true};
            }

            if(!context.message.args[0]){
                return {text:`The current prefix in this channel is "${prefix}". To change this, do ${prefix}setprefix <new-prefix>`, reply:true};
            }


            const newPrefix = context.message.args.slice(0).join(" ");
            
            if (prefix == newPrefix) {
                return { text: `"The old prefix is the same as the new prefix!"`, reply: true } 
            }

            await bot.db.channels.updateOne({ id: context.channel.id},{ $set: { prefix: newPrefix } })

            return {
                text: `The prefix of this channel has been updated to "${newPrefix}".`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};