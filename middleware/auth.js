const API_KEY = process.env.API_KEY;

module.exports = (req, res, next) => {

    const auth = req.headers.authorization;

    if (!auth) {

        return res.status(401).json({
            success: false,
            error: "Missing Authorization header."
        });

    }

    const token = auth.replace("Bearer ", "");

    if (token !== API_KEY) {

        return res.status(403).json({
            success: false,
            error: "Invalid API key."
        });

    }

    next();

};
