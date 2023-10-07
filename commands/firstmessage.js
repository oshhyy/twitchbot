const got = require("got");

module.exports = {
    name: "firstmessage",
    cooldown: 5000,
    aliases: ["fl", "fm"],
    description: `firstmessage [user] - gets a user's first logged message in a chat`,
    execute: async context => {
        try {
            // this code is really dogshit and dank and breaks and needs changes saudhsdjklfhskfhskdj
            let user = context.user.login
            let channel = context.channel.login
            if (context.message.params.channel) {
                channel = context.message.params.channel
            }

            if (context.message.args[0]) {
                if(context.message.args[0].startsWith("#")) {
                    user = context.user.login
                    channel = context.message.args[0].replace("#", "").toLowerCase()
                } else {
                    user = context.message.args[0].replace("@", "").toLowerCase()
                    for (element of context.message.args) {
                        if (element.startsWith("#")) {
                            channel = element.replace("#", "")
                        }
                    }
                }
            }

            let data = await got(`https://logs.zonian.dev/api/${channel}/${user}`).json()

            if (data.error === null) {
                let prefix = data.channelLogs.instances[0]
                
                try{
                    const logsData = await got(`${prefix}/list?channel=${channel}&user=${user}`).json()
                    let firstMonth = logsData.availableLogs[logsData.availableLogs.length - 1]
                    let {body : res} = await got(`${prefix}/channel/${channel}/user/${user}/${firstMonth.year}/${firstMonth.month}`)
                    return{text:res.split('\n')[0], reply:true}
                } catch(err) {
                    return{text:"Could not load logs for this user/channel", return:true}
                }
            } else {
                return{text:data.error, reply:true}
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};