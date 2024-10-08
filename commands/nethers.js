const got = require("got");
module.exports = {
    name: "nethers",
    cooldown: 3000,
    aliases: ["enters", "enter", "nether", "nph", "avg", "rpe"],
    description: `nethers [minecraft-username] | shows amount of nethers + average for current session`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                
                var minutes = Math.floor(s / 60000);
                var seconds = Math.floor((s % 60000) / 1000); 
                var milliseconds = s % 1000;
                
                return pad(minutes) + ':' + pad(seconds);
            }

            let name = ''
            let hours = 999 
            let hoursBetween = 3

            if(context.message.args.length == 3) {
                name = context.message.args[0]?.replace("@", "")
                hours = context.message.args[1]
                hoursBetween = context.message.args[2]
            } else if (context.message.args.length == 2) {
                name = context.user.login
                hours = context.message.args[0]
                hoursBetween = context.message.args[1]
            } else if (context.message.args.length == 1)  {
                name = context.message.args[0]
            } else {name = context.user.login}
            
            let data;
            try {
                data = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=${hours}&hoursBetween=${hoursBetween}`).json();
            } catch (err) {
                try{
                    name = context.channel.login;
                    data = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=${hours}&hoursBetween=${hoursBetween}`).json();
                } catch(err) {
                    return {}
                }
            }
            
            const count = data.count
            const average = msToTime(data.avg.toFixed(0))
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