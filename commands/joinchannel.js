const got = require("got");

module.exports = {
    name: "joinchannel",
    cooldown: 10000,
    aliases: ["connect", "join"],
    description: `connect - Adds the bot to your channel. Admins can use this command to join a specified channel.`,
    execute: async context => {
        try {
            // command code

            const channels = (await bot.db.channels.find({ isChannel: true })).map(c => c.id);
            const channelsOff = (await bot.db.channels.find({ isChannel: false })).map(c => c.id);
            if (!context.message.params.channel) {
                if (context.channel.id != "489223884") { return }

                if (channels.includes(context.user.id)) {
                    return {
                        text: `I am already in your channel! oshDank`, reply: true
                    }
                }

                if(channelsOff.includes(context.user.id)) { // if bot has been in users channel before
                    await bot.db.channels.updateOne( { id: context.user.id}, { $set: { isChannel: true, username: context.user.login } } )
                    bot.Client.join(context.user.login);
                    bot.Webhook.colorEmbed(`4388216`, `Rejoined channel!`, `${context.user.login} • ${context.user.id}`);
                    return {
                        text: `Joined channel #${context.user.login} feinArrive`, reply: true
                    }
                }

                const newChannel = new bot.db.channels({ id: context.user.id, username: context.user.login, isChannel: true, joinedAt: Date.now(), settings: { offlineOnly: false }, });
                await newChannel.save();
                bot.Client.join(context.user.login);

                bot.Webhook.colorEmbed(`4388216`, `Joined new channel!`, `${context.user.login} • ${context.user.id}`);

                return {
                    text: `Joined channel #${context.user.login} feinArrive`, reply: true
                }
            }

            if (context.message.params.channel) {
                const userInfo = await bot.db.users.findOne({username: context.user.login})
                if (!userInfo || userInfo.level < 3) {
                    return { text: "You are not permitted to join other channels! FailFish (requires level 3)", reply: true }
                }
                let channel = context.message.args[0].toLowerCase().replace("channel:", "");

                const xd = await got(`https://api.ivr.fi/v2/twitch/user?login=${channel}`).json();

                if (xd[0]) {
                    if (channels.includes(xd[0].id)) {
                        return {
                            text: `I am already in the channel @${channel} oshDank`, reply: true
                        }
                    }

                    const channelInfo = await bot.db.channels.findOne({id: xd[0].id})
                    
                    if(channelInfo) {
                        await bot.db.channels.updateOne( { id: xd[0].id}, { $set: { isChannel: true } } )
                    } else {
                        let a = new bot.db.channels({ id: xd[0].id, username: xd[0].login, isChannel: true, joinedAt: Date.now(), settings: { offlineOnly: false }, });
                        await a.save()
                    }

                    try {
                        bot.Client.join(channel)
                    }
                    catch (err) {
                        return { text: `Unable to join channel #${channel} monkaS`, reply: true }
                    }

                    bot.Webhook.colorEmbed(`4388216`, `Joined new channel!`, `${channel} • \n\nAdded by ${context.user.name}`);

                    return {
                        text: `Joined channel #${channel} feinArrive`, reply: true
                    }
                } else {
                    return {
                        text: `User not found! monkaS`, reply: true
                    }
                }
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};