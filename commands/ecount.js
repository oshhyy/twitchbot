const got = require("got");
module.exports = {
    name: "ecount",
    cooldown: 3000,
    aliases: ["emotecount", "7tvcount", "count"],
    description: `ecount <7tv-emote> | https://bot.oshgay.xyz/7tv/ecount`,
    execute: async context => {
        try {
            let user = context.message.args[1] ?? context.channel.login;
            let emoteToCount = context.message.args[0]
            user = user.replace('@','');
            user = user.replace('#','');

            let trackingData;
            try {
                trackingData = await got(`https://7tv.markzynk.com/c/${user}`).json()
            } catch(err) {
                return {
                    text:`This channel's 7tv emote usage is not tracked. To enable tracking, open a suggestion using +suggest tracking <channelname>`, reply:true
                }
            }

            let data;
            try {
                data = await got(`https://7tv.io/v3/users/twitch/${trackingData.channel.id}`).json()
            } catch(err) {
                return {
                    text:`No 7tv emotes found for this channel oshDank`, reply:true
                }
            }

            const enabledEmotes = data.emote_set.emotes.map(emote => emote.id) 


            const filteredEmotes = trackingData.emotes.filter(emote => enabledEmotes.includes(emote.id)) // only emotes that are enabled in channel
            let foundEmote = filteredEmotes.find(e=>(e?.alias ?? e?.name) === emoteToCount)  // actual emote the user enters
            
            if(!foundEmote) {
                foundEmote = trackingData.emotes.find(e=>e && e.emote === emoteToCount)
                
                if(!foundEmote) {
                    return{
                        text:`That emote is not enabled in channel #${user} oshDank`, reply:true
                    }
                }
                
                number = trackingData.emotes.findIndex((e)=>e.emote===foundEmote.emote) + 1;

                return{
                    text:`The 7tv emote ${foundEmote.emote} is not currently enabled in channel #${user}. While it was enabled, it was used ${foundEmote.count.toLocaleString()} times (Rank #${number})`, reply:true
                }
            }

            
            number = filteredEmotes.findIndex((e)=>foundEmote.alias ? e.alias === foundEmote.alias : e.name === foundEmote.name) + 1;
            

            return{
                text:`Usage of ${foundEmote?.alias ?? foundEmote?.name} in #${user}: ${foundEmote.count.toLocaleString()} (Rank #${number})`, reply:true,
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};