// src/viewmodels/useCreditsViewModel.ts
import { useState, useEffect } from 'react';
import { type CreditSale, CreditService } from '../services/CreditService';
import type { Sale } from '../services/SaleService';
import { auth } from '../firebase/config'; // <--- Importamos Auth

export const useCreditsViewModel = () => {
    const [credits, setCredits] = useState<CreditSale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            const data = await CreditService.getCredits();
            const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setCredits(sortedData);
        } catch (error) {
            console.error("Error cargando créditos:", error);
        } finally {
            setLoading(false);
        }
    };

    const registerPayment = async (id: string, amount: number, currentRemaining: number, method: 'cash' | 'card'): Promise<Sale | null> => {
        if (!amount || amount <= 0) { alert("Ingresa un monto válido"); return null; }
        if (amount > currentRemaining) { alert("No puedes abonar más de lo que debe"); return null; }

        // OBTENEMOS EL NOMBRE DE QUIEN ESTÁ COBRANDO
        const sellerName = auth.currentUser?.displayName || auth.currentUser?.email || "Cajero";

        try {
            const ticketData = await CreditService.addPayment(id, amount, currentRemaining, method, sellerName);
            await loadCredits(); 
            return ticketData;
        } catch (error) {
            console.error(error);
            alert("Error al registrar abono");
            return null;
        }
    };

    const deleteDebt = async (id: string) => {
        const confirm = window.confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsta acción eliminará la deuda permanentemente.");
        if (!confirm) return; 

        try {
            await CreditService.deleteCredit(id);
            setCredits(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Error al eliminar: " + error);
        }
    };

    return {
        credits,
        loading,
        registerPayment,
        deleteDebt 
    };
};