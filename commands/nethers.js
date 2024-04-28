const got = require("got");
module.exports = {
    name: "nethers",
    cooldown: 3000,
    aliases: ["enters", "enter", "nether"],
    description: `nethers [minecraft-username] | shows amount of nethers + average for current session`,
    execute: async context => {
        try {
            // command code
            let userData, mcUUID
            if (!context.message.args[0]) {
                userData = await bot.db.users.findOne({ id: context.user.id })
                mcUUID = userData?.mcid
                if (!mcUUID) {
                    return { text: `No MC username provided! To link your account, do '+link mc <username>'`, reply: true }
                }
            } else {
                if (context.message.args[0]?.startsWith("@")) {
                    userData = await bot.db.users.findOne({ username: context.message.args[0].replace("@", "") })
                    mcUUID = userData?.mcid
                    if (!mcUUID) {
                        return { text: `This user does not have a linked mc account!`, reply: true }
                    }

                } else {
                    let mojangData;
                    mojangData = await got(`https://api.mojang.com/users/profiles/minecraft/${context.message.args[0]}`, { throwHttpErrors: false }).json()
                    if (mojangData.errorMessage) {
                        return { text: `Mojang Error: ${mojangData.errorMessage} FallCry`, reply: true }
                    }
                    mcUUID = mojangData.id
                }
            }


            let mcNameData;
            try {
                mcNameData = await got(`https://sessionserver.mojang.com/session/minecraft/profile/${mcUUID}`).json();
            } catch (err) {
                return {
                    text: `Error getting Name data. FallCry`, reply: true
                }
            }

            let mcName = mcNameData.name;

            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getSessionNethers/?name=${mcName}&hours=16&hoursBetween=2`).json();
            } catch (err) {
                return {
                    text: `This user has no submitted runs in the last 16 hours!`, reply: true
                }
            }

            const count = netherData.count
            const average = netherData.avg
            
            return {
                text: `${bot.Utils.unping(mcNameData.name)}: ${count} Enters  (${average} avg)`,
                reply: true,
            };
        } catch (err) {
            console.log(err);
            return {
                text: `error monkaS ${err.message} `,
            };
        }
    },
};