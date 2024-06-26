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
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0) + '.' + pad(s % 1000, 3);
            }
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
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}/`).json();
            } catch (err) {
                return {
                    text: `This username is not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            const playtimeTotal = humanizeNoHours(mcsrData.data.statistics.total.playtime.ranked)
            const playtimeSeason = humanizeNoHours(mcsrData.data.statistics.season.playtime.ranked)
            let badge = badgeIcon(mcsrData.data.roleType)

            return{text: `${badge} ${bot.Utils.unping(mcsrData.data.nickname)} has played ${playtimeSeason} of ranked this season, and ${playtimeTotal} in total.`, reply: true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
            
        }
    },
};