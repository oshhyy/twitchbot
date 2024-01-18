const got = require("got");
module.exports = {
    name: "subage",
    cooldown: 5000,
    aliases: ['sa'],
    description: `sa [user] [channel] - checks to see how long a user is subbed to a channel, with extra statistics`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login;
            user = user.toLowerCase().replace("@", "")
            if (user == "me") {user = context.user.login.toLowerCase()}
            let channel = context.message.args[1] ?? context.channel.login;
            channel = channel.toLowerCase().replace("@", "")
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! oshDank', reply:true
                    };
                }
            }
            
            let data
            try {
                data = await got(`https://api.ivr.fi/v2/twitch/subage/${user}/${channel}`).json();
            }
            catch(err) {
                return {
                    text:`User was not found. oshDank`, reply:true
                };
            }

            const currentDate = new Date();
            let givenDate
            let durationInMs

            if(data.statusHidden) { // SUBAGE HIDDEN
                if(!data.meta) { // NOT SUBBED
                    return{text:`User ${data.user.displayName} is currently not subscribed to ${data.channel.displayName}. This user's Subscription Status is hidden.`, reply:true}
                }

                if(data.meta.type == 'prime') { // SUBBED WITH PRIME
                    givenDate = new Date(data.meta.endsAt);
                    durationInMs = givenDate.getTime() - currentDate.getTime();
                    return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} with Twitch Prime. This user's Subscription Status is hidden. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
                }

                if(data.meta.type == 'gift') { // GIFTED SUB
                    givenDate = new Date(data.meta.endsAt);
                    durationInMs = givenDate.getTime() - currentDate.getTime();
    
                    let gifter = data.meta.giftMeta.gifter.displayName
                    let gifterNonPing = gifter.slice(0, 3) + "󠀀" + gifter.slice(3)
    
    
                    return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} with a Tier ${data.meta.tier} gifted sub by ${gifterNonPing}. This user's Subscription Status is hidden. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
                }
                
                return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} at Tier ${data.meta.tier}. This user's Subscription Status is hidden.`, reply:true}
            }

            if(!data.meta) { // NOT SUBBED
                if(!data.cumulative) {
                    return{text:`User ${data.user.displayName} is currently not subscribed to ${data.channel.displayName}, and never has been before.`, reply:true}
                }
                givenDate = new Date(data.cumulative.end);
                durationInMs = currentDate.getTime() - givenDate.getTime();
                return{text:`User ${data.user.displayName} is currently not subscribed to ${data.channel.displayName}, but has previously subscribed for a total of ${data.cumulative.months} months. They have last been subscribed ${bot.Utils.humanize(durationInMs)} ago.`, reply:true}
            }

            if(data.meta.endsAt == null) { // PERMA SUB
                return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} at Tier ${data.meta.tier}. They have been subscribed for ${data.cumulative.months} months. This is a permanent sub!`, reply:true}
            }

            if(data.meta.type == 'prime') { // SUBBED WITH PRIME
                givenDate = new Date(data.cumulative.end);
                durationInMs = givenDate.getTime() - currentDate.getTime();
                return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} with Twitch Prime. They have been subscribed for ${data.cumulative.months} months. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
            }

            if(data.meta.type == 'gift') { // GIFTED SUB
                givenDate = new Date(data.meta.endsAt);
                durationInMs = givenDate.getTime() - currentDate.getTime();

                if(data.meta.giftMeta.gifter) {
                    let gifter = data.meta.giftMeta.gifter.displayName
                    let gifterNonPing = gifter.slice(0, 3) + "󠀀" + gifter.slice(3)

                    return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} with a Tier ${data.meta.tier} gifted sub by ${gifterNonPing}. They have been subscribed for ${data.cumulative.months} months. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
                } else { // ANON GIFT SUB
                    return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} with a Tier ${data.meta.tier} gifted sub by an anonymous user. They have been subscribed for ${data.cumulative.months} months. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
                }
            }

            if(!data.meta.renewsAt) { // NOT RENEW
                givenDate = new Date(data.meta.endsAt);
                durationInMs = givenDate.getTime() - currentDate.getTime();

                return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} at Tier ${data.meta.tier}. They have been subscribed for ${data.cumulative.months} months. This sub expires in ${bot.Utils.humanize(durationInMs)}.`, reply:true}
            }
            
            givenDate = new Date(data.meta.renewsAt);
            durationInMs = givenDate.getTime() - currentDate.getTime();

            return{text:`User ${data.user.displayName} is currently subscribed to ${data.channel.displayName} at Tier ${data.meta.tier}. They have been subscribed for ${data.cumulative.months} months. This sub renews in ${bot.Utils.humanize(durationInMs)}.`, reply:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};