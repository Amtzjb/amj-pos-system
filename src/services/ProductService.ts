// src/services/ProductService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, increment } from "firebase/firestore"; 
import type { Product } from "../models/Product";

const productCollection = collection(db, "products");

export const ProductService = {
    // Crear
    addProduct: async (product: Product) => {
        await addDoc(productCollection, product);
    },

    // Leer
    getProducts: async (): Promise<Product[]> => {
        const snapshot = await getDocs(productCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    },

    // Actualizar datos generales
    updateProduct: async (id: string, updatedData: Partial<Product>) => {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, updatedData);
    },

    // --- NUEVO: RESTAR STOCK AL VENDER ---
    updateStock: async (id: string, amountSold: number) => {
        const productRef = doc(db, "products", id);
        // Usamos increment(-cantidad) para restar de forma segura
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