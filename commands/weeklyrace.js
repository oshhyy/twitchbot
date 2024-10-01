const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js')

module.exports = {
    name: "weeklyrace",
    cooldown: 3000,
    aliases: ['race'],
    description: `race [minecraft-username] | shows #1 and user info for MCSR Ranked Weekly Race`,
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

            let userData, mcUUID
            if (!context.message.args[0]) {
                userData = await bot.db.users.findOne({ id: context.user.id })
                mcUUID = userData?.mcid
                if (!mcUUID) {
                    userData = await bot.db.users.findOne({ username: context.channel.login.replace("@", "") })
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

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/weekly-race?uuid=${mcUUID}`).json();
            } catch (err) {
                try{
                    userData = await bot.db.users.findOne({ username: context.channel.login.replace("@", "") })
                    mcUUID = userData?.mcid
                    mcsrData = await got(`https://mcsrranked.com/api/weekly-race?uuid=${mcUUID}`).json();
                } catch (err){
                    try {
                        mcsrData = await got(`https://mcsrranked.com/api/weekly-race`).json();
                    } catch (err) {
                        return{text:'something went wrong ngl idk whats wrong but somethings wrong', reply:true}
                    }
                }
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