module.exports = (username) => {
    const char = '󠀀';

    const charArray = username.split('');

    for (let i = charArray.length - 1; i >= 0; i -= 1) {
        if (i % 2 !== 0) {
            charArray.splice(i, 0, char);
        }
    }

    return charArray.join('');
}