const got = require("got");
module.exports = {
    name: "daily",
    cooldown: 3000,
    aliases: ["dailyrecord"],
    description: `daily - shows daily PaceMan record`,
    execute: async context => {
        try {
            // command code
            const currentTimeInMilliseconds = new Date().getTime();
            let pacemanData;
            try {
                pacemanData = await got(`https://paceman.gg/api/cs/leaderboard?filter=0&removeDuplicates=1&date=${currentTimeInMilliseconds}`).json();
            } catch (err) {
                bot.Logger.error(err.message)
                return {
                    text: `Error getting LB data. FallCry`, reply: true
                }
            }

            if(!pacemanData[0]) {
                return {
                    text: `No current daily record found! oshAlright`, reply: true
                }
            }

            const time = bot.Utils.msToTime(pacemanData[0].time, 3)
            const player = bot.Utils.unping(pacemanData[0].nickname)
            
            return {
                text: `Daily PaceMan Record: ${time} by ${player}`,
                reply: true,
            };
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};