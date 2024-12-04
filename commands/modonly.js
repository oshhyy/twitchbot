const got = require("got");

module.exports = {
    name: "modonly",
    cooldown: 10000,
    aliases: ["broadcasteronly"],
    description: `modonly - locks the bot to only respond to mods or broadcaster.`,
    execute: async context => {
        try {
            // command code
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && context.user.id != "489223884") {
                return {};
            }

            const mode = context.message.args[0]

            if (mode != "enable" && mode != "disable" && mode != "on" && mode != "off") {
                return {
                    text: `Usage: +modonly <enable/disable>`, reply: true
                }
            }

            let id = context.channel.id

            const lockedChannels = (await bot.db.channels.find({ isLocked: true })).map(c => c.id);

            if (mode == "enable" || mode == "on") {
                if (lockedChannels.includes(id)) {
                    return {
                        text: `This channel is already locked! To unlock, do +modonly disable oshDank`,
                        reply: true
                    }
                }
                await bot.db.channels.updateOne({ id: id }, { $set: { isLocked: true } })

                return {
                    text: `The bot is now in locked mode. 🔒 I will now only respond to commands if they are from a moderator or broadcaster.`, reply: true
                }
            }

            if (mode == "disable" || mode == "off") {
                if (lockedChannels.includes(id)) {
                    await bot.db.channels.updateOne({ id: id }, { $set: { isLocked: false } })
                    return {
                        text: `This channel is no longer locked. 🔓`, reply: true
                    }
                }
                return {
                    text: `This channel is not locked. PoroSad`, reply: true
                }
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} :(`)
        }
    },
};