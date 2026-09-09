import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "minimarket-secret-2026";

const verifyToken = (req, res, next) => {
    const auth = req.headers["authorization"] || req.headers["autorizacion"];
    const token = auth && auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token inválido." });
    }
};

export default verifyToken;