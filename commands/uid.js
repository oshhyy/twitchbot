const got = require("got");

module.exports = {
    name: "uid",
    cooldown: 3000,
    aliases: ['uid', 'id', 'userid', 'banned', 'isbanned', 'isaffiliate', 'ispartner'],
    description: `uid [user] - shows the users id, as well as if they are banned or not (as well as duration) including partner/affiliate`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login;
            user = user.toLowerCase().replace("@", "")
            if (!context.message.args[0]) {}
            else { 
                if (context.message.args[0].includes('/')) {
                    return {
                        text:'Invalid Username! oshDank', reply:true
                    };
                }
            }
            let link = `?login=${user}`

            if (context.message.params.id) {
                user = context.message.params.id
                link = `?id=${user}`
            }
            let data = await got(`https://api.ivr.fi/v2/twitch/user${link}`).json();
            if (!data[0]) {return{text:`Invalid Username/ID Provided.`, reply:true}}

            let statusText = ''

            if (data[0].roles.isAffiliate) {
                statusText = '(affiliate)'
            }
            if (data[0].roles.isPartner) {
                statusText = '(partner)'
            }
    
            if (data[0].banned) {
                return {
                    text:`⛔ ${data[0].login} (${data[0].id}) is band LuL GuitarTime ${data[0].banReason} ${statusText}`, reply:true
                };
            }

            return {
                text: `✅ ${data[0].login}: ${data[0].id} ${statusText}`, reply:true
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};