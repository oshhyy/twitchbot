const got = require("got");
module.exports = {
    name: "leastused",
    cooldown: 3000,
    aliases: ["7tvstats2", "leastusedemotes", "bottomemotes"],
    description: `leastused <7tv emote> | https://bot.oshgay.xyz/7tv/leastused`,
    execute: async context => {
        try {
            let isFiltered = false
            for(let i = 0; i < context.message.args.length; i++) {
                if(context.message.args[i] == "-f"){
                    context.message.args.splice(i, 1)
                    isFiltered = true
                }
            }

            let user = context.message.args[0] ?? context.channel.login;
            user = user.replace('@', '').replace('#', '');
            let message = `least used 7tv emotes in #${user} `
            
            let idData
            try {
                idData = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
            } catch (err) {
                return {
                    text: `Error: The provided username is invalid!`, reply: true
                }
            }

            let data;
            let trackingData;
            let enabledEmotes;
            let filteredEmotes;
            let emoteName;

            try {
                data = await got(`https://7tv.io/v3/users/twitch/${idData[0].id}`).json()
            } catch (err) {
                return {
                    text: `Error: No 7tv emotes found for this channel oshDank`, reply: true
                }
            }
            try {
                trackingData = await got(`https://7tv.markzynk.com/c/${user}`).json()
            } catch (err) {
                return {
                    text: `This channel's 7tv emote usage is not tracked. To enable tracking, open a suggestion using #suggest tracking <channelname>`, reply: true
                }
            }

            enabledEmotes = data.emote_set.emotes.map(emote => emote.id)
            if(isFiltered) {
                filteredEmotes = trackingData.emotes.filter(emote => enabledEmotes.includes(emote.id) && emote.count != 0)
            } else {
                filteredEmotes = trackingData.emotes.filter(emote => enabledEmotes.includes(emote.id))
            }
            
            for (let i = 1; i <= 5; i++) {
                emoteName = filteredEmotes[filteredEmotes.length - i].alias ?? filteredEmotes[filteredEmotes.length - i].name
                message = message.concat(` • ${emoteName} (${filteredEmotes[filteredEmotes.length - i].count.toLocaleString()})`)
            }

            return {
                text: message, reply: true,
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};