const config = require("../../config.json");

const { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, } = require("@kararty/dank-twitch-irc");
class GayClient extends ChatClient {
    constructor(options) {
        super(options);

        this.sender = new ChatClient({
            ...options,
            username: config.user,
            password: config.login,
        });
    }

    async privmsg(...args) {
        await this.sender.privmsg(...args);
    }

    async say(channel, message) {
        await this.sender.say(channel, message);
    }

    async me(channel, message) {
        await this.sender.me(channel, message);
    }
} 

const client = new GayClient({
    username: 'justinfan12345',
    rateLimits: "verifiedBot",
    maxChannelCountPerConnection: 1,
    connectionRateLimits: {
        parallelConnections: 50,
        releaseTime: 1000,
    }
})

client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 5));

(async () => {
    const channels = (await bot.db.channels.find({ isChannel: true })).map(c => c.username);
    console.log(channels)
    client.connect();
    client.joinAll(channels);
})()

module.exports = client; 