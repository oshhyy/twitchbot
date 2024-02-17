const got = require("got");
const twitchapi = require('./lib/utils/twitchapi.js')
const { handle } = require("./lib/misc/handle");
const gql = require("./lib/utils/gql");
global.bot = {};
bot.db = require("./lib/db/connection.js");
bot.Client = require("./lib/misc/connection");
bot.Command = require("./lib/misc/commands");
bot.Utils = require("./lib/utils");
bot.Logger = require("./lib/misc/logger");
bot.Webhook = require("./lib/utils/webhook");

const { on } = require("events");
const dayjs = require('dayjs')
dayjs().format()
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

bot.Client.on("ready", () => console.log("Successfully connected to chat"));
bot.Client.on("close", (error) => {
    if (error != null) {
        console.error("Client closed due to error", error);
    }
});

bot.Client.on("PRIVMSG", async (msg) => {
    // if (msg.senderUserID === '489223884') {
    //     gql.badgeCycler(msg.channelName)
    // }

    const start = Date.now();
    let message

    if (msg.replyParentMessageID) {
        message = msg.messageText.replace(/^@[^\s]+\s+/, "").replace(bot.Utils.regex.invisChar, "").trimEnd();
    } else {
        message = msg.messageText.replace(bot.Utils.regex.invisChar, "").trimEnd();
    }

    let userData
    let mcUUID
    // !elo command that auto gets the broadcaster elo
    // this method is dogshit and can be absolutely improved but idk a way
    if (message.startsWith("!elo")) {
        let asd = message.slice(1).trim().split(/\s+/g) ?? null
        console.log(asd)
        if(asd[1]) {
            message = `+elo ${asd[1]}`
        } else {
            userData = await bot.db.users.findOne({ id: msg.channelID })
            mcUUID = userData?.mcid
            if(mcUUID) {
                message = `+broadcasterelo ${mcUUID}`
                console.log(mcUUID)
            }
        }        
    }

    const content = message;
    const channelData = await bot.db.channels.findOne({ id: msg.channelID }); //this way you have the full channelData object, not just prefix
    const prefix = channelData?.prefix ?? '+'; //defaults to + if undefined
    const args = content.slice(prefix.length).trim().split(/\s+/g) ?? null; //this cuts off prefix, makes array
    const commandName = args.length > 0 ? args.shift().toLowerCase() : ''; //this will pull the command out of array

    const botBadges = bot.Client.userStateTracker.channelStates[msg.channelName];

    const params = {};
    args
        .filter(word => word.includes(":"))
        .forEach(param => {
            const key = param.split(":")[0];
            const value = param.split(":")[1];
            params[key] =
                value === "true" || value === "false"
                    ? value === "true"
                    : value;
        });

    let msgData = {
        user: {
            id: msg.senderUserID,
            name: msg.displayName,
            login: msg.senderUsername,
            colorRaw: msg.colorRaw,
            badgesRaw: msg.badgesRaw,
            color: msg.color,
        },
        channel: {
            id: msg.channelID,
            login: msg.channelName,
            prefix, // assigns the prefix to object so you can use in handler/commands
            data: channelData // assigns the channel to object so you can use it in the handler
        },
        message: {
            id: msg.messageID,
            raw: msg.rawSource,
            content,
            command: commandName,
            text: message.replace(/^@[^\s]+\s+/, ""),
            time: Date.parse(msg.serverTimestamp),
            parent: msg.replyParentMessageID,
            args,
            params,
        },
        isAction: msg.isAction,
        timestamp: msg.serverTimestampRaw,
        emotes: msg.emotes,
        tags: msg.ircTags,
        badges: msg.badges,
        start,
        botBadges,
    };

    handle(msgData);

    if (msg.senderUserID === '71092938') {
        let personColor = msg.colorRaw.replace('#', "")
        const encodedUser = encodeURIComponent(`#${personColor}`)
        await twitchapi.changeColor(encodedUser)
        bot.Client.privmsg(`iqvek`, `/me • message by ${msg.senderUsername} in #${msg.channelName}: ${msg.messageText}`)
        return;
    }

    if (msg.senderUserID == '68136884' && msg.messageText.startsWith("@oshgay, reminder from yourself") && args[args.length - 1] == "$fish") {
        await bot.Utils.sleep(2500);


        bot.Client.privmsg(msg.channelName, `$$fish`);
    }
    if (msg.senderUserID == '68136884' && msg.messageText.startsWith("@oshgay, reminder from yourself") && args[args.length - 1] == "🪤") {
        await bot.Utils.sleep(2500);

        bot.Client.privmsg("markzynk", `$$trap`);
    }

    if (msg.senderUserID == '757096536' && msg.messageText == "ppBounce" && msg.channelID == "88492428") {

        bot.Client.privmsg(msg.channelName, `ppBounce`);
    }

    let toList = ['markzynk', 'zomballr', 'flan__________', 'mrcosgallo', 'ryanpotat', 'ryanl_12', 'kattah']

    if ((msg.messageText == 'to' || msg.messageText == 'TO' || msg.messageText == 'two' || msg.messageText == 'too' || msg.messageText == 'OT' || msg.messageText == 'ot' || msg.messageText == 'oT' || msg.messageText == 'Ot' || msg.messageText == 'To' || msg.messageText == 'tO') && toList.includes(msg.channelName)) {
        if (msg.senderUserID == "489223884" || msg.senderUserID == '757096536') return;
        else bot.Client.privmsg(msg.channelName, msg.messageText);
    }

    if ((msg.messageText == 'oh' || msg.messageText == 'wait' || msg.messageText == 'POGGERS' || msg.messageText == 'alright') && msg.channelName == "markzynk") {
        if (msg.senderUserID == "489223884" || msg.senderUserID == '757096536') return;
        else bot.Client.privmsg(msg.channelName, msg.messageText);
    }

    if (msg.senderUserID == '489223884' && msg.channelName == 'alaskanpotat' && msg.messageText == 'elisElis') {
        let cookieData = await got(`https://api.roaringiron.com/cooldown/oshgay`).json()
        if (cookieData.can_claim && !cookieData.cdr_available) {
            bot.Client.privmsg('markzynk', `!cookie`);
        } else if (!cookieData.can_claim && cookieData.cdr_available) {
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('markzynk', `!cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('markzynk', `!cookie`);
        } else if (cookieData.can_claim && cookieData.cdr_available) {
            bot.Client.privmsg('markzynk', `!cookie`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('markzynk', `!cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('markzynk', `!cookie`);
        }
        let potatoData = await got(`https://api.potat.app/users/oshgay`).json()
        if (potatoData[0].potatoes.potato.ready && !potatoData[0].potatoes.cdr.ready) {
            bot.Client.privmsg('alaskanpotat', `#potato`);
        } else if (!potatoData[0].potatoes.potato.ready && potatoData[0].potatoes.cdr.ready) {
            bot.Client.privmsg('alaskanpotat', `#cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('alaskanpotat', `#potato`);
        } else if (potatoData[0].potatoes.potato.ready && potatoData[0].potatoes.cdr.ready) {
            bot.Client.privmsg('alaskanpotat', `#potato`);
            await bot.Utils.sleep(3500)
            bot.Client.privmsg('alaskanpotat', `#cdr`);
            await bot.Utils.sleep(3500)
            bot.Client.privmsg('alaskanpotat', `#potato`);
        }
        if (potatoData[0].potatoes.steal.ready) {
            await bot.Utils.sleep(3500)
            bot.Client.privmsg('alaskanpotat', `#steal`);
        }
    }
});

setInterval(() => {
    bot.Client.privmsg("alaskanpotat", "elisElis")
}, 3601000);

bot.Client.on("NOTICE", async (notice) => {
    console.log(notice)
    if (notice.messageID == "msg_rejected_mandatory") {
        bot.Client.privmsg(notice.channelName, `A message that was about to be sent wasn't posted due to conflicts with the channel's moderation settings. elisBruh`)
    }
})