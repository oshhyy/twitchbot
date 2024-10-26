module.exports = {
    name: "commands",
    cooldown: 3000,
    aliases: ['cmds', 'cmnds'],
    description: `commands - shows a list of all commands`,
    execute: async context => {
        try {
            const commands = []; 
            bot.Command.Commands.forEach((command) => commands.push(command.name))
            const channelData = await bot.db.channels.findOne({ id: msg.channelID });
            const prefix = channelData?.prefix ?? '+';
            
            return {
                text: `prefix: ${prefix} • command list: https://bot.osh.gay/`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};