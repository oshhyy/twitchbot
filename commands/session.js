const got = require("got");
module.exports = {
    name: "session",
    cooldown: 3000,
    aliases: ["sessionstats", "pacestats", "pacemanstats"],
    description: `session [minecraft-username] | shows splits + average for current day`,
    execute: async context => {
        try {
            // command code
            let userData, mcUUID
            if (!context.message.args[0]) {
                userData = await bot.db.users.findOne({ id: context.user.id })
                mcUUID = userData?.mcid
                if (!mcUUID) {
                    return { text: `No MC username provided! To link your account, do '+link mc <username>'`, reply: true }
                }
            } else {
                if (context.message.args[0]?.startsWith("@")) {
                    userData = await bot.db.users.findOne({ username: context.message.args[0].replace("@", "") })
                    mcUUID = userData?.mcid
                    if (!mcUUID) {
                        return { text: `This user does not have a linked mc account!`, reply: true }
                    }

                } else {
                    let mojangData;
                    mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                    if (mojangData.errorMessage) {
                        return { text: `Mojang Error: ${mojangData.errorMessage} FallCry`, reply: true }
                    }
                    mcUUID = mojangData.id
                }
            }


            let mcNameData;
            try {
                mcNameData = await got(`https://sessionserver.mojang.com/session/minecraft/profile/${mcUUID}`).json();
            } catch (err) {
                return {
                    text: `Error getting Name data. FallCry`, reply: true
                }
            }

            let mcName = mcNameData.name;

            let sessionData;
            try {
                sessionData = await got(`https://paceman.gg/stats/api/getSessionStats/?name=${mcName}&hours=16&hoursBetween=3`).json();
            } catch (err) {
                return {
                    text: `This user has no submitted runs!`, reply: true
                }
            }

            let netherText = firstStructureText = secondStructureText = firstPortalText = strongholdText = endText = finishText = "";

            if(sessionData.nether.count != 0) {
                netherText = `• nethers: ${sessionData.nether.count} (${sessionData.nether.avg} avg)`
            } else {
                return {
                    text: `No data in the last 24 hours for ${bot.Utils.unping(mcNameData.name)}. FallCry`,
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
                text: `${bot.Utils.unping(mcNameData.name)} Session Stats: ${netherText} ${firstStructureText} ${secondStructureText} ${firstPortalText} ${strongholdText} ${endText} ${finishText}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};