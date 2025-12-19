// src/services/SaleService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export interface Sale {
    id?: string;
    date: string;
    total: number;
    method: 'cash' | 'card' | 'credit' | 'payment_cash' | 'payment_card'; 
    items: {
        name: string;
        quantity: number;
        price: number;
        cost?: number;
    }[];
    customerName?: string;
    sellerName?: string;
    
    // Campos de Ticket de Venta (Crédito)
    receivedAmount?: number;
    change?: number;
    installmentCount?: number;
    installmentAmount?: number;

    // --- NUEVOS CAMPOS PARA TICKET DE ABONO ---
    debtPrevious?: number; // Cuánto debía antes de pagar
    debtRemaining?: number; // Cuánto quedó debiendo
}

const salesCollection = collection(db, "sales");

export const SaleService = {
    createSale: async (sale: Sale) => {
        await addDoc(salesCollection, sale);
    },

    getSales: async (): Promise<Sale[]> => {
        const q = query(salesCollection, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
    }
};