const got = require("got");

module.exports = {
    name: "offlineonly",
    cooldown: 10000,
    aliases: ["offlinemode"],
    description: `offlineonly - makes the bot only respond to commands if the channel is offline`,
    execute: async context => {
        try {
            // command code
            if (!context.badges.hasModerator && !context.badges.hasBroadcaster && context.user.id != "489223884") {
                return {
                    text: `Error: This command is exclusive to mods and broadcasters forsenNOIDONTTHINKSO`, reply: true
                };
            }

            const mode = context.message.args[0]

            if(mode != "enable" && mode != "disable" && mode != "on" && mode != "off") {
                return{
                    text:`Usage: +offlineonly <enable/disable>`,reply:true
                }
            }

            let id = context.channel.id

            const offlineOnlyChannels = (await bot.db.channels.find({ offlineOnly: true })).map(c => c.id);

            if (mode == "enable" || mode == "on") {
                if(offlineOnlyChannels.includes(id)) {
                    return {
                        text: `This channel is already in offline only mode! oshDank`,
                        reply:true
                    }
                }
                await bot.db.channels.updateOne({id: id}, { $set: { offlineOnly: true } })
                
                return{
                    text: `This channel is now in offline only mode. FeelsGoodMan I will now only respond to commands if the channel is offline.`, reply:true
                }
            }

            if (mode == "disable" || mode == "off") {
                if(!offlineOnlyChannels.includes(id)) {
                    return {
                        text: `This channel is already not in offline only mode! oshDank`, reply:true
                    }
                }
            await bot.db.channels.updateOne({id: id}, { $set: { offlineOnly: true }})
            return{
                text: `This channel is no longer in offline only mode. FeelsGoodMan`, reply:true
            }
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};