const config = require("../../config.json");

class GayClient extends ChatClient {
    constructor(options) {
        super(options);

        this.sender = new ChatClient({
            ...options,
            username: config.user,
            password: config.login,
        });

        this.sender.connect();
    }

    async privmsg(...args) {
        return this.sender.privmsg(...args);
    }

    async say(channel, message) {
        return this.sender.say(channel, message);
    }

    async me(channel, message) {
        return this.sender.me(channel, message);
    }

    async sendRaw(...args) {
        return this.sender.sendRaw(...args);
    }

    async send(channelName, message) {
        const command = `PRIVMSG #${channelName} :${message}`;
        this.requireConnection().transport.stream.write(command + '\r\n');
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