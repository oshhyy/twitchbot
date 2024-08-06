const got = require("got");
module.exports = {
    name: "lastpace",
    cooldown: 3000,
    aliases: ["lastfort", "previouspace", "previousfort"],
    description: `lastpace [minecraft-username] | shows your last uploaded paceman run`,
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
            function isValidEntry(entry) {
                if (entry.hasOwnProperty('fortress') && entry.hasOwnProperty('bastion') &&
                    entry.fortress !== null && entry.bastion !== null) {
                  return entry.fortress > entry.bastion;
                }
                return false;
              }
              

            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=100`).json();
            } catch (err) {
                try{
                    name = context.channel.login;
                    netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=100`).json();
                } catch(err) {
                    return {
                        text: `User ${bot.Utils.unping(name)} does not have a paceman.gg profile!`, reply: true
                    }
                }
            }

            const n = netherData.slice().findIndex(isValidEntry);

            if(n == -1) {
                return {
                    text: `No pace was found for ${bot.Utils.unping(name)} in the last 100 nethers!`,
                    reply: true,
                }
            }

            const epochTimeInSeconds = netherData[n].time;
            const currentTimeInMilliseconds = new Date().getTime();
            const epochTimeInMilliseconds = epochTimeInSeconds * 1000;
            const timeDifferenceInMilliseconds = currentTimeInMilliseconds - epochTimeInMilliseconds;

            let start = bot.Utils.humanize(timeDifferenceInMilliseconds)
            console.log(start)

            let outputText = `Latest ${bot.Utils.unping(name)} Pace: (${start} ago) `
        
            if(netherData[n].nether) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].nether)} nether enter `)
            }

            if(netherData[n].fortress && netherData[n].bastion > netherData[n].fortress) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].fortress)} fort `)
                if(netherData[n].bastion) {
                    outputText = outputText.concat(`• ${msToTime(netherData[n].bastion)} bastion `)
                }
            } else if(netherData[n].bastion && netherData[n].bastion < netherData[n].fortress) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].bastion)} bastion `)
                if(netherData[n].fortress) {
                    outputText = outputText.concat(`• ${msToTime(netherData[n].fortress)} fort `)
                }
            }
            
            if(netherData[n].first_portal) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].first_portal)} first portal `)
            }

            if(netherData[n].stronghold) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].stronghold)} stronghold `)
            }

            if(netherData[n].end) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].end)} end enter `)
            }

            if(netherData[n].finish) {
                outputText = outputText.concat(`• ${msToTime(netherData[n].finish)} finish `)
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