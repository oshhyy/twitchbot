const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "lastmatch",
    cooldown: 3000,
    aliases: ['rankedmatch', 'match'],
    description: `lastmatch [minecraft-username] | provides stats for the last played ranked match in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0) + '.' + pad(s % 1000, 3);
            }
            function getRank(elo) {
                if(!elo) {return "Unrated or Hidden"}
                if(elo < 400) {return "Coal I"}
                if(elo < 500) {return "Coal II"}
                if(elo < 600) {return "Coal III"}
                if(elo < 700) {return "Iron I"}
                if(elo < 800) {return "Iron II"}
                if(elo < 900) {return "Iron III"}
                if(elo < 1000) {return "Gold I"}
                if(elo < 1100) {return "Gold II"}
                if(elo < 1200) {return "Gold III"}
                if(elo < 1300) {return "Emerald I"}
                if(elo < 1400) {return "Emerald II"}
                if(elo < 1500) {return "Emerald III"}
                if(elo < 1650) {return "Diamond I"}
                if(elo < 1800) {return "Diamond II"}
                if(elo < 2000) {return "Diamond III"}
                if(elo >= 2000)  {return "Netherite"}
                else {return "Unrated"}
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
                if (badge == 1) {return "◇ "}
                if (badge == 2) {return "◈ "}
                if (badge == 3) {return "❖ "}
                return " "
            }
            function capitalizeEveryWord(str) {
                return str.replace(/\b\w/g, match => match.toUpperCase());
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
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}/matches?count=50&filter=2`).json();
            } catch (err) {
                return {
                    text: `This username is not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            const nonDecayMatches = mcsrData.data.filter(match => !match.decayed);
            const sortedMatches = nonDecayMatches.sort((a, b) => b.date - a.date);
            const mostRecentNonDecayMatch = sortedMatches[0];

            console.log(mostRecentNonDecayMatch)

            if(!mostRecentNonDecayMatch) {
                return{text: `This user does not have any recent matches! oshDank`, reply: true}
            }

            let finalTime
            let winner
            if(mostRecentNonDecayMatch.result.uuid == null) {
                // DRAW
                winner = "N/A"
                finalTime = "DRAW"
            } else {
                for(player of mostRecentNonDecayMatch.players) {
                    if(player.uuid == mostRecentNonDecayMatch.result.uuid) {
                        winner = player.nickname
                    }
                }
                if(mostRecentNonDecayMatch.forfeited) {
                    finalTime = `Forfeit at ${msToTime(mostRecentNonDecayMatch.result.time)}`
                } else {
                    finalTime = msToTime(mostRecentNonDecayMatch.result.time)
                }
            }

            const epochTimeInSeconds = mostRecentNonDecayMatch.date;
            const currentTimeInMilliseconds = new Date().getTime();
            const epochTimeInMilliseconds = epochTimeInSeconds * 1000;
            const timeDifferenceInMilliseconds = currentTimeInMilliseconds - epochTimeInMilliseconds;
            
            let matchDate = bot.Utils.humanize(timeDifferenceInMilliseconds)

            // P1 Info
            const p1Elo = mostRecentNonDecayMatch.players[0].eloRate ?? "?"
            const p1Rank = mostRecentNonDecayMatch.players[0].eloRank ?? "?"
            const p1Player = mostRecentNonDecayMatch.players[0].nickname
            const p1Badge = badgeIcon(mostRecentNonDecayMatch.players[0].roleType)

            // P2 Info
            const p2Elo = mostRecentNonDecayMatch.players[1].eloRate ?? "?"
            const p2Rank = mostRecentNonDecayMatch.players[1].eloRank ?? "?"
            const p2Player = mostRecentNonDecayMatch.players[1].nickname
            const p2Badge = badgeIcon(mostRecentNonDecayMatch.players[1].roleType)

            // Elo Change
            let p1Change, p2Change, p1NewElo, p2NewElo
            for(player of mostRecentNonDecayMatch.changes) {
                if(player.uuid == mostRecentNonDecayMatch.players[0].uuid) {
                    if (player.change >= 0) {
                        p1Change = `+${player.change}`
                    } else { p1Change = player.change }

                    p1NewElo = player.eloRate
                    
                } else {
                    if (player.change >= 0) {
                        p2Change = `+${player.change}`
                    } else { p2Change = player.change }

                    p2NewElo = player.eloRate
                }
            }

            // widewally just gettign the seed type
            const matchData = await got(`https://mcsrranked.com/api/matches/${mostRecentNonDecayMatch.id}`).json();
            const seedType = matchData.data.seedType.replace("_", " ")

            const averageElo = getRank((mostRecentNonDecayMatch.changes[0].eloRate + mostRecentNonDecayMatch.changes[1].eloRate) / 2)
            const eloColor = rankColor(averageElo)

            await twitchapi.changeColor(eloColor)
            await bot.Utils.sleep(1000)
            return{text: `/me • Ranked Match Stats (${matchDate} ago) • #${p1Rank} ${p1Badge}${bot.Utils.unping(p1Player)} (${p1Elo}) VS #${p2Rank} ${p2Badge}${bot.Utils.unping(p2Player)} (${p2Elo}) • Winner: ${winner} (${finalTime}) • Elo Change: ${bot.Utils.unping(p1Player)} ${p1Change} → ${p1NewElo} | ${bot.Utils.unping(p2Player)} ${p2Change} → ${p2NewElo} • Seed Type: ${seedType} • https://mcsrrankedstats.vercel.app/oshgay/${mostRecentNonDecayMatch.id}`, reply: true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
            
        }
    },
};