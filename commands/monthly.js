const got = require("got");
module.exports = {
    name: "monthly",
    cooldown: 3000,
    aliases: ["monthlyrecord"],
    description: `monthly - shows monthly PaceMan record`,
    execute: async context => {
        try {
            const currentTimeInMilliseconds = new Date().getTime();
            let pacemanData;
            try {
                pacemanData = await got(`https://paceman.gg/api/cs/leaderboard?filter=2&removeDuplicates=1&date=${currentTimeInMilliseconds}`).json();
            } catch (err) {
                return {
                    text: `Error getting LB data. FallCry`, reply: true
                }
            }

            if(!pacemanData[0]) {
                return {
                    text: `No current monthly record found! oshAlright`, reply: true
                }
            }

            const time = bot.Utils.msToTime(pacemanData[0].time, 3)
            const player = bot.Utils.unping(pacemanData[0].nickname)
            
            return {
                text: `Monthly PaceMan Record: ${time} by ${player}`,
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