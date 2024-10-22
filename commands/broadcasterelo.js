const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "broadcasterelo",
    cooldown: 3000,
    aliases: [],
    description: `shit fix`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                
                var minutes = Math.floor(s / 60000);
                var seconds = Math.floor((s % 60000) / 1000); 
                // var milliseconds = s % 1000;
                
                return pad(minutes) + ':' + pad(seconds);
            }
            function getRank(elo) {
                if (!elo) { return "Unrated or Hidden" }
                if (elo < 400) { return "Coal I" }
                if (elo < 500) { return "Coal II" }
                if (elo < 600) { return "Coal III" }
                if (elo < 700) { return "Iron I" }
                if (elo < 800) { return "Iron II" }
                if (elo < 900) { return "Iron III" }
                if (elo < 1000) { return "Gold I" }
                if (elo < 1100) { return "Gold II" }
                if (elo < 1200) { return "Gold III" }
                if (elo < 1300) { return "Emerald I" }
                if (elo < 1400) { return "Emerald II" }
                if (elo < 1500) { return "Emerald III" }
                if (elo < 1650) { return "Diamond I" }
                if (elo < 1800) { return "Diamond II" }
                if (elo < 2000) { return "Diamond III" }
                if (elo >= 2000) { return "Netherite" }
                else { return "Unrated" }
            }
            function rankColor(rank) {
                let color
                let encodedColor
                if (rank.startsWith("Coal")) { color = "A8A8A8" }
                if (rank.startsWith("Iron")) { color = "FCFCFC" }
                if (rank.startsWith("Gold")) { color = "FCA800" }
                if (rank.startsWith("Emerald")) { color = "54FC54" }
                if (rank.startsWith("Diamond")) { color = "54FCFC" }
                if (rank.startsWith("Netherite")) { color = "A783FA" }
                if (color) { encodedColor = encodeURIComponent(`#${color}`) }
                return encodedColor
            }
            function badgeIcon(badge) {
                if (badge == 1) { return "◇" }
                if (badge == 2) { return "◈" }
                if (badge == 3) { return "❖" }
                return "•"
            }
            function medal(rank) {
                if (rank == 1) { return "🥇" }
                if (rank == 2) { return "🥈" }
                if (rank == 3) { return "🥉" }
                return `#${rank}`
            }

            let mcUUID = context.message.args[0]
            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`).json();
            } catch (err) {
                console.log(err)
            }
            const elo = mcsrData.data.seasonResult.last.eloRate
            const rank = medal(mcsrData.data.seasonResult.last.eloRank ?? "?")
            const rankName = getRank(elo)
            let color = rankColor(rankName)
            await twitchapi.changeColor(color)
            await bot.Utils.sleep(1000)

            let badge = badgeIcon(mcsrData.data.roleType)

            let phasePoints = ""
            if(mcsrData.data.seasonResult.last.phasePoint != 0) {
                phasePoints = `• ${mcsrData.data.seasonResult.last.phasePoint} Phase Points`
            }

            const bestElo = (mcsrData.data.seasonResult.highest == elo) ? "Peak" : `${mcsrData.data.seasonResult.highest} Peak`
            const seasonPlayed = mcsrData.data.statistics.season.playedMatches.ranked
            const wins = mcsrData.data.statistics.season.wins.ranked
            const losses = mcsrData.data.statistics.season.loses.ranked

            var bestTime = msToTime(mcsrData.data.statistics.season.bestTime.ranked)
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(1);

            let totalTime = mcsrData.data.statistics.season.completionTime.ranked
            let completions = mcsrData.data.statistics.season.completions.ranked

            const forfeits = mcsrData.data.statistics.season.forfeits.ranked

            const matchAvg = msToTime(totalTime / completions)
            const forfeitRatePerMatch = ((forfeits / seasonPlayed) * 100).toFixed(1);

            return {
                text: `/me ${badge} ${bot.Utils.unping(mcsrData.data.nickname)} Elo: ${elo} (${bestElo}) • ${rankName} (${rank}) • W/L ${wins}/${losses} (${WinPercent}%) • ${seasonPlayed} Played • ${bestTime} pb (${matchAvg} avg) • ${forfeitRatePerMatch}% FF Rate ${phasePoints}`, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};