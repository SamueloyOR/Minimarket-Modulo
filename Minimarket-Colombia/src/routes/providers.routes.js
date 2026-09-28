const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

// Obtener todos los proveedores
router.get('/', async (req, res) => {
    try {
        const providers = await Provider.find();
        res.json(providers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Registrar un nuevo proveedor
router.post('/', async (req, res) => {
    const provider = new Provider({
        name: req.body.name,
        contactName: req.body.contactName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    });

    try {
        const newProvider = await provider.save();
        res.status(201).json(newProvider);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;