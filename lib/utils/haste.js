const got = require('got');
module.exports = async (data) => {
    const buh = await got.post("https://haste.osh.gay/save", { 
      body: JSON.stringify(data) 
    });

    console.log(buh.body)
    return `https://haste.osh.gay/${buh}`;
}