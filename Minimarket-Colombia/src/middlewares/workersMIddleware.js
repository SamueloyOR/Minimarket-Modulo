const puedeGestionarCLientes = (req, res, next) => {
    const rolesPermitidos = ["admin", "trabajador"]

    if (!rolesPermitidos.includes(req.user.rol)){
        return res.status(403).json({
            message: "No tienes permisos suficientes"
        });
    }

    next();
}

export default puedeGestionarCLientes;