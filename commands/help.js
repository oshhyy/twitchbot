module.exports = {
    name: "help",
    cooldown: 3000,
    aliases: [],
    description: `help <command name> - shows information about commands and how to use them`,
    execute: async context => {
        try {
            const commandName = context.message.args[0];
            const prefix = context.channel.prefix
            
            if (!commandName) {
                return { text: `type "${prefix}help <command name>" t󠀀o get help for a certain command. t󠀀o see a list of commands, type "${prefix}commands"`, reply: true } 
            }

            const command = bot.Command.get(commandName); 
            if (!command){
                return {text: `This command does not exist! oshDank`, reply: true,};
            }
            return {
                text: `usage: ${prefix}${command.description}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};