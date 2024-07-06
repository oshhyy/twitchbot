const got = require("got");
module.exports = {
    name: "broadcasternethers",
    cooldown: 3000,
    aliases: [],
    description: `AGAGAGA`,
    execute: async context => {
        try {
            // command code

            let name = context.message.args[0]?.replace("@", "") ?? context.channel.login;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getSessionNethers/?name=${name}&hours=999&hoursBetween=3`).json();
            } catch (err) {
                try{
                    name = context.channel.login;
                    netherData = await got(`https://paceman.gg/stats/api/getSessionNethers/?name=${name}&hours=999&hoursBetween=3`).json();
                } catch(err) {
                    return {}
                }
            }
            
            const count = netherData.count
            const average = netherData.avg
            let nph = ""
            if(netherData.rnph) {
                nph = ` • ${netherData.rnph} nph`
            }

            return {
                text: `${bot.Utils.unping(name)}: ${count} Enters (${average} avg${nph})`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};