const got = require("got");

module.exports = {
    name: "randomline",
    cooldown: 5000,
    aliases: ["rl", "rq"],
    description: `randomline [user] [channel] - gets a random message in chat. can also put a specific channel, a specific user, or both`,
    execute: async context => {
        try {
            // command code
            let rlCode = ""
            let user = ""
            let channel = context.channel.login
            if (context.message.params.channel) {
                channel = context.message.params.channel
            }

            if (context.message.args[0]) {
                if (context.message.args[1]) {
                    for (element of context.message.args) {
                        console.log(element)
                        if (element.startsWith("#")) {
                            channel = element.replace("#", "")
                        }
                    }
                    user = context.message.args[0].replace("@", "").toLowerCase()
                    rlCode = `channel/${channel}/user/${user}/random`
                } else {
                    user = context.message.args[0].replace("@", "").toLowerCase()
                    rlCode = `channel/${channel}/user/${user}/random`
                    for (element of context.message.args) {
                        console.log(element)
                        if (element.startsWith("#")) {
                            channel = element.replace("#", "")
                            rlCode = `channel/${channel}/random`
                        }
                    }
                }
            } else {
                rlCode = `channel/${channel}/random`
                console.log("hi")
            }

            if (context.message.command.toLowerCase() == "rq") {
                user = context.user.login
                rlCode = `channel/${channel}/user/${user}/random`
            }

            let data
            
            if(user == '') {
                data = await got(`https://logs.zonian.dev/api/${channel}`).json()
            } else {
                data = await got(`https://logs.zonian.dev/api/${channel}/${user}`).json()
            }

            if (data.error === null) {
                let rlPrefix
                if(user == '') {
                    rlPrefix = data.channelLogs.instances[0]
                } else {
                    rlPrefix = data.userLogs.instances[0]
                }

                
                console.log(`${rlPrefix}/${rlCode}`)
                try{
                    let {body : res} = await got(`${rlPrefix}/${rlCode}`)
                    return{text:res, reply:true}
                }catch{
                    return{text:"Could not load logs for this user/channel", reply:true}
                }
            } else {
                return{text:data.error, reply:true}
            }

        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};