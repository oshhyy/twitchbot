const got = require("got");
module.exports = {
    name: "groupenters",
    cooldown: 3000,
    aliases: ["groupnethers"],
    description: `groupenters | temp cmd for 1000 nethers`,
    execute: async context => {
        try {
            // command code
            let netherData;
            try {
                netherData = await got(`https://paceman.gg/stats/api/getCombinedNethers/?names=oshgay,ContraVz,pulsar32,Voxio,Dfanm,isqqcle,Anjouu,biiased,Ranik_,paplerr,Mar1n,aadrn,kruin7,ekuboh,NoFearr1337,marimari_en,kohout135,newfroggy,zaintew,Marimarilove,feinGG,meebie,aleen,priffin,erikfzf,hdmicables,emia,Greetings_1&hours=999999&hoursBetween=999999&start=1716030000`).json();
            } catch (err) {
                return {
                    text: `there was a freaking error bwo`, reply: true
                }
            }

            const count = netherData.count
            const average = netherData.avg
            
            return {
                text: `Group Nethers: ${count} Enters (${average} avg)`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} iqvekSaj`)
        }
    },
};