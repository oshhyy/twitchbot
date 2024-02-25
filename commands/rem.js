const got = require("got");
module.exports = {
    name: "rem",
    cooldown: 15000,
    aliases: ['randomemote', 'emote'],
    description: `rem <expression> | https://bot.oshgay.xyz/util/emote`,
    execute: async context => {
        try {
            // command code

            const ignoredSets = ['0', '42', '19194', '300374282']

            let delay;
            
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP) {delay = 1500}
            else{delay = 0}


            const emoteSets = bot.Client.userStateTracker.channelStates[context.channel.login].emoteSets.filter(e => !ignoredSets.includes(e))
            if (!emoteSets.length) return { text: 'The bot is not subscribed to any channels FeelsBadMan', reply: true }

            console.log(emoteSets.join(','))

            const data = await got(`https://api.ivr.fi/v2/twitch/emotes/sets?set_id=${emoteSets.join(',')}`).json(); 
            const subEmoteSets = data.map(set => ({
                ID: set.setID,
                channel: {
                    name: set.channelName,
                    login: set.channelLogin,
                    ID: set.channelID,
                },
                tier: set.tier,
                emotes: (set.emoteList ?? []).map(i => ({
                    ID: i.id,
                    token: i.code,
                    animated: i.assetType === "ANIMATED",
                })),
            }));

            const result = [];

            let listOfEmotes = [];
            let phrase = ''
            
            for (const setData of subEmoteSets) {
                const emotes = []; for (const emote of setData.emotes) { emotes.push(emote.token); } 
                result.push(...emotes); 
            }
            let regex;
            let xd;
            try {
                regex = new RegExp(`\\b\\w*${context.message.args[0]}\\w*\\b`, "i");
                xd = result.filter(emote => regex.test(emote));
            } catch (error) {
                return{text:"Error: You provided an invalid RegExp monkaS", reply:true}
            }
            
            if(context.message.params.all) {
                if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP) {
                    return {};
                }
                if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster) {
                    return {
                        text: `I can't perform this command because I am not moderator or vip! NOIDONTTHINKSO`, reply: true
                    };
                }
                const len = 475
                let curr = len;
                let prev = 0;
                let emoteList = [];
                while (phrase[curr]) {
                    if (phrase[curr++] === ' ') {
                        emoteList.push(phrase.substring(prev, curr));
                        prev = curr;
                        curr += len;
                    }
                }

                for(const element of emoteList) {
                    bot.Client.privmsg(context.channel.login, element)
                }

                return{}
            }



            let message = `${xd.join(" ").substring(0, 500)}`
            if(xd.join(" ").length > 500) {
                message = `${xd.join(" ").substring(0, 497)}...`
            }
            console.log(message)

            if (message == '') {
                return {
                    text:'No emotes found! FeelsBadMan', reply:true
                }
            }            

            return {
                text: message,
            };

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};