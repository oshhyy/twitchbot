const got = require("got");

module.exports = {
    name: "stats",
    cooldown: 15000,
    aliases: ['user'],
    description: `stats [user] https://osh-1.gitbook.io/osh_______/util/stats`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login;
            user = user.replace('@','');
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! FeelsDankMan', reply:true
                    };
                }
            }
    
            const data = await got(`https://api.ivr.fi/v2/twitch/user?login=${user}`).json();
            if (!data[0]) {
                return {
                    text:'Invalid Username! FeelsDankMan', reply:true
                };
            }
    
            const roles = []
            const dateOfCreation = new Date(data[0].createdAt);
            const currentDate = new Date();
            let durationInMs = dateOfCreation.getTime() - currentDate.getTime();

            const year = dateOfCreation.getFullYear()
            const month = dateOfCreation.getMonth() + 1
            const date = dateOfCreation.getDate() 

            let banText = '';
            let badges = data[0].badges.map(x=>x.title).join(', ') 

            if (!badges) badges = 'none'

            if (data[0].roles.isAffiliate) roles.push('affiliate')
            if (data[0].roles.isPartner) roles.push('partner')
            if (data[0].roles.isStaff == false) roles.push('ex-staff')
            if (data[0].roles.isStaff) roles.push('staff')
            if (data[0].verifiedBot) roles.push('bot')
            
            if (roles == "") roles.push ('none')
    
            if (data[0].banned) {
                banText = `⛔ ${data[0].banReason} LuL GuitarTime •`
            }
    
            if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && context.user.id == '489223884') {
                await bot.Utils.sleep(2000)
            }

            let prefixText
            if (data[0].roles.isAffiliate || data[0].roles.isPartner) {
                prefixText = `• prefix: ${data[0].emotePrefix}`
            }
            else prefixText = ''

            return {
                text: `${banText} id: ${data[0].id} • display name: ${data[0].displayName} • login: @${data[0].login} • followers: ${data[0].followers} • following: ${data[0].follows} • roles: ${roles} ${prefixText} • bio: ${data[0].bio} • acct creation date: ${year}-${month}-${date} (${bot.Utils.humanize(durationInMs)} ago) • badges: ${badges}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};