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
                
                var minutes = Math.floor(s / 60000);
                var seconds = Math.floor((s % 60000) / 1000); 
                // var milliseconds = s % 1000;
            
                var formattedMinutes = minutes < 100 ? pad(minutes) : minutes;
                return formattedMinutes + ':' + pad(seconds);
            }
            function badgeIcon(badge) {
                if (badge == 1) {return "◇ "}
                if (badge == 2) {return "◈ "}
                if (badge == 3) {return "❖ "}
                return "• "
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
                } else if (phase == 4) {
                    if(rank == 1) return 95
                    if(rank == 2) return 85
                    if(rank == 3) return 70
                    if(rank == 4) return 65
                    if(rank <= 8) return 45
                    if(rank <= 16) return 35
                    if(rank <= 32) return 25
                    if(rank <= 50) return 20
                    if(rank <= 100) return 15
                }
                
                return 0
            }

            let lbType = ""
            let lbSeason = 0
            let predictedPhasePoints = 0
            let sortedData

            if (context.message.args[0]) {
                let timeNames = ["time", "record", "",]
                let phaseNames = ["phase", "phasepoints", "points", "predicted"]
                if (timeNames.includes(context.message.args[0].toLowerCase())) { lbType = "record-" }
                if (phaseNames.includes(context.message.args[0].toLowerCase())) { lbType = "phase-" }
                if (context.message.params.season) { lbSeason = context.message.params.season }
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/${lbType}leaderboard?season=${lbSeason}`).json();
            } catch (err) {
                return {
                    text: `An error has occured getting the leaderboard!`, reply: true
                }
            }
            
            if(lbType == "record-") {
                if(!mcsrData.data[0]) {
                    return {
                        text: `the lb is blank cuh`, reply: true
                    }
                }
            } else {
                if(!mcsrData.data?.users[0]) {
                    return {
                        text: `the lb is blank cuh`, reply: true
                    }
                }
            }
            

            let message = ""
            const currentTimeInMilliseconds = new Date().getTime();

            if (context.message.args[0] == "predicted") {
                // predicted phase lb
                for (user of mcsrData.data.users) {
                    predictedPhasePoints = predictedPhase(mcsrData.data.phase.number, user?.eloRank)
                    user.seasonResult.phasePoint += predictedPhasePoints
                }
                sortedData = mcsrData.data.users.sort((a, b) => {
                    if (b.seasonResult.phasePoint !== a.seasonResult.phasePoint) {
                        return b.seasonResult.phasePoint - a.seasonResult.phasePoint;
                    }
                    return b.seasonResult.elo - a.seasonResult.elo;
                });
                console.log(sortedData)
                message = message.concat(`Season ${mcsrData.data.phase.season} Predicted Phase LB (Top 12)`)
                for(let i = 0; i < 12; i++) {
                    if(sortedData[i]) {
                        message = message.concat(` ${badgeIcon(sortedData[i].roleType)}${bot.Utils.unping(sortedData[i].nickname)} (${sortedData[i].seasonResult.phasePoint + predictedPhasePoints})`)
                    }
                }
                if(lbSeason == 0) {
                    message = message.concat(` • phase ${mcsrData.data.phase.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.phase.endsAt * 1000))}`)
                }
            } else if(lbType == "record-") {
                // record lb
                message = message.concat(`Season ${mcsrData.data[0].season} Record LB`)
                for(let i = 0; i < 10; i++) {
                    if(mcsrData.data[i]) {
                        message = message.concat(` ${badgeIcon(mcsrData.data[i].user.roleType)}#${i + 1} ${bot.Utils.unping(mcsrData.data[i].user.nickname)} (${msToTime(mcsrData.data[i].time)})`)
                    }
                }
            } else if (lbType == "phase-") {
                // phase lb
                message = message.concat(`Season ${mcsrData.data.phase.season} Phase LB`)
                for(let i = 0; i < 12; i++) {
                    if(mcsrData.data.users[i]) {
                        message = message.concat(` ${badgeIcon(mcsrData.data.users[i].roleType)}${bot.Utils.unping(mcsrData.data.users[i].nickname)} (${mcsrData.data.users[i].seasonResult.phasePoint})`)
                    }
                }
                if(lbSeason == 0) {
                    message = message.concat(` • phase ${mcsrData.data.phase.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.phase.endsAt * 1000))}`)
                }
            } else {
                // elo lb
                message = message.concat(`Season ${mcsrData.data.season.number} Elo LB`)
                for(let i = 0; i < 10; i++) {
                    if(mcsrData.data.users[i]) {
                        message = message.concat(` ${badgeIcon(mcsrData.data.users[i].roleType)}#${mcsrData.data.users[i]?.eloRank} ${bot.Utils.unping(mcsrData.data.users[i].nickname)} (${mcsrData.data.users[i].eloRate})`)
                    }
                }

                if(lbSeason == 0) {
                    message = message.concat(` • season ${mcsrData.data.season.number} ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.season.endsAt * 1000))}`)
                }
            }

            return {text:message, reply:true}
            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};