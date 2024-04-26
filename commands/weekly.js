const got = require("got");
module.exports = {
    name: "weekly",
    cooldown: 3000,
    aliases: ["weeklyrecord"],
    description: `weekly - shows weekly PaceMan record `,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                return pad((s % 3.6e6) / 6e4 | 0) + ':' + pad((s % 6e4) / 1000 | 0);
            }

            const currentTimeInMilliseconds = new Date().getTime();
            let pacemanData;
            try {
                pacemanData = await got(`https://paceman.gg/api/cs/leaderboard?filter=1&removeDuplicates=1&date=${currentTimeInMilliseconds}`).json();
            } catch (err) {
                return {
                    text: `Error getting LB data. FallCry`, reply: true
                }
            }

            if(!pacemanData.eventList[0]) {
                return {
                    text: `No current weekly record found! oshAlright`, reply: true
                }
            }

            const time = msToTime(pacemanData.eventList[0].time)
            const player = bot.Utils.unping(pacemanData.eventList[0].nickname)
            
            return {
                text: `Weekly PaceMan Record: ${time} by ${player}`,
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