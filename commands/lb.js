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

            let lbType = ""
            let lbSeason = 0

            if (context.message.args[0]) {
                let timeNames = ["time", "record", "",]
                if (timeNames.includes(context.message.args[0])) { lbType = "record-" }
                if (context.message.args.includes("-ls")) { lbSeason = 1 }
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/${lbType}leaderboard?type=1`).json();
            } catch (err) {
                return {
                    text: `An error has occured getting the leaderboard!`, reply: true
                }
            }
            let message = ""
            if(lbType == "record-") {
                // record lb
                message = message.concat(`Current Season Record LB:`)
                for(let i = 0; i < 10; i++) {
                    message = message.concat(` • ${i + 1}: ${badgeIcon(mcsrData.data[i].users.badge)}${bot.Utils.unping(mcsrData.data[i].user.nickname)} (${msToTime(mcsrData.data[i].final_time)})`)
                }
            } else {
                // elo lb
                message = message.concat(`Elo LB for Ranked Season ${mcsrData.data.season_number}`)
                for(let i = 0; i < 10; i++) {
                    message = message.concat(` • ${mcsrData.data.users[i].elo_rank}: ${badgeIcon(mcsrData.data.users[i].badge)}${bot.Utils.unping(mcsrData.data.users[i].nickname)} (${mcsrData.data.users[i].elo_rate})`)
                }
            }

            return {text:message, reply:true}
            

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};