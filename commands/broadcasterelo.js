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
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0);
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
            async function getAllMatches(url) {
                let allMatches = [];

                let page = 0;

                while (true) {
                    try {
                        const response = await got(`${url}?page=${page}&count=50&nodecay&filter=2`).json();

                        if (response.data && response.status === 'success') {
                            const matches = response.data;

                            if (matches.length > 0) {
                                allMatches = allMatches.concat(matches);
                                page++;
                            } else {
                                break; // No more matches to fetch
                            }
                        } else {
                            console.error('Invalid API response format:', JSON.stringify(response.data, null, 2));
                            break;
                        }
                    } catch (error) {
                        console.error('Error fetching matches:', error.message);
                        break;
                    }

                    console.log(`Fetched page ${page - 1}, total matches: ${allMatches.length}`);
                }

                console.log('Finished fetching all pages. Total matches:', allMatches.length);
                return allMatches;
            }

            let mcUUID = context.message.args[0]
            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`).json();
            } catch (err) {
                console.log(err)
            }

            let badge = badgeIcon(mcsrData.data.roleType)

            const elo = mcsrData.data.eloRate
            const rank = mcsrData.data.eloRank ?? "?"
            const rankName = getRank(elo)

            const bestElo = mcsrData.data.seasonResult.highest
            const seasonPlayed = mcsrData.data.statistics.season.playedMatches.ranked
            const wins = mcsrData.data.statistics.season.wins.ranked
            const losses = mcsrData.data.statistics.season.loses.ranked

            var bestTime = msToTime(mcsrData.data.statistics.season.bestTime.ranked)
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(1);
            const color = rankColor(rankName)

            await twitchapi.changeColor(color)
            await bot.Utils.sleep(500)

            // below is the dogshit code to get ff rate and shit
            let totalTime = 0
            let matchWins = 0
            const apiUrl = `https://mcsrranked.com/api/users/${mcUUID}/matches`;

            await getAllMatches(apiUrl)
                .then(data => {
                    for (match of data) {
                        if (match.result.uuid == mcUUID) {
                            if (!match.forfeited) {
                                totalTime += match.result.time
                                matchWins++
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log('Error:', error.message);
                });

            const forfeits = mcsrData.data.statistics.season.forfeits.ranked

            const matchAvg = msToTime(totalTime / matchWins)
            const forfeitRatePerMatch = (forfeits / (forfeits + seasonPlayed) * 100).toFixed(2);

            return {
                text: `/me • ${badge} ${bot.Utils.unping(mcsrData.data.nickname)} ranked stats: elo ${elo} (peak ${bestElo}) • ${rankName} (#${rank}) • w/l: ${wins}/${losses} (${WinPercent}%) • played ${seasonPlayed} matches • fastest time ${bestTime} (avg ${matchAvg}) • ff rate ${forfeitRatePerMatch}%`, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};