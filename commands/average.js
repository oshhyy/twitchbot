const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "average",
    cooldown: 3000,
    aliases: ['avg'],
    description: `average [minecraft-username] | provides average completion time for given player and different seedtypes in MCSR Ranked`,
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
                        const response = await got(`${url}?page=${page}&count=50&nodecay&type=2&excludedecay=true&season=${season}`).json();

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
                mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}?season=${season}`).json();
            } catch (err) {
                try {
                    userData = await bot.db.users.findOne({ username: context.channel.login.replace("@", "") })
                    mcUUID = userData?.mcid
                    mcsrData = await got(`https://mcsrranked.com/api/users/${mcUUID}`).json();
                } catch (err) {
                    return {
                        text: `No ranked profile found. FallCry`, reply: true
                    }
                }
            }
            let badge = badgeIcon(mcsrData.data.roleType)

            let totalTime = mcsrData.data.statistics.season.completionTime.ranked
            let completions = mcsrData.data.statistics.season.completions.ranked
            const matchAvg = bot.Utils.msToTime(totalTime / completions, 1)
            let message = `${badge} ${bot.Utils.unping(mcsrData.data.nickname)} Overall Average: ${matchAvg}`

            let matchesData = await getAllMatches(`https://mcsrranked.com/api/users/${mcUUID}/matches`, season)
            console.log(matchesData)


            let bridgeTime = 0, treasureTime = 0, housingTime = 0, stablesTime = 0
            let bridgeC = 0, treasureC = 0, housingC = 0, stablesC = 0

            let villageTime = 0, rpTime = 0, btTime = 0, shipTime = 0, templeTime = 0
            let villageC = 0, rpC = 0, btC = 0, shipC = 0, templeC = 0

            for (match of matchesData) {
                if (mcUUID == match.result.uuid && match.forfeited == false) {

                    if (match.seedType == 'VILLAGE') {
                        villageC++
                        villageTime += match.result.time
                    } else if (match.seedType == 'RUINED_PORTAL') {
                        rpC++
                        rpTime += match.result.time
                    } else if (match.seedType == 'BURIED_TREASURE') {
                        btC++
                        btTime += match.result.time
                    } else if (match.seedType == 'SHIPWRECK') {
                        shipC++
                        shipTime += match.result.time
                    } else if (match.seedType == 'DESERT_TEMPLE') {
                        templeC++
                        templeTime += match.result.time
                    }

                    if (match.bastionType == 'BRIDGE') {
                        bridgeC++
                        bridgeTime += match.result.time
                    } else if (match.bastionType == 'TREASURE') {
                        treasureC++
                        treasureTime += match.result.time
                    } else if (match.bastionType == 'HOUSING') {
                        housingC++
                        housingTime += match.result.time
                    } else if (match.bastionType == 'STABLES') {
                        stablesC++
                        stablesTime += match.result.time
                    }
                }
            }
            
            const villageAvg = bot.Utils.msToTime(villageTime / villageC)
            const rpAvg = bot.Utils.msToTime(rpTime / rpC)
            const btAvg = bot.Utils.msToTime(btTime / btC)
            const shipAvg = bot.Utils.msToTime(shipTime / shipC)
            const templeAvg = bot.Utils.msToTime(templeTime / templeC)

            message = message.concat(` ║ Village: ${villageAvg} • RP: ${rpAvg} • BT: ${btAvg} • Ship: ${shipAvg} • Temple: ${templeAvg}`)

            const bridgeAvg = bot.Utils.msToTime(bridgeTime / bridgeC)
            const treasureAvg = bot.Utils.msToTime(treasureTime / treasureC)
            const housingAvg = bot.Utils.msToTime(housingTime / housingC)
            const stablesAvg = bot.Utils.msToTime(stablesTime / stablesC)

            message = message.concat(` ║ Bridge: ${bridgeAvg} • Treasure: ${treasureAvg} • Housing: ${housingAvg} • Stables: ${stablesAvg}`)

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