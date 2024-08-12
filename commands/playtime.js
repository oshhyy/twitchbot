const got = require("got");
const humanize = require('humanize-duration');
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "playtime",
    cooldown: 3000,
    aliases: ['rankedplaytime'],
    description: `lastmatch [minecraft-username] | provides stats for the last played ranked match in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function badgeIcon(badge) {
                if (badge == 1) {return "◇ "}
                if (badge == 2) {return "◈ "}
                if (badge == 3) {return "❖ "}
                return " "
            }
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
                        return { text: mojangData.errorMessage, reply: true }
                    }
                    mcUUID = mojangData.id
                }
            }

            let mcsrData;
            let rankedText = ""
            mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}/`, { throwHttpErrors: false }).json();
            if(mcsrData.status != "error") {
                const playtimeTotal = humanizeNoHours(mcsrData.data.statistics.total.playtime.ranked)
                const playtimeSeason = humanizeNoHours(mcsrData.data.statistics.season.playtime.ranked)
                rankedText = `Ranked Playtime: ${playtimeSeason.replace(/,\s/g, "")} this season, ${playtimeTotal.replace(/,\s/g, "")} total`
            }

            let name = context.message.args[0]?.replace("@", "") ?? context.user.login;
            let data;
            let rsgText = ""
            data = await got(`https://paceman.gg/stats/api/getNPH/?name=${name}&hours=999&hoursBetween=3`, { throwHttpErrors: false }).json();
            if(!data.error) {
                const playtime = humanizeNoHours(data.playtime + data.walltime)
                const resets = data.totalResets.toLocaleString()
                rsgText = `RSG Playtime: ${playtime.replace(/,\s/g, "")} w/o nethers, ${resets} resets •`
            }

            if(rankedText == "" && rsgText == "") {
                return{text: `This user has not played any RSG or Ranked. PoroSad`, reply: true}
            }


            return{text: `${bot.Utils.unping(name)} ${rsgText} ${rankedText}`, reply: true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
            
        }
    },
};