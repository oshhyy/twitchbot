const got = require("got");
module.exports = {
    name: "whatemoteisit",
    cooldown: 3000,
    aliases: ['weit'],
    description: `whatemoteisit <emote> - shows statistics on a twitch emote`,
    execute: async context => {
        try {
            // command code
            let emote = context.message.args[0] ?? context.user.login;
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'No Emote Provided. FeelsDankMan', reply:true
                    };
                }
            }
            
            let data
            try {
                data = await got(`https://api.ivr.fi/v2/twitch/emotes/${emote}`).json();
            }
            catch(err) {
                return {
                    text:'Invalid Emote! FeelsDankMan', reply:true
                };
            }

            let imageLink = ""
            if (context.badges.hasModerator || context.badges.hasBroadcaster || context.badges.hasVIP) {
                imageLink = data.emoteURL.replace("/1.0", "/3.0")
            }

            if(data.emoteState == "ARCHIVED") { // EMOTE NOT ENABLED 
                return{
                    text:`${data.emoteCode} • ID: ${data.emoteID} • Archived ${data.emoteAssetType.toLowerCase()} emote from channel ${data.channelName} ${imageLink}`, reply:true
                }
            }

            if(data.emoteType == "BITS_BADGE_TIERS") { // BITS EMOTE 
                return{
                    text:`${data.emoteCode} • ID: ${data.emoteID} • ${data.emoteAssetType[0].toUpperCase() + data.emoteAssetType.slice(1).toLowerCase()} ${data.emoteBitCost} bits emote from channel ${data.channelName} ${imageLink}`, reply:true
                }
            }

            if(data.emoteType == "BITS_BADGE_TIERS") { // FOLLOWER EMOTE 
                return{
                    text:`${data.emoteCode} • ID: ${data.emoteID} • ${data.emoteAssetType[0].toUpperCase() + data.emoteAssetType.slice(1).toLowerCase()} follower emote from channel ${data.channelName} ${imageLink}`, reply:true
                }
            }

            return{
                text:`${data.emoteCode} • ID: ${data.emoteID} • ${data.emoteAssetType[0].toUpperCase() + data.emoteAssetType.slice(1).toLowerCase()} Tier ${data.emoteTier} emote from channel ${data.channelName} ${imageLink}`, reply:true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};