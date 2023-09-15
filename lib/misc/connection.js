const config = require("../../config.json");

const { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, } = require("@kararty/dank-twitch-irc"); 
const client = new ChatClient({
    username: config.user,
    password: config.login,
    rateLimits: "verifiedBot",
    maxChannelCountPerConnection: 1,
    connectionRateLimits: {
        parallelConnections: 50,
        releaseTime: 1000,
    },
});
client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 5));

(async () => {
    const channels = (await bot.db.channels.find({ isChannel: true })).map(c => c.username);
    console.log(channels)
    client.connect();
    client.joinAll(channels);
})()

module.exports = client; 