const got = require("got");
module.exports = {
    name: "nethers",
    cooldown: 3000,
    aliases: ["enters", "enter", "nether"],
    description: `nethers [minecraft-username] | shows amount of nethers + average for current session`,
    execute: async context => {
        try {
            // command code
            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getSessionNethers/?name=${name}&hours=16&hoursBetween=2`).json();
            } catch (err) {
                return {
                    text: `This user has no submitted runs in the last 16 hours!`, reply: true
                }
            }

            const count = netherData.count
            const average = netherData.avg
            
            return {
                text: `${bot.Utils.unping(name)}: ${count} Enters  (${average} avg)`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};