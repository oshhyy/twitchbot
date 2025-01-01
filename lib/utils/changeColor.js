const twitchapi = require('./twitchapi.js')

let palette = [
    "#FF8F8F",
    "#FFAA8F",
    "#FFC48F",
    "#FFDE8F",
    "#FFF88F",
    "#C7FFA0",
    "#A0FFA0",
    "#80FFA0",
    "#60FFA0",
    "#40FFA0",
    "#9EE6FF",
    "#A0C1FF",
    "#A0A6FF",
    "#A085FF",
    "#A067FF",
    "#B3BFFF",
    "#C1BFFF",
    "#D0BFFF",
    "#E0BFFF",
    "#F0BFFF",
    "#D8C3FF",
    "#DAC3FF",
    "#DDC3FF",
    "#DFC3FF",
    "#E1C3FF",
    "#FFBBFF",
    "#FFBFF3",
    "#FFBFE1",
    "#FFBFDA",
    "#FFBFD2"
  ]

let cooldown = false;
// listen for your messages to trigger next color change
module.exports = async (colorRaw) => {
  if (cooldown) return;
  cooldown = true;
  const colorArray = palette
  const colorIndex = colorArray.findIndex((setColor) => setColor === colorRaw);
  const finalIndex = colorIndex !== -1 ? colorIndex : 0;
  const newColor = colorArray[(finalIndex + 1) % colorArray.length];

  try {
    let encodedColor = encodeURIComponent(newColor === null ? '#FF69B4' : newColor);
    await twitchapi.changeColor(encodedColor)
  } catch (err) {
    bot.Webhook.error(`error during colour change`, `${err}`);
  } finally {
    cooldown = false;
  }
};
