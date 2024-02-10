
const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "link",
    cooldown: 3000,
    aliases: ["linkaccount"],
    description: `link <type> <username> - links your accounts. current types: mc, lastfm`,
    execute: async context => {
        try {
            // command code
            if (!context.message.args[0]) {
                const { prefix } = await bot.db.channels.findOne({ id: context.channel.id });
                return { text: `usage: ${prefix}link <type> <username> - current types: mc, lastfm`, reply: true }
            }
            let type = context.message.args[0]
            let name = context.message.args[1]
            let data, userInfo, newUser
            if (!name) { return { text:'usage: +link <mc|lastfm> <username> !', reply: true } }
            if (type == "lastfm") {
                data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${name}&api_key=${config.lastfmKey}&format=json`, { throwHttpErrors: false }).json()
                if (data.message) {
                    return { text: data.message, reply: true }
                }
                userInfo = await bot.db.users.findOne({ id: context.user.id })
                if (!userInfo) {
                    newUser = new bot.db.users({
                        id: context.user.id,
                        username: context.user.login,
                        level: "1",
                        lastfm: name,
                    })
                    await newUser.save();
                } else {
                    await bot.db.users.updateOne({ id: context.user.id }, { $set: { lastfm: name } })
                }

                return { text: `Your last fm account has successfully linked to "${name}"!`, reply: true }
            } else if (type == "mc" || type == "minecraft") {
                data = await got(`https://api.mojang.com/users/profiles/minecraft/${name}`, { throwHttpErrors: false }).json()
                if(data.errorMessage) {
                    return { text: data.errorMessage, reply: true }
                }

                userInfo = await bot.db.users.findOne({ id: context.user.id })
                if (!userInfo) {
                    newUser = new bot.db.users({
                        id: context.user.id,
                        username: context.user.login,
                        level: "1",
                        mcid: data.id
                    })
                    await newUser.save();
                } else {
                    await bot.db.users.updateOne({ id: context.user.id }, { $set: { mcid: data.id } })
                }

                return { text: `Your minecraft account has successfully linked to "${data.name}"!`, reply: true }

            }
            
        } catch (err) {
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};