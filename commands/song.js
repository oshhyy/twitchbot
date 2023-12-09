const got = require("got");
const config = require("../config.json");

module.exports = {
    name: "song",
    cooldown: 3000,
    aliases: ["currentsong"],
    description: `song [lastfm-username] - shows what you are listening to on last.fm! if no username is chosen, linked username using '+link <username>' will be used!`,
    execute: async context => {
        try {
            // command code

            const lastfmName = context.message.args[0] ?? bot.db.users.lastfm
            const data = await got(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastfmName}&api_key=${config.lastfmKey}&format=json&limit=1&extended=1`).json()
            const status = data.recenttracks.track[0][`@attr`]?.nowplaying ? `yes` : `no`
            if(status == 'no'){
                return{text:`User ${lastfmName} is currently not listening to anything!`, reply:true}
            } else {
                const songName = data.recenttracks.track[0].name
                const artistName = data.recenttracks.track[0].artist.name
                return{text:`/me 🎵 ${artistName} • ${songName}`, reply:true}
            }
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};