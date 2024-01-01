const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "elo",
    cooldown: 3000,
    aliases: ['ranked', 'mcsr'],
    description: `elo [minecraft-username] | provides elo as well as W/L ratio for a given player in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0) + '.' + pad(s % 1000, 3);
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
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`).json();
            } catch (err) {
                return {
                    text: `This username is not registered in MCSR Ranked! oshDank`, reply: true
                }
            }

            let badge = ""
            if (mcsrData.data.badge == 1) {
                badge = "◇"
            } else if (mcsrData.data.badge == 2) {
                badge = "◈"
            } else if (mcsrData.data.badge == 3) {
                badge = "❖"
            }

            const elo = mcsrData.data.elo_rate
            const bestElo = mcsrData.data.best_elo_rate
            const rank = mcsrData.data.elo_rank ?? "Not Placed"
            const totalPlayed = mcsrData.data.total_played
            const seasonPlayed = mcsrData.data.season_played
            const wins = mcsrData.data.records[2].win
            const losses = mcsrData.data.records[2].lose
            const ties = mcsrData.data.records[2].draw
            const highestWS = mcsrData.data.highest_winstreak
            const currentWS = mcsrData.data.current_winstreak

            const dateCreated = new Date([mcsrData.data.created_time] * 1000).toUTCString().toLocaleString('en-US');
            const sinceCreated = bot.Utils.humanize(mcsrData.data.created_time);

            var bestTime = mcsrData.data.best_record_time
            bestTime = msToTime(bestTime)
            const WLRatio = (wins / losses).toFixed(2);

            return {
                text: `MCSR Ranked Statistics for ${badge} ${mcsrData.data.nickname}: Elo: ${elo} (Highest: ${bestElo}) • Rank: ${rank} • W/L Ratio: ${WLRatio} • W/L/T: ${wins}/${losses}/${ties} • WS: ${currentWS} (Highest: ${highestWS}) • Total Games Played: ${totalPlayed} (${seasonPlayed} this season) • Registered ${sinceCreated} ago (${dateCreated}) • Fastest Time: ${bestTime}`, reply: true
            }


        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};