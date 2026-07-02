const axios = require("axios");

async function send(url, command, enabled) {
    return axios.post(`${url}/control`, {
        command,
        enabled
    }, {
        headers: {
            authorization: `Bearer ${process.env.BOOTLOADER_KEY}`
        }
    });
}

module.exports = send;
