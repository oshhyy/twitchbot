const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "lastmatch",
    cooldown: 3000,
    aliases: ['rankedmatch'],
    description: `elo [minecraft-username] | provides stats for the last played ranked match in MCSR Ranked`,
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
                let mojangData;
                mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                if (mojangData.errorMessage) {
                    return { text: mojangData.errorMessage, reply: true }
                }

                mcUUID = mojangData.id
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}/matches?count=50&filter=2`).json();
            } catch (err) {
                return {
                    text: `This username is not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            // Filter the data array to get entries with is_decay = false
            const nonDecayMatches = mcsrData.data.filter(match => !match.is_decay);

            // Sort the filtered array by match_date in descending order to get the most recent entry
            const sortedMatches = nonDecayMatches.sort((a, b) => b.match_date - a.match_date);

            // Get the most recent entry
            const mostRecentNonDecayMatch = sortedMatches[0];

            console.log(mostRecentNonDecayMatch)

            if(!mostRecentNonDecayMatch) {
                return{text: `This user does not have any recent matches! oshDank`, reply: true}
            }

            let finalTime
            let winner
            if(mostRecentNonDecayMatch.winner == null) {
                // DRAW
                winner = "N/A"
                finalTime = "DRAW"
            } else {
                for(member of mostRecentNonDecayMatch.members) {
                    if(member.uuid == mostRecentNonDecayMatch.winner) {
                        winner = member.nickname
                    }
                }
            }
            if(mostRecentNonDecayMatch.forfeit) {
                finalTime = `Forfeit at ${msToTime(mostRecentNonDecayMatch.final_time)}`
            } else {
                finalTime = msToTime(mostRecentNonDecayMatch.final_time)
            }
            const matchDate = bot.Utils.humanize(mostRecentNonDecayMatch.match_date / 1000)

            // P1 Info
            const p1Elo = mostRecentNonDecayMatch.members[0].elo_rate
            const p1Rank = mostRecentNonDecayMatch.members[0].elo_rank ?? "?"
            const p1Player = mostRecentNonDecayMatch.members[0].nickname
            const p1Badge = badgeIcon(mostRecentNonDecayMatch.members[0].badge)

            // P2 Info
            const p2Elo = mostRecentNonDecayMatch.members[1].elo_rate
            const p2Rank = mostRecentNonDecayMatch.members[1].elo_rank ?? "?"
            const p2Player = mostRecentNonDecayMatch.members[1].nickname
            const p2Badge = badgeIcon(mostRecentNonDecayMatch.members[1].badge)

            // Elo Change
            let p1Change, p2Change, p1NewElo, p2NewElo
            for(player of mostRecentNonDecayMatch.score_changes) {
                if(player.uuid == mostRecentNonDecayMatch.members[0].uuid) {
                    if (player.change >= 0) {
                        p1Change = `+${player.change}`
                    } else { p1Change = player.change }

                    p1NewElo = player.score
                    
                } else {
                    if (player.change >= 0) {
                        p2Change = `+${player.change}`
                    } else { p2Change = player.change }

                    p2NewElo = player.score
                }
            }

            // widewally just gettign the seed type
            const matchData = await got(`https://mcsrranked.com/api/matches/${mostRecentNonDecayMatch.match_id}`).json();
            const seedType = capitalizeEveryWord(matchData.data.seed_type.replace("_", " "))

            const averageElo = getRank((mostRecentNonDecayMatch.score_changes[0].score + mostRecentNonDecayMatch.score_changes[1].score) / 2)
            const eloColor = rankColor(averageElo)

            await twitchapi.changeColor(eloColor)
            await bot.Utils.sleep(250)
            return{text: `/me • Ranked Match Stats (${matchDate} ago) • #${p1Rank} ${p1Badge}${p1Player} (${p1Elo}) VS #${p2Rank} ${p2Badge}${p2Player} (${p2Elo}) • Seed Type: ${seedType} • Winner: ${winner} (${finalTime}) • Elo Change: ${p1Player} ${p1Change} → ${p1NewElo} | ${p2Player} ${p2Change} → ${p2NewElo} `, reply: true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};