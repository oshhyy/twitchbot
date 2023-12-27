module.exports = {
    name: "ping",
    cooldown: 10000,
    aliases: [],
    description: `ping | https://bot.oshgay.xyz/util/ping`,
    execute: async context => {
        try {
            const { performance } = require("perf_hooks");
            const t1 = performance.now();
            await bot.Client.ping(); 
            const t2 = performance.now();
            const latency =  (t2 - t1).toFixed(0);
            const botUptime = bot.Utils.humanize(process.uptime().toFixed(0) * 1000);
            const usage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const channels = (await bot.db.channels.find({ isChannel: true })).map(c => c.username);
            const nodeVersion = process.version;
            const { prefix } = await bot.db.channels.findOne({id: context.channel.id});

            return {
                text: `oshBleh 🏓 ${latency}ms • ${botUptime} uptime • ${channels.length} channels • ${usage}MB usage • node ${nodeVersion} • prefix: ${prefix}`,
                reply: true,
            };
            
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};