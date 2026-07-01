require("dotenv").config();

module.exports = {
    tokens: {
        bootloader: process.env.MOBBYBOOTLOADER_TOKEN,
        mobby: process.env.MOBBY_TOKEN,
        skycord: process.env.SKYCORD_TOKEN
    },

    applicationIds: {
        bootloader: "1432780544768213152",
        mobby: "1102284140398788750",
        skycord: "1373328909642240225"
    },

    ownerId: "1101862076839886971"
};
