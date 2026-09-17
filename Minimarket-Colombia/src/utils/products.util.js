import Product from "../models/products.js";

export const PRODUCTOS = [
    { nombre: "Frutas mixtas x kg", descripcion: "Canasta de temporada.", precio: 12000, stock: 40, categoria: "Frutas y verduras", enOferta: true, precioOferta: 9500 },
    { nombre: "Tomate x libra", descripcion: "Tomate chonto fresco.", precio: 3000, stock: 60, categoria: "Frutas y verduras" },
    { nombre: "Leche entera x 1L", descripcion: "Marca líder, litro completo.", precio: 4500, stock: 80, categoria: "Lácteos", enOferta: true, precioOferta: 3600 },
    { nombre: "Queso campesino x 250g", descripcion: "Queso fresco artesanal.", precio: 8500, stock: 25, categoria: "Lácteos" },
    { nombre: "Jabón de ropa x 1kg", descripcion: "Para limpieza del hogar.", precio: 7200, stock: 35, categoria: "Aseo y hogar", enOferta: true, precioOferta: 5900 },
    { nombre: "Detergente líquido x 1L", descripcion: "Concentrado, rinde más.", precio: 9800, stock: 20, categoria: "Aseo y hogar" },
    { nombre: "Papas fritas x 150g", descripcion: "Crocantes y saladas.", precio: 4200, stock: 50, categoria: "Snacks" },
    { nombre: "Combo familiar de snacks", descripcion: "Paquete con descuento especial.", precio: 15000, stock: 15, categoria: "Snacks", enOferta: true, precioOferta: 12000 },
];


export async function seedProducts() {
    const resultados = [];

    for (const prod of PRODUCTOS) {
        const doc = await Product.findOneAndUpdate(
            { nombre: prod.nombre, categoria: prod.categoria },
            prod,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        resultados.push(doc.nombre);
    }

    return resultados;
}
