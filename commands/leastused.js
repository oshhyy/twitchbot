const got = require("got");
module.exports = {
    name: "leastused",
    cooldown: 3000,
    aliases: ["7tvstats2", "leastusedemotes", "bottomemotes"],
    description: `leastused <7tv emote> | https://osh-1.gitbook.io/osh_______/7tv/leastused`,
    execute: async context => {
        try {
            return{text:`Because of the emote-tracking API going down, this command has been deprecated FeelsBadMan`, reply:true}
            // command code
            // let user = context.message.args[0] ?? context.channel.login;
            // user = user.replace('@','');
            // user = user.replace('#','');
            // let message = `least used 7tv emotes in #${user} `

            // let idData 
            // try{
            //     idData = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
            // } catch(err) {
            //     return {
            //         text:`Error: The provided username is invalid!`, reply:true
            //     }
            // }
            

            // let data;
            // let dataFromKattahsAPI;
            // let enabledEmotes;
            // let filteredEmotes;


            // if (context.message.args[0] == '#global') {
            //     try {
            //         data = await got(`https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857`).json()
            //     } catch(err) {
            //         return {
            //             text:`Error: No 7tv emotes found for this channel FeelsDankMan`, reply:true
            //         }
            //     }
            //     dataFromKattahsAPI = await got(`https://api.kattah.me/global?limit=23894792834`).json()

            //     enabledEmotes = data.emotes.map(emote => emote.id)
            //     filteredEmotes = dataFromKattahsAPI.emotes.filter(emote => enabledEmotes.includes(emote.emote_id))
            //     for (let i = 1; i <= 5 ; i++) {
            //         message = message.concat(` • ${filteredEmotes[filteredEmotes.length - i].emote} (${filteredEmotes[filteredEmotes.length - i].total_count.toLocaleString()})`)
            //     }

            // } else {
            //     try {
            //         data = await got(`https://7tv.io/v3/users/twitch/${idData[0].id}`).json()
            //     } catch(err) {
            //         return {
            //             text:`Error: No 7tv emotes found for this channel FeelsDankMan`, reply:true
            //         }
            //     }
            //     try {
            //         dataFromKattahsAPI = await got(`https://api.kattah.me/c/${user}?limit=23894792834`).json()
            //     } catch(err) {
            //         return {
            //             text:`Error: This channel's 7tv emote usage is not tracked! FeelsDankMan`, reply:true
            //         }
            //     }

            //     enabledEmotes = data.emote_set.emotes.map(emote => emote.id)
            //     filteredEmotes = dataFromKattahsAPI.emotes.filter(emote => enabledEmotes.includes(emote.emote_id))
            //     for (let i = 1; i <= 5 ; i++) {
            //         message = message.concat(` • ${filteredEmotes[filteredEmotes.length - i].emote} (${filteredEmotes[filteredEmotes.length - i].count.toLocaleString()})`)
            //     }
            // }

            // return{
            //     text:message, reply:true,
            // }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};