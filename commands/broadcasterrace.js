const got = require("got");

module.exports = {
    name: "broadcasterrace",
    cooldown: 3000,
    description: `wawawawaawa`,
    execute: async context => {
        try {
            // command code
            function msToTime(s) {
                // Pad to 2 or 3 digits, default is 2
                var pad = (n, z = 2) => ('00' + n).slice(-z);
                
                var minutes = Math.floor(s / 60000);
                var seconds = Math.floor((s % 60000) / 1000); 
                var milliseconds = s % 1000;
                
                return pad(minutes) + ':' + pad(seconds) + '.' + pad(milliseconds, 3);
            }
            
            let mcUUID = context.message.args[0]
            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/weekly-race?uuid=${mcUUID}`).json();
                console.log(mcsrData.data.user.rank)
            } catch (err) {
                mcsrData = await got(`https://mcsrranked.com/api/weekly-race`).json();
            }

            let userText = ""
            if(mcsrData.data.user) {
                if (mcsrData.data.user.rank != 1) {
                    userText = `${bot.Utils.unping(mcsrData.data.user.player.nickname)}: ${msToTime(mcsrData.data.user.time)} (#${mcsrData.data.user.rank}) • `
                }
            }

            let seed = ""
            // if(mcsrData.data.seed.overworld === mcsrData.data.seed.nether) {
            //     seed = `Seed: ${mcsrData.data.seed.overworld} • `
            // } else {
            //     seed = `Overworld Seed: ${mcsrData.data.seed.overworld} • Nether Seed: ${mcsrData.data.seed.nether} • `
            // }

            const currentTimeInMilliseconds = new Date().getTime();
            return{
                text:`Ranked Weekly Race #${mcsrData.data.id} • ${seed}Rank #1: ${msToTime(mcsrData.data.leaderboard[0].time)} by ${bot.Utils.unping(mcsrData.data.leaderboard[0].player.nickname)} • ${userText}ends in ${bot.Utils.humanize(currentTimeInMilliseconds - (mcsrData.data.endsAt * 1000))}`,
                reply:true
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};