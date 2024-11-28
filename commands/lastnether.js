const got = require("got");
module.exports = {
    name: "lastnether",
    cooldown: 3000,
    aliases: ["lastenter", "previousenter", "previousnether"],
    description: `lastnether [minecraft-username] | shows your last uploaded paceman run`,
    execute: async context => {
        try {
            // command code
            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=1`).json();
            } catch (err) {
                try{
                    name = context.channel.login;
                    netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=1`).json();
                } catch(err) {
                    return {
                        text: `User ${bot.Utils.unping(name)} does not have a paceman.gg profile!`, reply: true
                    }
                }
            }

            const epochTimeInSeconds = netherData[0].time;
            const currentTimeInMilliseconds = new Date().getTime();
            const epochTimeInMilliseconds = epochTimeInSeconds * 1000;
            const timeDifferenceInMilliseconds = currentTimeInMilliseconds - epochTimeInMilliseconds;

            let start = bot.Utils.humanize(timeDifferenceInMilliseconds)
            console.log(start)

            let outputText = `Latest ${bot.Utils.unping(name)} PaceMan Run: (${start} ago) `
        
            if(netherData[0].nether) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].nether)} nether enter `)
            }

            if(netherData[0].fortress && netherData[0].bastion > netherData[0].fortress) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].fortress)} fort `)
                if(netherData[0].bastion) {
                    outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].bastion)} bastion `)
                }
            } else if(netherData[0].bastion && netherData[0].bastion < netherData[0].fortress) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].bastion)} bastion `)
                if(netherData[0].fortress) {
                    outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].fortress)} fort `)
                }
            }
            
            if(netherData[0].first_portal) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].first_portal)} first portal `)
            }

            if(netherData[0].stronghold) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].stronghold)} stronghold `)
            }

            if(netherData[0].end) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].end)} end enter `)
            }

            if(netherData[0].finish) {
                outputText = outputText.concat(`• ${bot.Utils.msToTime(netherData[0].finish)} finish `)
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