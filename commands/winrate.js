const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "winrate",
    cooldown: 3000,
    aliases: ['wl'],
    description: `winrate [minecraft-username] | provides W/L ratio for a given player and different seedtypes in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function badgeIcon(badge) {
                if (badge == 1) { return "◇" }
                if (badge == 2) { return "◈" }
                if (badge == 3) { return "❖" }
                return "•"
            }
            async function getAllMatches(url, season) {
                let allMatches = [];

                let page = 0;

                while (true) {
                    try {
                        const response = await got(`${url}?page=${page}&count=50&nodecay&type=2&excludedecay=true&season=${season}`, { headers: { "API-Key": config.rankedKey } }).json();

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
            let season = 0
            if (context.message.params.season) { season = context.message.params.season }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}?season=${season}`, { headers: { "API-Key": config.rankedKey } }).json();
            } catch (err) {
                try {
                    userData = await bot.db.users.findOne({ username: context.channel.login.replace("@", "") })
                    mcUUID = userData?.mcid
                    mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`, { headers: { "API-Key": config.rankedKey } }).json();
                } catch (err) {
                    return {
                        text: `No ranked profile found. FallCry`, reply: true
                    }
                }
            }
            let badge = badgeIcon(mcsrData.data.roleType)

            const wins = mcsrData.data.statistics.season.wins.ranked
            const losses = mcsrData.data.statistics.season.loses.ranked
            const WinPercent = ((wins / (wins + losses)) * 100).toFixed(1);
            let message = `${badge} ${bot.Utils.unping(mcsrData.data.nickname)} Overall Winrate: ${wins}/${losses} (${WinPercent}%)`

            let matchesData = await getAllMatches(`https://mcsrranked.com/api/users/${mcUUID}/matches`, season)
            console.log(matchesData)


            let bridgeWins = 0, treasureWins = 0, housingWins = 0, stablesWins = 0
            let bridgeLosses = 0, treasureLosses = 0, housingLosses = 0, stablesLosses = 0

            let villageWins = 0, rpWins = 0, btWins = 0, shipWins = 0, templeWins = 0
            let villageLosses = 0, rpLosses = 0, btLosses = 0, shipLosses = 0, templeLosses = 0

            for (match of matchesData) {
                if (match.result.uuid) {
                    let winner = false
                    if (mcUUID == match.result.uuid) {
                        winner = true
                    }

                    if (match.seedType == 'VILLAGE') {
                        if (winner) villageWins++
                        else villageLosses++
                    } else if (match.seedType == 'RUINED_PORTAL') {
                        if (winner) rpWins++
                        else rpLosses++
                    } else if (match.seedType == 'BURIED_TREASURE') {
                        if (winner) btWins++
                        else btLosses++
                    } else if (match.seedType == 'SHIPWRECK') {
                        if (winner) shipWins++
                        else shipLosses++
                    } else if (match.seedType == 'DESERT_TEMPLE') {
                        if (winner) templeWins++
                        else templeLosses++
                    }

                    if (match.bastionType == 'BRIDGE') {
                        if (winner) bridgeWins++
                        else bridgeLosses++
                    } else if (match.bastionType == 'TREASURE') {
                        if (winner) treasureWins++
                        else treasureLosses++
                    } else if (match.bastionType == 'HOUSING') {
                        if (winner) housingWins++
                        else housingLosses++
                    } else if (match.bastionType == 'STABLES') {
                        if (winner) stablesWins++
                        else stablesLosses++
                    }
                }
            }
            let villagePercent = ((villageWins / (villageWins + villageLosses)) * 100).toFixed(1)
            let rpPercent = ((rpWins / (rpWins + rpLosses)) * 100).toFixed(1)
            let btPercent = ((btWins / (btWins + btLosses)) * 100).toFixed(1)
            let shipPercent = ((shipWins / (shipWins + shipLosses)) * 100).toFixed(1)
            let templePercent = ((templeWins / (templeWins + templeLosses)) * 100).toFixed(1)

            message = message.concat(` ║ Village: ${villagePercent}% • RP: ${rpPercent}% • BT: ${btPercent}% • Ship: ${shipPercent}% • Temple: ${templePercent}%`)

            console.log(message)
            console.log(`${villageWins}/${villageLosses}`)
            console.log(`${rpWins}/${rpLosses}`)
            console.log(`${btWins}/${btLosses}`)
            console.log(`${shipWins}/${shipLosses}`)
            console.log(`${templeWins}/${templeLosses}`)

            let bridgePercent = ((bridgeWins / (bridgeWins + bridgeLosses)) * 100).toFixed(1)
            let treasurePercent = ((treasureWins / (treasureWins + treasureLosses)) * 100).toFixed(1)
            let housingPercent = ((housingWins / (housingWins + housingLosses)) * 100).toFixed(1)
            let stablesPercent = ((stablesWins / (stablesWins + stablesLosses)) * 100).toFixed(1)

            message = message.concat(` ║ Bridge: ${bridgePercent}% • Treasure: ${treasurePercent}% • Housing: ${housingPercent}% • Stables: ${stablesPercent}%`)

            console.log(message)
            console.log(`${bridgeWins}/${bridgeLosses}`)
            console.log(`${treasureWins}/${treasureLosses}`)
            console.log(`${housingWins}/${housingLosses}`)
            console.log(`${stablesWins}/${stablesLosses}`)

            return {
                text: message, reply: true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} :(`)
        }
    },
};