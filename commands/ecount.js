const got = require("got");
module.exports = {
    name: "ecount",
    cooldown: 3000,
    aliases: ["emotecount", "7tvcount", "count"],
    description: `ecount <7tv-emote> | https://osh-1.gitbook.io/osh_______/7tv/ecount`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[1] ?? context.channel.login;
            let emoteToCount = context.message.args[0]
            user = user.replace('@','');
            user = user.replace('#','');

            let dataFromKattahsAPI;
            try {
                dataFromKattahsAPI = await got(`https://api.kattah.me/c/${user}?limit=23894792834`).json()
            } catch(err) {
                return {
                    text:`This channel's 7tv emote usage is not tracked! FeelsDankMan`, reply:true
                }
            }

            let data;
            try {
                data = await got(`https://7tv.io/v3/users/twitch/${dataFromKattahsAPI.user.twitch_id}`).json()
            } catch(err) {
                return {
                    text:`No 7tv emotes found for this channel FeelsDankMan`, reply:true
                }
            }

            const enabledEmotes = data.emote_set.emotes.map(emote => emote.id) 

            console.log(dataFromKattahsAPI)

            const filteredEmotes = dataFromKattahsAPI.emotes.filter(emote => enabledEmotes.includes(emote.emote_id)) // only emotes that are enabled in channel
            let foundEmote = filteredEmotes.find(e=>e && e.emote === emoteToCount) // actual emote the user enters
            console.log(filteredEmotes)
            
            if(!foundEmote) {
                foundEmote = dataFromKattahsAPI.emotes.find(e=>e && e.emote === emoteToCount)
                
                if(!foundEmote) {
                    return{
                        text:`That emote is not enabled in channel #${user} FeelsDankMan`, reply:true
                    }
                }
                
                number = dataFromKattahsAPI.emotes.findIndex((e)=>e.emote===foundEmote.emote) + 1;

                return{
                    text:`The 7tv emote ${foundEmote.emote} is not currently enabled in channel #${user}. While it was enabled, it was used ${foundEmote.count.toLocaleString()} times (Rank #${number})`, reply:true
                }
            }

            number = filteredEmotes.findIndex((e)=>e.emote===foundEmote.emote) + 1;

            return{
                text:`Usage of ${foundEmote.emote} in #${user}: ${foundEmote.count.toLocaleString()} (Rank #${number})`, reply:true,
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};