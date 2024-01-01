const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "elo",
    cooldown: 3000,
    aliases: ['ranked', 'mcsr'],
    description: `bwstats [minecraft-username] | provides hypixel bedwars stats`,
    execute: async context => {
        try {
            // command code
            let userData, mcUUID

            if (!context.message.args[0]) {
                userData = await bot.db.users.findOne({ id: context.user.id })
                mcUUID = userData?.mcid
                if (!mcUUID) {
                    return { text: `No MC username provided! To link your account, do '+link mc <username>'`, reply: true }
                }
            } else {
                let mojangData;
                mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                if (mojangData.errorMessage) {
                    return { text: mojangData.errorMessage, reply: true }
                }

                mcUUID = mojangData.id
            }

            let mcsrData;
            try {
                mcsrData = await got(`https://api.hypixel.net/v2/player?uuid=${mcUUID}`, {headers: {'X-Api-Key': config.hypixelKey}}, { throwHttpErrors: false }).json()
            } catch (err) {
                return {
                    text: `doid`, reply: true
                }
            }


        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};