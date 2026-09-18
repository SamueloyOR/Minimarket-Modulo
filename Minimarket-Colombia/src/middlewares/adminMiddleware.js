const soloAdmin = (req, res, next) => {
    if(!req.user){
        return res.status(401).json({
            message: "Atenticacion requerida"
        })
    }

    if (req.user.rol !== "admin"){
        return res.status(403).json({
            message: "No tiene permisos de admin"
        })
    }

    next();
}

export default soloAdmin;