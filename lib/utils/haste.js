const got = require('got');
async function makeRequest(j){
    let asd = await got.post("https://haste.oshgay.xyz/save", { body: JSON.stringify(j) });
    return asd
}

module.exports = (data) => {
    const buh = makeRequest(data)

    let outputURL = `https://haste.oshgay.xyz/${asd}`

    return outputURL;
}
