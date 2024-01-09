const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "elo",
    cooldown: 3000,
    aliases: ['ranked', 'mcsr', 'rank'],
    description: `elo [minecraft-username] | provides elo as well as W/L ratio for a given player in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0) + '.' + pad(s % 1000, 3);
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
                return ""
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
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`).json();
            } catch (err) {
                return {
                    text: `This username is not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            let badge = badgeIcon(mcsrData.data.badge)

            const elo = mcsrData.data.elo_rate
            const bestElo = mcsrData.data.best_elo_rate
            const rank = mcsrData.data.elo_rank ?? "?"
            const rankName = getRank(elo)
            const totalPlayed = mcsrData.data.total_played
            const seasonPlayed = mcsrData.data.season_played
            const wins = mcsrData.data.records[2].win
            const losses = mcsrData.data.records[2].lose
            const ties = mcsrData.data.records[2].draw
            const highestWS = mcsrData.data.highest_winstreak
            const currentWS = mcsrData.data.current_winstreak

            var bestTime = mcsrData.data.best_record_time
            bestTime = msToTime(bestTime)
            const WLRatio = (wins / losses).toFixed(2);
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(2);
            const color = rankColor(rankName)

            await twitchapi.changeColor(color)
            await bot.Utils.sleep(1000)
            return {
                text: `/me • MCSR Ranked Statistics for ${badge} ${mcsrData.data.nickname}: Elo: ${elo} (Peak: ${bestElo}) • Rank: ${rankName} (#${rank}) • W/L Ratio: ${WLRatio} • W/L/T: ${wins}/${losses}/${ties} (${WinPercent}% winrate) • WS: ${currentWS} (Highest: ${highestWS}) • Total Games Played: ${totalPlayed} (${seasonPlayed} this season) • Fastest Time: ${bestTime}`, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};