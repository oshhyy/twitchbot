
module.exports = {
    name: "link",
    cooldown: 3000,
    aliases: ["linkfm", "linklastfm"],
    description: `link <lastfm-username> - links your account to last fm`,
    execute: async context => {
        try {
            // command code

            let lastfmName = context.message.args[0]

            await bot.db.users.updateOne( { id: context.user.id }, { $set: { lastfm: lastfmName } })

            return{text:`Your last fm account has successfully linked to "${lastfmName}"!`, reply:true}
            
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};