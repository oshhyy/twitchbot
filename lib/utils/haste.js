const got = require('got');
module.exports = async (data) => {
    const buh = await got.post("https://haste.oshgay.xyz/save", { 
      body: JSON.stringify(data) 
    });

    console.log(buh.body)
    return `https://haste.oshgay.xyz/${buh}`;
}