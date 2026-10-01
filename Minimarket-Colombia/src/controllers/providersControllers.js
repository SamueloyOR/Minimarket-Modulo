import Provider from '../models/provider.js';
import Product from '../models/products.js';
import InventoryMovement from '../models/inventoryMovement.js';

const camposProveedor = ['name', 'contactName', 'email', 'phone', 'address'];

const sanitizeProviderData = (body = {}) => Object.fromEntries(
    Object.entries(body).filter(([campo]) => camposProveedor.includes(campo))
);

const normalizar = (data) => ({
    ...data,
    name: typeof data.name === 'string' ? data.name.trim() : data.name,
    contactName: typeof data.contactName === 'string' ? data.contactName.trim() : data.contactName,
    email: typeof data.email === 'string' && data.email.trim() ? data.email.trim().toLowerCase() : undefined,
    phone: typeof data.phone === 'string' ? data.phone.trim() : data.phone,
    address: typeof data.address === 'string' ? data.address.trim() : ''
});

export const getProviders = async (_req, res) => {
    try {
        const providers = await Provider.find({})
            .populate('productos', 'nombre precio stock categoria')
            .sort({ name: 1 });
        return res.json(providers);
    } catch (error) {
        console.error('Error al listar proveedores:', error);
        return res.status(500).json({ message: 'Error al listar proveedores' });
    }
};

export const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id)
            .populate('productos', 'nombre precio stock categoria');
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });
        return res.json(provider);
    } catch {
        return res.status(400).json({ message: 'Id de proveedor inválido' });
    }
};

export const createProvider = async (req, res) => {
    try {
        const data = normalizar(sanitizeProviderData(req.body));
        if (!data.name || !data.contactName || !data.phone) {
            return res.status(400).json({ message: 'Nombre de empresa, contacto y teléfono son obligatorios' });
        }

        const provider = await Provider.create(data);
        return res.status(201).json({ message: 'Proveedor registrado correctamente', proveedor: provider });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ message: 'El correo del proveedor ya está registrado' });
        }
        return res.status(400).json({ message: error.message || 'No se pudo registrar el proveedor' });
    }
};

export const updateProvider = async (req, res) => {
    try {
        const data = normalizar(sanitizeProviderData(req.body));
        const provider = await Provider.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });
        return res.json({ message: 'Proveedor actualizado correctamente', proveedor: provider });
    } catch (error) {
        if (error?.code === 11000) return res.status(400).json({ message: 'El correo del proveedor ya está registrado' });
        return res.status(400).json({ message: error.message || 'No se pudo actualizar el proveedor' });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        const provider = await Provider.findByIdAndDelete(req.params.id);
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

        await Product.updateMany(
            { proveedores: provider._id },
            { $pull: { proveedores: provider._id } }
        );

        await InventoryMovement.updateMany(
            { proveedor: provider._id },
            { $set: { proveedor: null } }
        );

        return res.json({ message: 'Proveedor eliminado correctamente' });
    } catch {
        return res.status(400).json({ message: 'Id de proveedor inválido' });
    }
};

export const getProviderPurchaseHistory = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id).select('_id name');
        if (!provider) return res.status(404).json({ message: 'Proveedor no encontrado' });

        const history = await InventoryMovement.find({ proveedor: provider._id, tipo: 'entrada' })
            .populate('producto', 'nombre categoria')
            .populate('usuario', 'nombre correo')
            .sort({ createdAt: -1 });

        return res.json({ proveedor, historial: history });
    } catch {
        return res.status(400).json({ message: 'Id de proveedor inválido' });
    }
};
