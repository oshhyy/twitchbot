const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "bwstats",
    cooldown: 3000,
    aliases: ['bw'],
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
            console.log(mcUUID)
            let hypixelData;
            try {
                hypixelData = await got(`https://api.hypixel.net/v2/player?uuid=${mcUUID}`, {headers: {'API-Key': config.hypixelKey}}, { throwHttpErrors: false }).json()
            } catch (err) {
                console.log(hypixelData)
                return {
                    text: `doid`, reply: true
                }
            }

            console.log(hypixelData)

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};