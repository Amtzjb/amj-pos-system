// src/services/CashCutService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export interface CashCut {
    id?: string;
    date: string;
    initialAmount: number;
    totalSalesCash: number;
    totalSalesCard: number;
    totalWithdrawals: number;
    expectedAmount: number;
    realAmount: number;
    difference: number;
    notes: string;
    userName?: string; // <--- NUEVO CAMPO: Nombre del cajero
}

const cutsCollection = collection(db, "cash_cuts");

export const CashCutService = {
    // Guardar el corte
    createCut: async (cut: CashCut) => {
        await addDoc(cutsCollection, cut);
    },

    // Obtener historial
    getCuts: async (): Promise<CashCut[]> => {
        const q = query(cutsCollection, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CashCut));
    }
};