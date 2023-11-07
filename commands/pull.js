const { exec } = require("child_process"); 

module.exports = {
    name: "pull",
    cooldown: 3000,
    aliases: [],
    description: `pull - pulls changes from github <admin only>`,
    execute: async context => {
        try {
            // command code
            const userInfo = await bot.db.users.findOne({username: context.user.login})
            if (!userInfo || userInfo.level < 4) {
                return { text: "You are not permitted to use this command! FailFish (level 4 required)", reply:true}
            }
            bot.Client.privmsg(context.channel.login, 'oshSpin Pulling...')
            await bot.Utils.sleep(1000)
            exec('cd /root/twitchbot && git pull')
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};