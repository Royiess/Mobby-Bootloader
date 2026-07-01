function log(message, type = "info") {
    const time = new Date().toISOString();

    console.log(`[${time}] [${type.toUpperCase()}] ${message}`);
}

module.exports = { log };
