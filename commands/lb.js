const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "lb",
    cooldown: 3000,
    aliases: ['leaderboard', 'rankedleaderboard', 'rankedlb'],
    description: `lb [type] | outputs current leaderboard for MCSR Ranked. elo lb is outputted by default, but time leaderboard can also be outputted with the "record" type. to view the previous season's elo leaderboard, add "-ls" to the end of the command`,
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
            function predictedPhase(phase, rank) {
                if (phase == 1) {
                    if(rank == 1) return 50
                    if(rank == 2) return 40
                    if(rank == 3) return 35
                    if(rank == 4) return 30
                    if(rank <= 8) return 25
                    if(rank <= 16) return 20
                    if(rank <= 32) return 15
                    if(rank <= 50) return 10
                    if(rank <= 100) return 5
                } else if (phase == 2) {
                    if(rank == 1) return 60
                    if(rank == 2) return 50
                    if(rank == 3) return 40
                    if(rank == 4) return 35
                    if(rank <= 8) return 30
                    if(rank <= 16) return 25
                    if(rank <= 32) return 20
                    if(rank <= 50) return 15
                    if(rank <= 100) return 10
                } else if (phase == 3) {
                    if(rank == 1) return 75
                    if(rank == 2) return 65
                    if(rank == 3) return 55
                    if(rank == 4) return 50
                    if(rank <= 8) return 40
                    if(rank <= 16) return 30
                    if(rank <= 32) return 20
                    if(rank <= 50) return 15
                    if(rank <= 100) return 10
                } else return 0
            }

            let lbType = ""
            let lbSeason = 0
            let predictedPhasePoints = 0
            let sortedData

            if (context.message.args[0]) {
                let timeNames = ["time", "record", "",]
                let phaseNames = ["phase", "phasepoints", "points", "predicted"]
                if (timeNames.includes(context.message.args[0])) { lbType = "record-" }
                if (phaseNames.includes(context.message.args[0])) { lbType = "phase-" }
                if (context.message.args.includes("-ls")) { lbSeason = 1 }
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/${lbType}leaderboard?type=${lbSeason}`).json();
            } catch (err) {
                return {
                    text: `An error has occured getting the leaderboard!`, reply: true
                }
            }
            let message = ""
            const currentTimeInMilliseconds = new Date().getTime();
            if (context.message.args[0] == "predicted") {
                // predicted phase lb
                for (user in mcsrData.data.users) {
                    predictedPhasePoints = predictedPhase(user.number, user.eloRank)
                    user.seasonResult.phasePoint += predictedPhasePoints
                }
                sortedData = mcsrData.data.users.sort((a, b) => b.seasonResult.phasePoint - a.seasonResult.phasePoint);
                message = message.concat(`Season ${mcsrData.data.phase.season} Predicted Phase LB`)
                for(let i = 0; i < 12; i++) {
                    message = message.concat(` • ${badgeIcon(sortedData[i].roleType)}${bot.Utils.unping(sortedData[i].nickname)} (${sortedData[i].seasonResult.phasePoint + predictedPhasePoints})`)
                }
                message = message.concat(` • phase ${mcsrData.data.phase.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.phase.endsAt * 1000))}`)
            } else if(lbType == "record-") {
                // record lb
                message = message.concat(`All-Time Record LB`)
                for(let i = 0; i < 10; i++) {
                    message = message.concat(` • #${i + 1} ${badgeIcon(mcsrData.data[i].user.roleType)}${bot.Utils.unping(mcsrData.data[i].user.nickname)} (${msToTime(mcsrData.data[i].time)} in s${mcsrData.data[i].season})`)
                }
            } else if (lbType == "phase-") {
                // phase lb
                message = message.concat(`Season ${mcsrData.data.phase.season} Phase LB`)
                for(let i = 0; i < 12; i++) {
                    message = message.concat(` • ${badgeIcon(mcsrData.data.users[i].roleType)}${bot.Utils.unping(mcsrData.data.users[i].nickname)} (${mcsrData.data.users[i].seasonResult.phasePoint})`)
                }
                message = message.concat(` • phase ${mcsrData.data.phase.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.phase.endsAt * 1000))}`)
            } else {
                // elo lb
                message = message.concat(`Elo LB`)
                for(let i = 0; i < 10; i++) {
                    message = message.concat(` • ${mcsrData.data.users[i].eloRank}: ${badgeIcon(mcsrData.data.users[i].roleType)}${bot.Utils.unping(mcsrData.data.users[i].nickname)} (${mcsrData.data.users[i].eloRate})`)
                }
                message = message.concat(` • season ${mcsrData.data.season.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.season.endsAt * 1000))}`)
            }

            return {text:message, reply:true}
            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};