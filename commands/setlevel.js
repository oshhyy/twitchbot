function levelRoles(num) {
    if (num == 0) return "Blacklisted"
    if (num == 1) return "User"
    if (num == 2) return "Moderator"
    if (num == 3) return "Dev"
    if (num == 4) return "Admin"
    return "N/A"
}
const got = require("got");
module.exports = {
    name: "setlevel",
    cooldown: 0,
    aliases: ["setlvl"],
    description: `setevel <user> <level> - sets a user's level (requires level 3) forsenLevel`,
    execute: async context => {
        try {
            const userInfo = await bot.db.users.findOne({username: context.user.login})

            if (!userInfo || userInfo.level < 3) {
                return { text: "You are not permitted to use this command! FailFish (level 3 required)", reply:true}
            }
            // command code

            const user = context.message.args[0].toLowerCase()
            const level = context.message.args[1]

            if(!user || !level) {return { text: "Please provide a username and level!", reply:true}}
            
            const xd = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();

            if (!xd[0]) {
                return { text: "Please provide a valid username!", reply:true}
            }
            const id = xd[0].id

            const data = await bot.db.users.findOne({id: id})

            if(!data) {
                const newUser = new bot.db.users({
                    id: id,
                    username: user,
                    level: level,
                })
                await newUser.save();
            } else {
                await bot.db.users.updateOne( { id: id }, { $set: { level: level } })
            }            

            return {
                text: `set level for ${user}: ${level} (${levelRoles(level)})`,
                reply: true,
            };
            
        } catch (err) {
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};