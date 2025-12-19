// src/services/ExpenseService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export interface Expense {
    id?: string;
    description: string;
    amount: number;
    date: string;
    user: string;
}

const expenseCollection = collection(db, "expenses");

export const ExpenseService = {
    addExpense: async (description: string, amount: number, user: string) => {
        await addDoc(expenseCollection, {
            description,
            amount,
            user,
            date: new Date().toISOString()
        });
    },

    getExpenses: async (): Promise<Expense[]> => {
        const q = query(expenseCollection, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    }
};