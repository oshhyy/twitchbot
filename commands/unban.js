const fs = require('fs');
const got = require("got");

module.exports = {
    name: "unban",
    cooldown: 5000,
    aliases: [],
    description: `unban <user> - unbans someone from the bot MODS <admin only>`,
    execute: async context => {
        try {
            // command code
            if (context.user.id != "489223884") {
                return { text: "Error: You are not permitted to use this command! FailFish", reply:true}
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

            if(!bannedChannels.includes(id)) {
                return {
                    text: `That user is not banned. FeelsDankMan`, reply:true
                }
            }

            const updatedList = bannedChannels.join("\n").replace(`\n${id}`, '');
            await fs.writeFile("./bannedUsers.txt", updatedList, (err) => {
                if (err) {
                    console.error(err);
                    return {
                        text: `Error: Unable to unban this user. monkaS`, reply:true
                    };
                }
            })

            bot.Webhook.colorEmbed(`4388216`, `New Unbanned User!`, `${user} • ${id} \n\n unbanned by @${context.user.login} in #${context.channel.login}`);

            return{
                text: `MODS unbanned ${user}.`, reply:true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};