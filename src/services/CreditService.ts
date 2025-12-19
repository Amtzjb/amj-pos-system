// src/services/CreditService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, arrayUnion, deleteDoc, getDoc } from "firebase/firestore";
import type { Product } from "../models/Product";
import { CustomerService } from "./CustomerService";
import { SaleService, type Sale } from "./SaleService";

export interface PaymentLog {
    amount: number;
    date: string;
    method: 'cash' | 'card';
}

export interface CreditSale {
    id?: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNotes?: string;
    items: Product[];
    totalDebt: number;
    remainingDebt: number;
    installmentCount: number;
    payments: PaymentLog[];
    status: 'active' | 'paid';
    date: string;
}

const creditCollection = collection(db, "credits");

export const CreditService = {
    createCreditSale: async (saleData: CreditSale) => {
        const customerId = await CustomerService.getOrCreateCustomer(
            saleData.customerName,
            saleData.customerPhone,
            saleData.customerAddress,
            saleData.customerNotes || ""
        );
        const saleWithCustomerId = { ...saleData, customerId };
        await addDoc(creditCollection, saleWithCustomerId);
    },

    getCredits: async (): Promise<CreditSale[]> => {
        const snapshot = await getDocs(creditCollection);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CreditSale));
    },

    // --- MODIFICADO: Recibe sellerName ---
    addPayment: async (creditId: string, amount: number, currentRemaining: number, paymentMethod: 'cash' | 'card', sellerName: string): Promise<Sale> => {
        const creditRef = doc(db, "credits", creditId);
        const creditSnap = await getDoc(creditRef);
        const creditData = creditSnap.data() as CreditSale;
        
        const newRemaining = currentRemaining - amount;
        const newStatus = newRemaining <= 0.5 ? 'paid' : 'active';
        const dateNow = new Date().toISOString();

        // 1. Actualizamos la deuda
        await updateDoc(creditRef, {
            remainingDebt: newRemaining,
            status: newStatus,
            payments: arrayUnion({ 
                amount: amount, 
                date: dateNow,
                method: paymentMethod 
            })
        });

        // 2. Preparamos el Ticket con DETALLES
        const saleMethod = paymentMethod === 'cash' ? 'payment_cash' : 'payment_card';
        
        const paymentSale: Sale = {
            date: dateNow,
            total: amount,
            method: saleMethod, 
            items: [{ name: "Abono a Cuenta", quantity: 1, price: amount }],
            customerName: creditData ? creditData.customerName : "Cliente",
            
            // AQUÍ PONEMOS TU NOMBRE
            sellerName: sellerName, 

            // AQUÍ PONEMOS LAS MATEMÁTICAS DE LA DEUDA
            debtPrevious: currentRemaining, // Debía esto
            debtRemaining: newRemaining     // Ahora debe esto
        };

        await SaleService.createSale(paymentSale);
        return paymentSale; 
    },

    deleteCredit: async (id: string) => {
        const creditRef = doc(db, "credits", id);
        await deleteDoc(creditRef);
    }
};