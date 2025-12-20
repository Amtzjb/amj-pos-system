// src/services/ProductService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, increment } from "firebase/firestore"; 
import type { Product } from "../models/Product";

const productCollection = collection(db, "products");

export const ProductService = {
    // Crear
    addProduct: async (product: Product) => {
        // Aseguramos que guarde la categoría, si no viene, pone 'otros'
        const productToSave = {
            ...product,
            category: product.category || 'otros'
        };
        await addDoc(productCollection, productToSave);
    },

    // Leer
    getProducts: async (): Promise<Product[]> => {
        const snapshot = await getDocs(productCollection);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                // TRUCO: Si el producto es antiguo y no tiene categoría, le asignamos 'otros' visualmente
                category: data.category || 'otros' 
            } as Product;
        });
    },

    // Actualizar datos generales
    updateProduct: async (id: string, updatedData: Partial<Product>) => {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, updatedData);
    },

    // RESTAR STOCK AL VENDER
    updateStock: async (id: string, amountSold: number) => {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, {
            stock: increment(-amountSold)
        });
    },

    // Eliminar
    deleteProduct: async (id: string) => {
        const productRef = doc(db, "products", id);
        await deleteDoc(productRef);
    }
};