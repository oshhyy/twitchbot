const got = require('got');
const config = require("../../config.json");
const helix = got.extend({
    prefixUrl: 'https://api.twitch.tv/helix',
    responseType: 'json',
    throwHttpErrors: false,
    headers: {
        'Authorization': config.twitchAuth,
        'Client-Id': config.twitchClientID
    }
})

const supibot = got.extend({
    prefixUrl: 'https://supinic.com/api/',
    responseType: 'json',
    throwHttpErrors: false,
    headers: {
        'Authorization': config.supiAuth,
    }
})

module.exports = {
    clearChat: function (channelId) {
        return helix.delete(`moderation/chat?broadcaster_id=${channelId}&moderator_id=489223884`)
    },

    announceMessage: function (channelId, message, color) {
        return helix.post(`chat/announcements?broadcaster_id=${channelId}&moderator_id=489223884`, {
            json: {
                message: message,
                color: color
            }
        })
    },

    sendMessage: function (channelId, message) {
        return helix.post(`chat/messages?broadcaster_id=${channelId}&sender_id=489223884`, {
            json: {
                message: message
            }
        })
    },

    changeColor: function (encodedColor) {
        return helix.put(`chat/color?user_id=489223884&color=${encodedColor}`)
    },

    whisper: function (userId, message) {
        return helix.post(`whispers?from_user_id=489223884&to_user_id=${userId}`, {
            throwHttpErrors: true,
            json: { message }
        })
    },

    checkAfk: function (username) {
        return supibot.get(`bot/afk/check?username=${username}`), {
        }
    },

    moderators: function ({ channelID = '489223884', cursor = null }) {
        const params = { 
            broadcaster_id: channelID, 
            after: cursor,
            first: 100
        };

        if (!cursor) delete params.after;
        return helix.get(`moderation/moderators?${new URLSearchParams(params)}`)
    },

    botModerators: function ({ channelID = '489223884', cursor = null }) {
        const params = { 
            user_id: channelID, 
            after: cursor,
            first: 100
        };

        if (!cursor) delete params.after;
        return helix.get(`moderation/channels?${new URLSearchParams(params)}`)
    },

    getMods: async function (channelID) {
        const modList = [];

        async function paginate(cursor = null) {
          await this.botModerators({ channelID, cursor }).then(async (res) => {
            console.log(res.body)
            modList.push(...res.body.data);
            if (res.body.pagination?.cursor) {
              return paginate.call(this, res.body.pagination.cursor);
            }
          });
        }
    
        await paginate.call(this);
    
        global.ModeratorOf = modList.map(m => m.broadcaster_id);
    },

    loopMods: async function () {
        this.getMods()
        return setInterval(this.getMods, 1000 * 60 * 10)
    }
}