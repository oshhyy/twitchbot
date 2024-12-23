const got = require("got");
module.exports = {
    name: "broadcasternethers",
    cooldown: 3000,
    aliases: [],
    description: `AGAGAGA`,
    execute: async context => {
        try {
            // command code

            let name = ''
            let hours = 999 
            let hoursBetween = 3

            if(context.message.args.length == 3) {
                name = context.message.args[0]?.replace("@", "")
                hours = context.message.args[1]
                hoursBetween = context.message.args[2]
            } else if (context.message.args.length == 2) {
                name = context.channel.login
                hours = context.message.args[0]
                hoursBetween = context.message.args[1]
            } else if (context.message.args.length == 1)  {
                name = context.message.args[0]
            } else {name = context.channel.login}

            let data;
            try {
                data = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=${hours}&hoursBetween=${hoursBetween}`).json();
            } catch (err) {
                return {}
            }
            
            const count = data.count
            const average = bot.Utils.msToTime(data.avg.toFixed(0), 1)
            const nph = data.rnph
            const rpe = data.rpe.toFixed(0)

            return {
                text: `${bot.Utils.unping(name)}: ${count} Session Enters (${average} avg, ${nph} nph, ${rpe} rpe)`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};