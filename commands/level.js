function levelRoles(num) {
    if (num == 0) return "Blacklisted"
    if (num == 1) return "User"
    if (num == 2) return "Moderator"
    if (num == 3) return "Dev"
    if (num == 4) return "Admin"
    return "N/A"
}
module.exports = {
    name: "level",
    cooldown: 3000,
    aliases: ["lvl", "userlevel"],
    description: `level [user] - checks a user's level forsenLevel`,
    execute: async context => {
        try {
            // command code
            let user = context.message.args[0] ?? context.user.login
            
            const userInfo = await bot.db.users.findOne({username: user})

            if(!userInfo){
                return {
                    text: `level for ${user}: 1 (User)`,
                    reply: true,
                };
            } else {
                return {
                    text: `level for ${user}: ${userInfo.level} (${levelRoles(userInfo.level)})`,
                    reply: true,
                };
            }
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};