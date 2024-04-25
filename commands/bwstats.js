const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "bwstats",
    cooldown: 3000,
    aliases: ['bw'],
    description: `bwstats [minecraft-username] | provides hypixel bedwars stats. currently only supports overall stats, may add specific mode soon`,
    execute: async context => {
        try {
            function getRank(rank) {
                if (!rank) return;
                if (rank == "VIP_PLUS") { return "VIP+" }
                if (rank == "MVP_PLUS") { return "MVP+" }
                return rank
            }
            function starColor(stars) {
                let color
                let encodedColor
                if (stars < 100) {color = "555555"}
                else if (stars < 200) {color = "FCFCFC"}
                else if (stars < 300) {color = "FCA800"}
                else if (stars < 400) {color = "54FCFC"}
                else if (stars < 500) {color = "00AA00"}
                else if (stars < 600) {color = "00AAAA"}
                else if (stars < 700) {color = "AA0000"}
                else if (stars < 800) {color = "FF55FF"}
                else if (stars < 900) {color = "5555FF"}
                else if (stars < 1000) {color = "AA00AA"}
                else {color = "55FF55"}

                if (color) { encodedColor = encodeURIComponent(`#${color}`) }
                return encodedColor
            }
            // command code
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
                        return { text: `Mojang Error: ${mojangData.errorMessage} FallCry`, reply: true }
                    }
                    mcUUID = mojangData.id
                }
            }
            console.log(mcUUID)
            let hypixelData;
            try {
                hypixelData = await got(`https://api.hypixel.net/v2/player?uuid=${mcUUID}`, {headers: {'API-Key': config.hypixelKey}}).json()
            } catch (err) {
                console.log(err)
                return {
                    text: `Error getting hypixel data monkaS`, reply: true
                }
            }

            console.log(hypixelData)
            console.log(hypixelData.player.stats.Bedwars)

            let color = starColor(hypixelData.player.achievements.bedwars_level)
            await twitchapi.changeColor(color)
            await bot.Utils.sleep(1000)

            let stars = `[${hypixelData.player.achievements.bedwars_level}★]`

            let rank = ""
            if(hypixelData.player.rank || hypixelData.player.newPackageRank) {
                rank = `[${getRank(hypixelData.player.rank ?? hypixelData.player.newPackageRank)}]`
            }

            let gamesPlayed = hypixelData.player.stats.Bedwars.games_played_bedwars ?? 0;
            let wins = hypixelData.player.stats.Bedwars.wins_bedwars ?? 0;
            let losses = hypixelData.player.stats.Bedwars.losses_bedwars ?? 0;
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(1);

            let finalKills = hypixelData.player.stats.Bedwars.final_kills_bedwars ?? 0;
            let finalDeaths = hypixelData.player.stats.Bedwars.final_deaths_bedwars ?? 0;
            const fkdr = (finalKills / finalDeaths).toFixed(2);

            let bedsBroken = hypixelData.player.stats.Bedwars.beds_broken_bedwars ?? 0;
            let bedsLost = hypixelData.player.stats.Bedwars.beds_lost_bedwars ?? 0;
            const bblr = (bedsBroken / bedsLost).toFixed(2);

            let winstreak = hypixelData.player.stats.Bedwars.winstreak ?? 0

            // getting online data
            let onlineData
            try {
                onlineData = await got(`https://api.hypixel.net/v2/status?uuid=${mcUUID}`, {headers: {'API-Key': config.hypixelKey}}).json()
            } catch (err) {
                console.log(err)
                return {
                    text: `Error getting hypixel data monkaS`, reply: true
                }
            }
            console.log(onlineData)

            let onlineText = ""
            if(onlineData.session.online) {
                onlineText = `• currently online in ${onlineData.session.gameType[0].toUpperCase() + onlineData.session.gameType.slice(1).toLowerCase()}: ${onlineData.session.mode}`
            } else {
                const currentTimeInMilliseconds = new Date().getTime();
                onlineText = `• last online ${bot.Utils.humanize(hypixelData.player.lastLogout - currentTimeInMilliseconds)} ago`
            }

            return {
                text: `/me ${stars} ${rank} ${bot.Utils.unping(hypixelData.player.displayname)} W/L ${wins}/${losses} (${WinPercent}%) • ${gamesPlayed} Games Played • FKDR: ${fkdr} (${finalKills}/${finalDeaths}) • BBLR ${bblr} (${bedsBroken}/${bedsLost}) • ${winstreak} winstreak ${onlineText} `, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};