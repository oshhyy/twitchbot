const got = require("got");
const twitchapi = require('../lib/utils/twitchapi.js');
const { MongoChangeStreamError } = require("mongodb");

module.exports = {
    name: "record",
    cooldown: 3000,
    aliases: ['matchrecord'],
    description: `record [minecraft-username] [minecraft-username] | provides match record between two users in MCSR Ranked`,
    execute: async context => {
        try {
            // command code
            function badgeIcon(badge) {
                if (badge == 1) {return "◇ "}
                if (badge == 2) {return "◈ "}
                if (badge == 3) {return "❖ "}
                return " "
            }

            let userData, player1, player2

            if (!context.message.args[0]) {
                return { text: `Usage: +record [minecraft-username] [minecraft-username]`, reply: true }
            } else {
                if(!context.message.args[1]) {
                    userData = await bot.db.users.findOne({ id: context.user.id })
                    player1 = userData?.mcid
                    if (!player1) {
                        return { text: `Usage: +record [minecraft-username] [minecraft-username] | If you want to see your record against this player, link your account by doing +link mc <mc-username>`, reply: true }
                    }

                    if (context.message.args[0]?.startsWith("@")) {
                        userData = await bot.db.users.findOne({ username: context.message.args[0].replace("@", "") })
                        player2 = userData?.mcid
                        if (!player2) {
                            return { text: `User ${context.message.args[0]} does not have a linked mc account!`, reply: true }
                        }
    
                    } else {
                        player2 = context.message.args[0];
                    }
                } else {
                    if (context.message.args[0]?.startsWith("@")) {
                        userData = await bot.db.users.findOne({ username: context.message.args[0].replace("@", "") })
                        player1 = userData?.mcid
                        if (!player1) {
                            return { text: `User ${context.message.args[0]} does not have a linked mc account!`, reply: true }
                        }
    
                    } else {
                        player1 = context.message.args[0];
                    }

                    if (context.message.args[1]?.startsWith("@")) {
                        userData = await bot.db.users.findOne({ username: context.message.args[1].replace("@", "") })
                        player2 = userData?.mcid
                        if (!player2) {
                            return { text: `User ${context.message.args[1]} does not have a linked mc account!`, reply: true }
                        }
    
                    } else {
                        player2 = context.message.args[1]
                    }

                    
                }
            }
            let season = 0
            if (context.message.params.season) { season = context.message.params.season }

            let mcsrData;
            try {
                mcsrData = await got(`https://mcsrranked.com/api/users/${player1}/versus/${player2}?season=${season}`).json();
            } catch (err) {
                try {
                    mcsrData = await got(`https://mcsrranked.com/api/users/${player1}`).json();
                } catch (err) {
                    return{
                        text:`Unknown user "${player1}". oshDank`,
                        reply:true}
                }
                try {
                    mcsrData = await got(`https://mcsrranked.com/api/users/${player2}`).json();
                } catch (err) {
                    return{
                        text:`Unknown user "${player2}". oshDank`,
                        reply:true}
                }
                return{
                    text:`An unknown error occured. Scared`,
                    reply:true
                }
            }

            // P1 Info
            const p1Player = mcsrData.data.players[0].nickname
            const p1Badge = badgeIcon(mcsrData.data.players[0].roleType)

            // P2 Info
            const p2Player = mcsrData.data.players[1].nickname
            const p2Badge = badgeIcon(mcsrData.data.players[1].roleType)

            const results = Object.values(mcsrData.data.results.ranked);

            const p1WinCount = results[1];
            const p2WinCount = results[2];
            const total = results[0]

            let seasonText
            if(season == 0) {
               seasonText = `this season.`
            } else {seasonText = `in season ${season}.`}

            if(total === 0) {
                return{
                    text:`${p1Badge}${bot.Utils.unping(p1Player)} has not encountered ${p2Badge}${bot.Utils.unping(p2Player)} ${seasonText}`,
                    reply:true}
            }

            else return{text:`${p1Badge}${bot.Utils.unping(p1Player)} ${p1WinCount}-${p2WinCount} ${p2Badge}${bot.Utils.unping(p2Player)} • ${total} total games played ${seasonText}`, reply:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bbot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};