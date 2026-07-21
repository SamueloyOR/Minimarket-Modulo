const pool = require('../models/connection');

// 1. OBTENER / LISTAR CLIENTES (Read)
const obtenerClientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. CREAR CLIENTE (Create)
const crearCliente = async (req, res) => {
    try {
        const { documento, nombres, apellidos, correo, telefono } = req.body;
        const query = 'INSERT INTO clientes (documento, nombres, apellidos, correo, telefono) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [documento, nombres, apellidos, correo, telefono]);
        
        res.status(201).json({ mensaje: 'Cliente creado con éxito', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. ACTUALIZAR CLIENTE (Update)
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { documento, nombres, apellidos, correo, telefono } = req.body;
        const query = 'UPDATE clientes SET documento = ?, nombres = ?, apellidos = ?, correo = ?, telefono = ? WHERE id = ?';
        
        await pool.query(query, [documento, nombres, apellidos, correo, telefono, id]);
        res.json({ mensaje: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR CLIENTE (Delete)
const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};