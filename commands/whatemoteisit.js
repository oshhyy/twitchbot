const got = require("got");
module.exports = {
    name: "whatemoteisit",
    cooldown: 3000,
    aliases: ['weit'],
    description: `whatemoteisit <emote> - shows statistics on a twitch emote`,
    execute: async context => {
        try {
            // command code
            let emote = context.message.args[0]
            
            let data
            try {
                data = await got(`https://api.potat.app/twitch/emotes?name=${emote}`).json();
            }
            catch(err) {
                return {
                    text:'Invalid Emote! oshDank', reply:true
                };
            }

            let imageLink = ""
            if (context.badges.hasModerator || context.badges.hasBroadcaster || context.badges.hasVIP) {
                imageLink = data.data[0].emoteURL
            }

            let artist = ""
            if(data.data[0].artist) {
                artist = `• artist: @${data.data[0].artist.login}`
            }

            if(data.data[0].emoteType == "BITS_BADGE_TIERS") { // BITS EMOTE 
                return{
                    text:`${data.data[0].emoteCode} • ID: ${data.data[0].emoteID} • ${data.data[0].emoteAssetType[0].toUpperCase() + data.data[0].emoteAssetType.slice(1).toLowerCase()} ${data.data[0].emoteType[0].toUpperCase() + data.data[0].emoteType.slice(1).toLowerCase()} ${data.data[0].bitCost} bits emote from channel @${data.data[0].channelName} ${artist} ${imageLink}`, reply:true
                }
            }

            return{
                text:`${data.data[0].emoteCode} • ID: ${data.data[0].emoteID} • ${data.data[0].emoteAssetType[0].toUpperCase() + data.data[0].emoteAssetType.slice(1).toLowerCase()}  ${data.data[0].emoteType[0].toUpperCase() + data.data[0].emoteType.slice(1).toLowerCase()} emote from channel @${data.data[0].channelName} ${artist} ${imageLink}`, reply:true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};