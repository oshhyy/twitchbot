module.exports = {
    name: "CHANGE THIS TO NAME OF COMMAND",
    cooldown: 3000,
    aliases: [],
    description: `- `,
    execute: async context => {
        try {
            // command code
            



            return {
                text: ``,
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