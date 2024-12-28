const config = require('../../config.json')
const got = require("got");
exports.handle = async msg => {

    if (msg.channel.login == 'xqc') {
        return;
    }

    const command = bot.Command.get(msg.message.command);
    const prefix = msg.channel.prefix

    if (!command || !command.execute) return;

    if (!msg.message.text.startsWith(prefix)) return;

    const cooldownKey = `${command.name}-${msg.user.id}-${msg.channel.login}`;

    if (bot.Utils.cooldown.has(cooldownKey)) return;

    if (msg.user.id !== "489223884") {
        bot.Utils.cooldown.set(cooldownKey, command.cooldown);
    }
    let reply;

    try {

        const bannedList = (await bot.db.users.find({ level: 0 })).map(c => c.id);
        if (bannedList.includes(msg.user.id)) return;

        try {
            const offlineOnlyChannels = (await bot.db.channels.find({ offlineOnly: true })).map(c => c.id);
            if (offlineOnlyChannels.includes(msg.channel.id)) {
                let liveData = await got(`https://api.twitch.tv/helix/streams?user_id=${msg.channel.id}`, { headers: { Authorization: `Bearer ${config.helixToken}`, "Client-ID": config.twitchClientID } }).json();
                console.log(liveData)
                if (liveData.data[0]?.type === 'live' && msg.message.command != "offlineonly") {
                    return;
                }
            }

            const lockedChannels = (await bot.db.channels.find({ isLocked: true })).map(c => c.id);
            if (lockedChannels.includes(msg.channel.id)) {
                if (!msg.badges.hasModerator && !msg.badges.hasBroadcaster && msg.user.id != "489223884") {
                    return {};
                }
            }
        } catch (err) {
            return;
        }


        if (msg.message.parent) {
            reply = msg.message.parent
        } else {
            reply = msg.message.id
        }

        let result = await command.execute(msg);
        if (!result) return;
        console.log(result)

        bot.Logger.info(
            `${msg.user.login} executed ${command.name} in #${msg.channel.login}`
        );

        const delay = Date.now() - msg.start;

        if (!ModeratorOf.includes(msg.channel.id) && msg.user.id === '489223884' && delay < 900) { await bot.Utils.sleep(900 - delay); }

        if (bot.Regex.check(result.text, result.text.split(" "), msg.channel.id)) {
            await bot.Client.sendRaw(`@reply-parent-msg-id=${reply} PRIVMSG #${msg.channel.login} :Message contains banned phrase! elisBruh`)
            return;
        }

        if (result.reply) {
            bot.Client.sendRaw(`@reply-parent-msg-id=${reply} PRIVMSG #${msg.channel.login} :${result.text.replace(/\n|\r/g, " ")}`)
            bot.Webhook.success(`${msg.user.login} executed ${command.name} in #${msg.channel.login}`, `${msg.message.text} \n\n${result.text}`);
            return;
        }

        await bot.Client.privmsg(msg.channel.login, result.text.replace(/\n|\r/g, " "));
        bot.Webhook.success(`${msg.user.login} executed ${command.name} in #${msg.channel.login}`, `${msg.message.text} \n\n${result.text}`);
    } catch (err) {
        console.log(err);
        bot.Logger.error(
            `error during command execution: ${command.name} by ${msg.user.login} in ${msg.channel.login}`
        );
        bot.Webhook.error(`error during command execution: ${command.name} by ${msg.user.login} in ${msg.channel.login}`, `${err}`);
    }
};

// client.sendRaw(`@reply-parent-msg-id=${msg.message.id} PRIVMSG #${msg.channel.login} : TEXT`)
// result.text = `@${msg.user.name}, ${result.text}`;