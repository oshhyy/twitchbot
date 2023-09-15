const got = require("got");
module.exports = {
    name: "followage",
    cooldown: 5000,
    aliases: ["fa"],
    description: `followage [username] [channel] - checks the date user has followed a channel`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login;
            user = user.toLowerCase().replace("@", "")
            console.log(user)
            let channel = context.message.args[1] ?? context.channel.login;
            channel = channel.toLowerCase().replace("@", "")
            console.log(channel)
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! FeelsDankMan', reply:true
                    };
                }
            }
            
            let data
            try {
                data = await got(`https://api.ivr.fi/v2/twitch/subage/${user.toLowerCase()}/${channel.toLowerCase()}`).json();
            }
            catch(err) {
                return {
                    text:'Invalid Username! FeelsDankMan', reply:true
                };
            }

            if(!data.followedAt) {
                return{text:`User ${data.user.displayName} is not following ${data.channel.displayName}.`, reply:true}
            }

            const currentDate = new Date();
            const followageDate = new Date(data.followedAt);
            const durationInMs = followageDate.getTime() - currentDate.getTime();

            return{text:`User ${data.user.displayName} has been following ${data.channel.displayName} for ${bot.Utils.humanize(durationInMs)}. (Followed on ${followageDate.toDateString()})`, reply:true}

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};