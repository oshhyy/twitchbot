
const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "link",
    cooldown: 3000,
    aliases: ["linkfm", "linklastfm"],
    description: `link <lastfm-username> - links your account to last fm`,
    execute: async context => {
        try {
            // command code
            if(!context.message.args[0]) {
                const { prefix } = await bot.db.channels.findOne({id: context.channel.id});
                return{text:`usage: ${prefix}link <lastfm-username>`, reply:true}
            }
            let lastfmName = context.message.args[0]
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${lastfmName}&api_key=${config.lastfmKey}&format=json`, {throwHttpErrors:false}).json()
            if(data.message) {
                return{text:data.message, reply:true}
            }
            const userInfo = await bot.db.users.findOne({id: context.user.id})
            if(!userInfo){
                const newUser = new bot.db.users({
                    id: context.user.id,
                    username: context.user.login,
                    level: "1",
                    lastfm: lastfmName,
                })
                await newUser.save();
            } else {
                await bot.db.users.updateOne( { id: context.user.id }, { $set: { lastfm: lastfmName } })
            }

            return{text:`Your last fm account has successfully linked to "${lastfmName}"!`, reply:true}
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};