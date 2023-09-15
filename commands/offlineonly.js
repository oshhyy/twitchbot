const fs = require('fs');
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

            let offlineChannels = fs.readFileSync("./offlineOnly.txt", { encoding: "utf-8" })
            const offlineOnlyChannels = offlineChannels.split("\n");

            if (mode == "enable" || mode == "on") {
                if(offlineOnlyChannels.includes(id)) {
                    return {
                        text: `This channel is already in offline only mode! FeelsDankMan`,
                        reply:true
                    }
                }
                await fs.appendFileSync("./offlineOnly.txt", `\n${id}`);
                return{
                    text: `This channel is now in offline only mode. FeelsGoodMan I will now only respond to commands if the channel is offline.`, reply:true
                }
            }

            if (mode == "disable" || mode == "off") {
                if(!offlineOnlyChannels.includes(id)) {
                    return {
                        text: `This channel is already not in offline only mode! FeelsDankMan I will now respond to commands if the channel is both ofline and online.`, reply:true
                    }
                }
            const updatedList = offlineOnlyChannels.join("\n").replace(`\n${id}`, '');
            await fs.writeFile("./offlineOnly.txt", updatedList, (err) => {
                if (err) {
                    console.error(err);
                    return {
                        text: `Error: Unable to remove user from offline mode.`, reply:true
                    };
                }
            })
            return{
                text: `This channel is no longer in offline only mode. FeelsGoodMan`, reply:true
            }
            }
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};