const cooldown = new Set();

exports.set = (id, time) => {
    cooldown.add(id);
    setTimeout(() => {
        this.delete(id);
    }, time);
}

exports.delete = (id) => {
    cooldown.delete(id);
}

exports.has = (id) => {
    return cooldown.has(id);
}