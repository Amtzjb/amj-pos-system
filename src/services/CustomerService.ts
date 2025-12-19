// src/services/CustomerService.ts
import { db } from "../firebase/config";
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";

export interface Customer {
    id?: string;
    name: string;
    phone: string;
    address: string;
    notes?: string;
    createdAt: string;
}

const customerCollection = collection(db, "customers");

export const CustomerService = {
    // Buscar si ya existe por teléfono
    findCustomerByPhone: async (phone: string): Promise<Customer | null> => {
        const q = query(customerCollection, where("phone", "==", phone));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return null;
        
        // Retornamos el primero que encuentre
        const docData = snapshot.docs[0];
        return { id: docData.id, ...docData.data() } as Customer;
    },

    // Crear uno nuevo
    createCustomer: async (data: Omit<Customer, 'id'>) => {
        const docRef = await addDoc(customerCollection, data);
        return docRef.id;
    },

    // Actualizar datos (ej. si cambió de dirección)
    updateCustomer: async (id: string, data: Partial<Customer>) => {
        const ref = doc(db, "customers", id);
        await updateDoc(ref, data);
    },

    // Obtener o Crear (La función mágica para el POS)
    getOrCreateCustomer: async (name: string, phone: string, address: string, notes: string): Promise<string> => {
        const existing = await CustomerService.findCustomerByPhone(phone);

        if (existing) {
            // Si ya existe, actualizamos su dirección por si acaso es nueva
            if (existing.id) {
                await CustomerService.updateCustomer(existing.id, { 
                    name, // Actualizamos nombre por si corrigieron un error tipográfico
                    address, 
                    notes 
                });
                return existing.id;
            }
        }

        // Si no existe, lo creamos
        const newId = await CustomerService.createCustomer({
            name,
            phone,
            address,
            notes,
            createdAt: new Date().toISOString()
        });
        
        return newId;
    }
};