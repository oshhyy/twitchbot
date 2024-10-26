// const got = require("got");
// module.exports = {
//     name: "botsubs",
//     cooldown: 15000,
//     aliases: ['bs', 'subs'],
//     description: `botsubs`,
//     execute: async context => {
//         try {
//             // command code
//             const ignoredSets = ['0', '42', '19194', '300374282']
            
//             const emoteSets = bot.Client.userStateTracker.channelStates[context.channel.login].emoteSets.filter(e => !ignoredSets.includes(e))
//             if (!emoteSets.length) return { text: 'I am not subscribed to any channels FeelsBadMan', reply: true }

//             console.log(emoteSets.join(','))

//             const data = await got(`https://api.ivr.fi/v2/twitch/emotes/sets?set_id=${emoteSets.join(',')}`).json(); 
//             const subEmoteSets = data.map(set => ({
//                 ID: set.setID,
//                 channel: {
//                     name: set.channelName,
//                     login: set.channelLogin,
//                     ID: set.channelID,
//                 },
//                 tier: set.tier,
//                 emotes: (set.emoteList ?? []).map(i => ({
//                     ID: i.id,
//                     token: i.code,
//                     animated: i.assetType === "ANIMATED",
//                 })),
//             }));

//             const encountered = new Set();
//             const result = [];
//             let listOfEmotes = [];
//             let phrase = ''


//             if(context.message.params.all) {
//                 if (!context.badges.hasModerator && !context.badges.hasBroadcaster && !context.badges.hasVIP) {
//                     return {};
//                 }
//                 if(!context.botBadges.badges.hasModerator && !context.botBadges.badges.hasVIP && !context.botBadges.badges.hasBroadcaster) {
//                     return {
//                         text: `I can't perform this command because I am not moderator or vip! NOIDONTTHINKSO`, reply: true
//                     };
//                 }

//                 for (const setData of subEmoteSets) {
//                     const emotes = []; for (const emote of setData.emotes) { emotes.push(emote.token); } 
//                     result.push(...emotes); 
//                 }

//                 phrase = result.join(' ')

//                 const len = 475
//                 let curr = len;
//                 let prev = 0;
//                 let emoteList = [];
//                 while (phrase[curr]) {
//                     if (phrase[curr++] === ' ') {
//                         emoteList.push(phrase.substring(prev, curr));
//                         prev = curr;
//                         curr += len;
//                     }
//                 }
//                 emoteList.push(phrase.substr(prev));
//                 console.log(emoteList)

//                 for(const element of emoteList) {
//                     bot.Client.privmsg(context.channel.login, element)
//                 }
//                 await bot.Utils.sleep(1000)
//                 return{
//                     text:`I currently have access to ${result.length} emotes.`
//                 }
//             }

//             for (const setData of subEmoteSets) {
//                 const channel = setData.channel.login;
//                 if (encountered.has(channel)) {
//                     continue;
//                 }

//                 const tierString =
//                     setData.tier !== "1" ? ` (T${setData.tier})` : "";
//                 result.push({
//                     channel: `${channel}${tierString}`,
//                     emote: setData.emotes[
//                         Math.floor(Math.random() * setData.emotes.length)
//                     ].token, // random emote
//                 });

//                 encountered.add(channel);
//             }

//             result.sort((a, b) => a.channel.localeCompare(b.channel));
//             const emotes = result.map(i => i.emote).join(" ");

//             const message = `${result.length} channels: ${emotes}`;

//             return {
//                 text: message, reply:true
//             };

//         } catch (err) {
//             bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
//             console.log(err);
//             bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
//         }
//     },
// };