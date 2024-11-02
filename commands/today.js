const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');

module.exports = {
    name: "today",
    cooldown: 3000,
    aliases: [],
    description: `today [minecraft-username] | shows stats for MCSR Ranked players in the last 12h`,
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
            
            function rankColor(elo) {
                let color
                let encodedColor
                if (elo < 600) { color = "A8A8A8" }
                else if (elo < 900) { color = "FCFCFC" }
                else if (elo < 1200) { color = "FCA800" }
                else if (elo < 1500) { color = "54FC54" }
                else if (elo < 2000) { color = "54FCFC" }
                else if (elo >= 2000) { color = "A783FA" }
                if (color) { encodedColor = encodeURIComponent(`#${color}`) }
                return encodedColor
            }

            let userData, mcUUID, user
            if (!context.message.args[0]) {
                userData = await bot.db.users.findOne({ id: context.user.id })
                mcUUID = userData?.mcid
                user = context.user.login
                if (!mcUUID) {
                    userData = await bot.db.users.findOne({ id: context.channel.id })
                    mcUUID = userData?.mcid
                    user = context.channel.login
                }
                
            } else {
                if (context.message.args[0]?.startsWith("@")) {
                    userData = await bot.db.users.findOne({ username: context.message.args[0].replace("@", "").toLowerCase() })
                    mcUUID = userData?.mcid
                    if (!mcUUID) {
                        return { text: `This user does not have a linked mc account!`, reply: true }
                    }
                    user = context.message.args[0].replace("@", "")

                } else {
                    let mojangData;
                    mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                    if (mojangData.errorMessage) {
                        return { text: mojangData.errorMessage, reply: true }
                    }
                    mcUUID = mojangData.id
                    user = context.message.args[0]
                }
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsr-stats.memerson.xyz/api/matches?timeframe=12%20hours&username=${mcUUID}`).json();
            } catch (err) {
                return {text:"No matches were found for this user.", reply:true}
            }

            let eloChange = String(mcsrData.totalEloChange)
            if(!eloChange.startsWith("-")) {
                eloChange = `+${eloChange}`
            }

            const wins = mcsrData.wonMatchesCount
            const losses = mcsrData.lossMatchesCount
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(1);

            let averageData;
            let averageText = ""
            try {
                averageData = await got(`https://mcsrranked.com/api/users/${mcUUID}/matches?count=${mcsrData.totalMatchesCount}&type=2&excludedecay=true`).json();

                let numCompletions = 0, numTime = 0;
                for(match of averageData.data) {
                    if(match.forfeited == false && match.result.uuid == mcUUID) {
                        numCompletions++
                        numTime += match.result.time
                    }
                }
                console.log(numTime)
                console.log(numCompletions)
                console.log(mcUUID)
                let avg = msToTime(numTime / numCompletions)
                averageText = `• ${avg} avg`
            } catch (err) {averageText = ""}

            let eloColor = rankColor(mcsrData.currentElo)
            await twitchapi.changeColor(eloColor)

            await bot.Utils.sleep(1000)
            return{text: `/me • #${mcsrData.currentRank} ${bot.Utils.unping(user)} 12h Ranked Stats • Elo: ${mcsrData.currentElo} (${eloChange}) • W/L ${wins}/${losses} (${WinPercent}%) ${averageText}`, reply: true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
            
        }
    },
};