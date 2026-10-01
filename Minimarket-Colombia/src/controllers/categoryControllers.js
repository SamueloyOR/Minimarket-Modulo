import Category from '../models/category.js';

export const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Category.find();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las categorías', error: error.message });
    }
};

export const crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
        }

        const slug = nombre.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const nuevaCategoria = new Category({ nombre: nombre.trim(), descripcion: descripcion || '', slug });
        await nuevaCategoria.save();

        res.status(201).json({ message: 'Categoría creada con éxito', categoria: nuevaCategoria });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
    }
};

export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        const categoriaExistente = await Category.findById(id);
        if (!categoriaExistente) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        if (nombre) {
            categoriaExistente.nombre = nombre.trim();
            categoriaExistente.slug = nombre.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        }

        if (descripcion !== undefined) {
            categoriaExistente.descripcion = descripcion;
        }

        await categoriaExistente.save();
        res.status(200).json({ message: 'Categoría actualizada con éxito', categoria: categoriaExistente });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la categoría', error: error.message });
    }
};

export const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const categoriaExistente = await Category.findById(id);
        if (!categoriaExistente) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: 'Categoría eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoría', error: error.message });
    }
};
