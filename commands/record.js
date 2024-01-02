const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "record",
    cooldown: 3000,
    aliases: ['matchrecord'],
    description: `record [minecraft-username] [minecraft-username] | provides match record between two users in MCSR Ranked`,
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

            let userData, player1, player2

            if (!context.message.args[0]) {
                return { text: `Usage: +record [minecraft-username] [minecraft-username]`, reply: true }
            } else {
                if(!context.message.args[1]) {
                    userData = await bot.db.users.findOne({ id: context.user.id })
                    player1 = userData?.mcid
                    if (!mcUUID) {
                        return { text: `Usage: +record [minecraft-username] [minecraft-username] | If you want to see your record against this player, link your account by doing +link mc <mc-username>`, reply: true }
                    }
                    player2 = context.message.args[0]
                } else {
                    player1 = context.message.args[0]
                    player2 = context.message.args[1]
                }

                let mojangData;
                mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                if (mojangData.errorMessage) {
                    return { text: mojangData.errorMessage, reply: true }
                }

                mcUUID = mojangData.id
            } 

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${player1}/versus/${player2}`).json();
            } catch (err) {
                return {
                    text: `One of these usernames are not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            // P1 Info
            const p1Player = mcsrData.data.users[0].nickname
            const p1Badge = badgeIcon(mcsrData.data.users[0].badge)

            // P2 Info
            const p2Player = mcsrData.data.users[1].nickname
            const p2Badge = badgeIcon(mcsrData.data.users[1].badge)

            const seasons = Object.values(mcsrData.data.win_count);
            const season = seasons[seasons.length - 1];
            const p1WinCount = season[mcsrData.data.users[0].uuid];
            const p2WinCount = season[mcsrData.data.users[1].uuid];
            const total = season.total

            console.log(season)
            return{text:`${p1Badge}${p1Player} ${p1WinCount}-${p2WinCount} ${p2Badge}${p2Player} • ${total} total games played`, reply:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};