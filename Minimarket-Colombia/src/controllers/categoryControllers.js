export const category = require('../models/category.js');

export const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await category.find();
        res.status(200).json(categorias);
    } catch (error){
        res.status(500).json({message: "Error al obtener las categorías", error: error.message});
    }
}

//crear categoria preferiblemente utilizar admin

export const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const nuevaCategoria = new category({ nombre, descripcion, slug });
        await nuevaCategoria.save();

        res.status(201).json({ message: "Categoría creada con éxito", categoria: nuevaCategoria });
    } catch (error) {
        res.status(500).json({ message: "Error al crear la categoría", error: error.message });
    }
};

//actualizar categoria uso del admin
export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        
        const categoriaExistente = await category.findById(id);
        if (!categoriaExistente) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        const slug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        categoriaExistente.nombre = nombre;
        categoriaExistente.descripcion = descripcion;
        categoriaExistente.slug = slug;
        
        await categoriaExistente.save();
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la categoría", error: error.message });
    }
}

//eliminar categoria uso del admin
export const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoriaExistente = await category.findById(id);
        if (!categoriaExistente) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }
        
        await category.findByIdAndDelete(id);
        res.status(200).json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la categoría", error: error.message });
    }
};
