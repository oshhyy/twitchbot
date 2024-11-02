const got = require("got");
module.exports = {
    name: "weekly",
    cooldown: 3000,
    aliases: ["weeklyrecord"],
    description: `weekly - shows weekly PaceMan record`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                
                var minutes = Math.floor(s / 60000);
                var seconds = Math.floor((s % 60000) / 1000); 
                var milliseconds = s % 1000;
            
                var formattedMinutes = minutes < 100 ? pad(minutes) : minutes;
                return formattedMinutes + ':' + pad(seconds) + '.' + pad(milliseconds, 3);
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

            if(!pacemanData[0]) {
                return {
                    text: `No current weekly record found! oshAlright`, reply: true
                }
            }

            const time = msToTime(pacemanData[0].time)
            const player = bot.Utils.unping(pacemanData[0].nickname)
            
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