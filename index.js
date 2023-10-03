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

    if (msg.senderUserID === '489223884') {
        gql.badgeCycler(msg.channelName)
    }

    const start = Date.now();
    let message

    if (msg.replyParentMessageID) {
        message = msg.messageText.replace(/^@[^\s]+\s+/, "").replace(bot.Utils.regex.invisChar, "").trimEnd();
    } else {
        message = msg.messageText.replace(bot.Utils.regex.invisChar, "").trimEnd();
    }
    const content = message;
    const channelData = await bot.db.channels.findOne({id: msg.channelID}); //this way you have the full channelData object, not just prefix
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
        let personColor = msg.colorRaw.replace('#',"")
        const encodedUser = encodeURIComponent(`#${personColor}`)
        await twitchapi.changeColor(encodedUser)
        bot.Client.privmsg(`iqvek`, `/me • message by ${msg.senderUsername} in #${msg.channelName}: ${msg.messageText}`)
        return;
    }

    if (msg.senderUserID == '68136884' && msg.messageText.startsWith("@oshhyy, reminder from yourself") && args[args.length - 1] == "$fish") {
        await bot.Utils.sleep(2500);


        bot.Client.privmsg(msg.channelName, `$$fish`);
    }
    if (msg.senderUserID == '68136884' && msg.messageText.startsWith("@oshhyy, reminder from yourself") && args[args.length - 1] == "🪤") {
        await bot.Utils.sleep(2500);

        bot.Client.privmsg(msg.channelName, `$$trap`);
    }

    if (msg.senderUserID == '757096536' && msg.messageText == "ppBounce" && msg.channelID == "88492428") {
        
        bot.Client.privmsg(msg.channelName, `ppBounce`);
    }
    
    let toList = ['markzynk', 'zomballr', 'francorz_', 'mrcosgallo', 'ryanpotat', 'ryanl_12', 'kattah']

    if ((msg.messageText == 'to' || msg.messageText == 'TO' || msg.messageText == 'two' || msg.messageText == 'too' || msg.messageText == 'OT' || msg.messageText == 'ot' || msg.messageText == 'oT' || msg.messageText == 'Ot' || msg.messageText == 'To' || msg.messageText == 'tO') && toList.includes(msg.channelName)) {
        if (msg.senderUserID == "489223884" || msg.senderUserID == '757096536') return;
        else bot.Client.privmsg(msg.channelName, msg.messageText);
    }

    if ((msg.messageText == 'oh' || msg.messageText == 'wait' || msg.messageText == 'POGGERS') && msg.channelName == "markzynk") {
        if (msg.senderUserID == "489223884" || msg.senderUserID == '757096536') return;
        else bot.Client.privmsg(msg.channelName, msg.messageText);
    }

    if (msg.senderUserID == '489223884' && msg.channelName == 'alaskanpotat' && msg.messageText == 'elisElis') {
        let cookieData = await got(`https://api.roaringiron.com/cooldown/oshhyy`).json()
        if (cookieData.can_claim && !cookieData.cdr_available) {
            bot.Client.privmsg('azzzv', `!cookie`);
        } else if (!cookieData.can_claim && cookieData.cdr_available) {
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('azzzv', `!cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('azzzv', `!cookie`);
        } else if (cookieData.can_claim && cookieData.cdr_available) {
            bot.Client.privmsg('azzzv', `!cookie`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('azzzv', `!cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('azzzv', `!cookie`);
        }
        let poroData = await got(`https://api.poros.lol/api/bot/porocount/oshhyy`).json()
        if (poroData.cooldowns.poro.isAvailable && !poroData.cooldowns.poroCdr.isAvailable) {
            bot.Client.privmsg('alaskanpotat', `|poro`);
        } else if (!poroData.cooldowns.poro.isAvailable && poroData.cooldowns.poroCdr.isAvailable) {
            bot.Client.privmsg('alaskanpotat', `|cdr`);
            await bot.Utils.sleep(2500)
            bot.Client.privmsg('alaskanpotat', `|poro`);
        } else if (poroData.cooldowns.poro.isAvailable && poroData.cooldowns.poroCdr.isAvailable) {
            bot.Client.privmsg('alaskanpotat', `|poro`);
            await bot.Utils.sleep(3500)
            bot.Client.privmsg('alaskanpotat', `|cdr`);
            await bot.Utils.sleep(3500)
            bot.Client.privmsg('alaskanpotat', `|poro`);
        }
        let potatoData = await got(`https://api.potat.app/users/oshhyy`).json()
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

const xd = ["ryanpotate", "ryanpotatu", "l3ulit", "potatryan", "ryanbotat", "joepotat", "joebotat", "oshoshoshoshoshoshoshosh", "obviouslyosh", "joetomat", "mynameisntpotato", "widepeepoosh", "mynameisntosh", "poroissad", "poroisntsad", "osh______________________", "i3ulit", "widepeepopotato", "potat____", "supipotat", "ryanl_13", "p0tb", "pot1i", "9rya", "ryanfrenchfry", "ryanbutttat", "potatbuttat", "botatbutttat", "13742289_orthogonal", "circular_trapezoid", "potatinsanity", "carrots_and_soup", "just_a_cute_cat", "potat_exp", "thursdayasparagus"]

setInterval(() => {
    for(element of xd) {
        bot.Client.privmsg(element, 'TriHard')
        bot.Utils.sleep(1000)
    }
}, 30000);

setInterval(() => {
    bot.Client.privmsg("alaskanpotat", "elisElis")
}, 3601000);
