const got = require("got");

module.exports = {
    name: "part",
    cooldown: 5000,
    aliases: ["leavechannel", "leave"],
    description: `part - Removes the bot from your channel. Requires Moderator or Broadcaster. `,
    execute: async context => {
        try {
            // command code

            const channels = (await bot.db.channels.find({ isChannel: true })).map(c => c.id);
            let channel = context.channel.login

            if (!context.badges.hasBroadcaster && !context.badges.hasModerator) {
                if(!context.channel.id == "489223884") {
                    return{}
                } else {
                    channel = context.user.login
                }
            } else {
                channel = context.channel.login
            }

            if(context.message.params.channel) {
                const userInfo = await bot.db.users.findOne({username: context.user.login})
                if (!userInfo || userInfo.level < 3) {
                    return{text:"You do not have permission to part other channels! FailFish (requires level 3)"}
                }
                channel = context.message.params.channel
            }

            const xd = await got(`https://api.ivr.fi/v2/twitch/user?login=${channel}`).json();

            if (channels.includes(xd[0].id)) {
                await bot.db.channels.updateOne( { id: xd[0].id}, { $set: { isChannel: false } } )
                bot.Client.privmsg(context.channel.login, `Parting channel ${channel} FallCry 👋`)
                bot.Client.part(channel)
                bot.Webhook.colorEmbed(`16744576`, `Parted channel!`, `${channel} - ${xd[0].id} • parted by ${context.user.login}`);
                return;
            }

            return{text:`The bot was not in the channel ${channel} to begin with!`}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};