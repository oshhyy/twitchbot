const got = require("got");
module.exports = {
    name: "lastnether",
    cooldown: 3000,
    aliases: ["lastenter", "previousenter", "previousnether"],
    description: `lastnether [minecraft-username] | shows your last uploaded paceman run`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0) + '.' + pad(s % 1000, 3);
            }

            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getRecentTimestamps/?name=${name}&limit=1`).json();
            } catch (err) {
                try{
                    name = context.channel.login;
                    netherData = await got(`https://paceman.gg/stats/api/getRecentTimestamps/?name=${name}&limit=1`).json();
                } catch(err) {
                    return {
                        text: `User ${bot.Utils.unping(name)} does not have a paceman.gg profile!`, reply: true
                    }
                }
            }

            let outputText = `Latest PaceMan Run: "${netherData.runName}" `
        
            if(!netherData[0].nether) {
                outputText = outputText.concat(`• nether enter: ${msToTime(netherData[0].nether)}`)
            }

            
            return {
                text: `${outputText}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};