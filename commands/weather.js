const got = require("got");
const config = require("../config.json");
module.exports = {
    name: "weather",
    cooldown: 3000,
    aliases: ['w'],
    description: `weather <city|town> - shows the weather 4Head`,
    execute: async context => {
        try {
            // command code
            function weatherEmoji(code, condition) {
                let res = ''
                if (code == 1000) {
                    if(condition == "Sunny") {
                        res = '☀'
                    }
                    if(condition == "Clear") {
                        res = '🌙'
                    }
                }
                if (code == 1003) { res = '🌤'}
                if (code == 1006 || code == 1009 || code == 1030) { res = '☁'}
                if (code == 1066 || code == 1255 || code == 1258) { res = '🌤 SoSnowy'}
                if (code == 1069) { res = '🌦 SoSnowy'}
                if (code == 1072) { res = '☁ SoSnowy'}
                if (code == 1087) { res = '☀🌩'}
                if (code == 1114 || code == 1117) { res = '🌨💨'}
                if (code == 1135) { res = '🌫'}
                if (code == 1147) { res = '❄🌫'}
                if (code == 1150 || code == 1153 || code == 1183 || code == 1189 || code == 1195) { res = '🌧'}
                if (code == 1168 || code == 1171 || code == 1198 || code == 1201) { res = '🌨'}
                if (code == 1063 || code == 1180 || code == 1186 || code == 1192 || code == 1240 || code == 1243 || code == 1246) { res = '🌦'}
                if (code == 1204 || code == 1207) { res = '🌧 SoSnowy'}
                if (code == 1210 || code == 1216 || code == 1222) {res = '☀🌨'}
                if (code == 1213 || code == 1219 || code == 1225) {res = '🌨'}
                if (code == 1237) {res = '⚪'}
                if (code == 1249 || code == 1252) { res = '🌦 SoSnowy'}
                if (code == 1261 || code == 1264) { res = '🌤⚪'}
                if (code == 1273 || code == 1276) { res = '⛈'}
                if (code == 1279 || code == 1282) { res = '⛈ SoSnowy'}

                return res;
            }


            let city = context.message.args.slice(0).join(" ")
            if(!city) {
                return{text: `Please provide a city name! oshDank`, reply:true}
            }
            let key = config.weatherKey;
            let data
            try {
                data = await got(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${city}&aqi=no`).json()
            } catch(err) {
                return{text: `No Matching Location Found.`, reply:true}
            }

            const emoji = weatherEmoji(data.current.condition.code, data.current.condition.text)

            console.log(data)

            let rainText = ''
            if(data.current.precip_in != 0.0) {
                rainText = `• It is currently raining ${data.current.precip_mm}mm/h (${data.current.precip_in}in/h)`
            }

            return {
                text: `Current weather in ${data.location.name}, ${data.location.region} (${data.location.country}): ${emoji} (${data.current.condition.text}) ${data.current.temp_c}°C (${data.current.temp_f}°F), Feels like ${data.current.feelslike_c}°C (${data.current.temp_f}°F) • Wind Speed: ${data.current.wind_kph}km/h (${data.current.wind_mph}m/h) ${data.current.wind_dir}, with gusts up to ${data.current.gust_kph}km/h (${data.current.gust_mph}m/h) • Humidity: ${data.current.humidity}% ${rainText}`,
                reply: true,
            };
        } catch (err) {
            bot.Webhook.error(`${err.constructor.name} executing ${context.message.command} by ${context.user.login} in #${context.channel.login}`, `${context.message.text}\n\n${err}`)
            console.log(err);
            bot.Client.privmsg(context.channel.login, `${err.constructor.name} monkaS ${err.message}`)
        }
    },
};