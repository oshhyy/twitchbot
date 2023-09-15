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
    }
}