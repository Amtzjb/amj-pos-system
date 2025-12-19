// src/models/Product.ts
export interface Product {
    id?: string;
    name: string;
    description: string;
    barcode: string;      // Para escaner rápido
    
    // Precios
    costPrice: number;    // A cómo lo compras tú
    marketPrice: number;  // Precio "normal" en la calle (para comparar)
    salePrice: number;    // Precio al que tú lo das de contado
    wholesalePrice: number; // Precio mayoreo (arriba de 3 piezas)
    
    // Stock
    stock: number;
    
    // Fechas
    createdAt?: Date;
    updatedAt?: Date;
}