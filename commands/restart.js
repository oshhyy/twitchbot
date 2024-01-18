const { exec } = require("child_process"); 

module.exports = {
    name: "restart",
    cooldown: 3000,
    aliases: [],
    description: `restart - restarts the bot <admin only>`,
    execute: async context => {
        try {
            // command code
            const userInfo = await bot.db.users.findOne({username: context.user.login})
            if (!userInfo || userInfo.level < 4) {
                return { text: "You are not permitted to use this command! FailFish (level 4 required)", reply:true}
            }
            bot.Client.privmsg(context.channel.login, 'oshSpin Restarting...')
            await bot.Utils.sleep(1000)
            exec('cd /root/twitchbot && pm2 restart index.js')
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};