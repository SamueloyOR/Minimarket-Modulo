const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const auth = req.headers["autorizacion"];
    const token = auth && auth.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token inválido." });
    }
};

module.exports = verifyToken;