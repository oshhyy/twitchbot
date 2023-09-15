const fs = require('fs');
const got = require("got");

module.exports = {
    name: "ban",
    cooldown: 5000,
    aliases: [],
    description: `ban <username> - bans someone from the bot MODS <admin only>`,
    execute: async context => {
        try {
            // command code
            if (context.user.id != "489223884") {
                return { text: "You are not permitted to use this command! FailFish", reply:true}
            }
            const user = context.message.args[0]

            if (!user) {
                return {text: `Usage: ${bot.Config.prefix} <username>`, reply:true}
            }

            const data = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
            if (!data[0]) {
                return {
                    text:'Invalid Username! FeelsDankMan', reply:true
                };
            }

            let id = data[0].id

            let band = fs.readFileSync("./bannedUsers.txt", { encoding: "utf-8" })
            const bannedChannels = band.split("\n");

            if(bannedChannels.includes(id)) {
                return {
                    text: `That user has already been banned. MODS`, reply:true
                }
            }

            await fs.appendFileSync("./bannedUsers.txt", `\n${id}`); 
            bot.Webhook.colorEmbed(`16744576`, `New Banned User!`, `${user} • ${id} \n\n banned by @${context.user.login} in #${context.channel.login}`);
            return{
                text: `MODS permabanned ${user}.`, reply:true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};