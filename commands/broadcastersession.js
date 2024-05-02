const got = require("got");
module.exports = {
    name: "broadcastersession",
    cooldown: 3000,
    aliases: [],
    description: `session [minecraft-username] | shows splits + average for current day`,
    execute: async context => {
        try {
            // command code

            let name = context.channel.login;

            let sessionData;
            try {
                sessionData = await got(`https://paceman.gg/stats/api/getSessionStats/?name=${name}&hours=16&hoursBetween=3`).json();
            } catch (err) {
                return {}
            }

            let netherText = firstStructureText = secondStructureText = firstPortalText = strongholdText = endText = finishText = "";

            if(sessionData.nether.count != 0) {
                netherText = `• nethers: ${sessionData.nether.count} (${sessionData.nether.avg} avg)`
            } else {
                return {
                    text: `No data in the last 16 hours for ${bot.Utils.unping(name)}. FallCry`,
                    reply: true,
                };
            }

            if(sessionData.first_structure.count != 0) {
                firstStructureText = `• first structures: ${sessionData.first_structure.count} (${sessionData.first_structure.avg} avg)`
            }

            if(sessionData.second_structure.count != 0) {
                secondStructureText = `• second structures: ${sessionData.second_structure.count} (${sessionData.second_structure.avg} avg)`
            }

            if(sessionData.first_portal.count != 0) {
                firstPortalText = `• first portals: ${sessionData.first_portal.count} (${sessionData.first_portal.avg} avg)`
            }

            if(sessionData.stronghold.count != 0) {
                strongholdText = `• strongholds: ${sessionData.stronghold.count} (${sessionData.stronghold.avg} avg)`
            }

            if(sessionData.end.count != 0) {
                endText = `• end enters: ${sessionData.end.count} (${sessionData.end.avg} avg)`
            } 

            if(sessionData.finish.count != 0) {
                finishText = `• finishes: ${sessionData.finish.count} (${sessionData.finish.avg} avg)`
            } 
            
            return {
                text: `${bot.Utils.unping(name)} Session Stats: ${netherText} ${firstStructureText} ${secondStructureText} ${firstPortalText} ${strongholdText} ${endText} ${finishText}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};