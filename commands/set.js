const got = require("got");
module.exports = {
    name: "set",
    cooldown: 3000,
    aliases: ["emoteset", "7tvu", "7tvset"],
    description: `set <7tv-emote> | shows emote set info | https://bot.oshgay.xyz/7tv/set`,
    execute: async context => {
        try {
            let user = context.message.args[0] ?? context.channel.login;
            user = user.replace('@','');
            user = user.replace('#','');

            let ivr
            let userID
            if(context.message.args[0]){
                ivr = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
                if(!ivr[0].id) {
                    return {
                        text:`This twitch user does not exist. FallHalp`, reply:true
                    }
                }
                userID = ivr[0].id
            } else {
                userID = context.user.id
            }

            let data;
            try {
                data = await got(`https://7tv.io/v3/users/twitch/${userID}`).json()
            } catch(err) {
                return {
                    text:`Error fetching this user's 7tv profile. FallHalp`, reply:true
                }
            }

            return{
                text:`${bot.Utils.unping(data.display_name)}'s current 7tv set: "${data.emote_set.name}" • ${data.emote_set.emote_count}/${data.emote_set.capacity} Slots • ${data.user.editors.length} Editors`, reply:true,
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};