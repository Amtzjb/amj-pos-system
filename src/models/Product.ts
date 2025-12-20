// src/models/Product.ts
export interface Product {
    id?: string;
    name: string;
    description: string;
    barcode: string;
    category?: 'general' | 'snacks' | 'productos' | 'herramientas' | 'otros'; // La categoría que ya usas
    isOnDemand?: boolean; // El campo de "Sobre Pedido"

    // Precios
    costPrice: number;
    marketPrice: number;
    salePrice: number;
    wholesalePrice: number;
    
    // Stock
    stock: number;
    minStock?: number; // <--- ¡AGREGA ESTO! (Es el límite para la alerta)
    
    // Fechas
    createdAt?: Date;
    updatedAt?: Date;
}