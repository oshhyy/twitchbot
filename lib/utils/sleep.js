module.exports = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}