const got = require("got");
const humanize = require('humanize-duration');
module.exports = {
    name: "session",
    cooldown: 3000,
    aliases: ["sessionstats", "pacestats", "pacemanstats", "today"],
    description: `session [minecraft-username] | shows splits + average for current day`,
    execute: async context => {
        try {
            // command code
            function humanizeNoHours(seconds) {
                const options = {
                    language: "shortEn",
                    languages: {
                        shortEn: {
                            y: () => "y",
                            mo: () => "mo",
                            w: () => "w",
                            d: () => "d",
                            h: () => "h",
                            m: () => "m",
                            s: () => "s",
                            ms: () => "ms",
                        },
                    },
                    units: ["h", "m", "s"],
                    largest: 3,
                    round: true,
                    conjunction: "",
                    spacer: "",

                }
                return humanize(seconds, options);
            }

            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;

            let sessionData;
            let nphData;
            try {
                sessionData = await got(`https://paceman.gg/stats/api/getSessionStats/?name=${name}&hours=999&hoursBetween=3`).json();
                nphData = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=99999&hoursBetween=3`, { throwHttpErrors: false }).json();
                netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=1`).json();
            } catch (err) {
                try {
                    name = context.channel.login;
                    sessionData = await got(`https://paceman.gg/stats/api/getSessionStats/?name=${name}&hours=999&hoursBetween=3`).json();
                    nphData = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=99999&hoursBetween=3`, { throwHttpErrors: false }).json();
                    netherData = await got(`https://paceman.gg/stats/api/getRecentRuns/?name=${name}&hours=99999&limit=1`, { throwHttpErrors: false }).json();
                } catch (err) {
                    return {
                        text: `User ${bot.Utils.unping(name)} does not have a paceman.gg profile!`, reply: true
                    }
                }
            }

            let netherText = firstStructureText = secondStructureText = firstPortalText = strongholdText = endText = finishText = "";

            if (sessionData.nether.count != 0) {
                netherText = `• nethers: ${sessionData.nether.count} (${sessionData.nether.avg} avg, ${nphData.rnph} nph, ${nphData.rpe.toFixed(0)} rpe)`
            } else {
                return {
                    text: `No session data found for ${bot.Utils.unping(name)}. FallCry`,
                    reply: true,
                };
            }

            if (sessionData.first_structure.count != 0) {
                firstStructureText = `• first structures: ${sessionData.first_structure.count} (${sessionData.first_structure.avg} avg)`
            }

            if (sessionData.second_structure.count != 0) {
                secondStructureText = `• second structures: ${sessionData.second_structure.count} (${sessionData.second_structure.avg} avg)`
            }

            if (sessionData.first_portal.count != 0) {
                firstPortalText = `• first portals: ${sessionData.first_portal.count} (${sessionData.first_portal.avg} avg)`
            }

            if (sessionData.stronghold.count != 0) {
                strongholdText = `• strongholds: ${sessionData.stronghold.count} (${sessionData.stronghold.avg} avg)`
            }

            if (sessionData.end.count != 0) {
                endText = `• end enters: ${sessionData.end.count} (${sessionData.end.avg} avg)`
            }

            if (sessionData.finish.count != 0) {
                finishText = `• finishes: ${sessionData.finish.count} (${sessionData.finish.avg} avg)`
            }

            const epochTimeInSeconds = netherData[0].time;
            const currentTimeInMilliseconds = new Date().getTime();
            const epochTimeInMilliseconds = epochTimeInSeconds * 1000;
            const timeDifferenceInMilliseconds = currentTimeInMilliseconds - epochTimeInMilliseconds;

            let start = bot.Utils.humanize(timeDifferenceInMilliseconds).match(/(\d+)h/g)
            let startText = ""
            if(start != null) {
                startText = ` ${start} ago`
            }

            return {
                text: `${bot.Utils.unping(name)} Session Stats (${humanizeNoHours(nphData.playtime + nphData.walltime).replace(/,\s/g, "")},${startText}): ${netherText} ${firstStructureText} ${secondStructureText} ${firstPortalText} ${strongholdText} ${endText} ${finishText}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};