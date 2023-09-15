module.exports = {
    name: "eval",
    cooldown: 3000,
    aliases: ["js"],
    description: `eval - evaluates javascript code directly in the bot, requires level 3 (thanks to kattah for giving me this code :) )`,
    execute: async context => {
        try {
            const userInfo = await bot.db.users.findOne({username: context.user.login})
            if (!userInfo || userInfo.level < 3) {
                return { text: "You are not permitted to use this command! FailFish (level 3 required)", reply:true}
            }


            let ev;
            if (context.message.args[0].startsWith('http')) {
                const res = await got(context.message.args[0]);
        
                ev = await eval('(async () => {' + res.body.replace(/„|“/gm, '"') + '})()');
            } else {
                ev = await eval('(async () => {' + context.message.args.join(' ').replace(/„|“/gm, '"') + '})()');
            }

            if (!ev) return null;
                return { text: String(ev), reply: false };

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};
