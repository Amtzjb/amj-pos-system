// src/components/ExpenseModal.tsx
import { useState } from 'react';
import { ExpenseService } from '../services/ExpenseService';
import { auth } from '../firebase/config';

interface Props {
    onClose: () => void;
}

export const ExpenseModal = ({ onClose }: Props) => {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!amount || !reason) return alert("Pon el monto y la razón.");
        
        setLoading(true);
        const user = auth.currentUser?.displayName || auth.currentUser?.email || "Cajero";
        
        await ExpenseService.addExpense(reason, parseFloat(amount), user);
        
        alert("✅ Gasto registrado. Se descontará del corte.");
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold">✕</button>
                
                <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                    💸 Registrar Salida
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Monto a retirar</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-red-500 font-bold">$</span>
                            <input 
                                type="number" 
                                autoFocus
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-8 p-3 bg-red-50 border border-red-100 rounded-xl font-black text-red-600 text-lg outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Motivo</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Pago de Agua, Comida..." 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all active:scale-95"
                    >
                        {loading ? 'Guardando...' : 'CONFIRMAR RETIRO'}
                    </button>
                </div>
            </div>
        </div>
    );
};