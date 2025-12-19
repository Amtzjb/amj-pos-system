// src/views/cash/CashCutView.tsx
import { useState, useEffect } from 'react';
import { SaleService } from '../../services/SaleService';
import { CashCutService } from '../../services/CashCutService';
import { ExpenseService } from '../../services/ExpenseService'; // <--- IMPORTAR
import { auth } from '../../firebase/config';

export const CashCutView = () => {
    // Datos calculados del sistema
    const [systemCash, setSystemCash] = useState(0);
    const [systemCard, setSystemCard] = useState(0);
    const [systemExpenses, setSystemExpenses] = useState(0); // <--- NUEVO
    const [loading, setLoading] = useState(true);

    const [existingCut, setExistingCut] = useState<any | null>(null);

    // Inputs del usuario
    const [initialAmount, setInitialAmount] = useState<string>(""); 
    const [realAmount, setRealAmount] = useState<string>("");       
    const [notes, setNotes] = useState("");

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const cuts = await CashCutService.getCuts();
        const todayStr = new Date().toLocaleDateString('es-ES');
        
        const foundCut = cuts.find(cut => {
            const cutDate = new Date(cut.date).toLocaleDateString('es-ES');
            return cutDate === todayStr;
        });

        if (foundCut) {
            setExistingCut(foundCut);
        } else {
            await calculateTodaySales();
        }
        setLoading(false);
    };

    const calculateTodaySales = async () => {
        const todayStr = new Date().toLocaleDateString('es-ES');
        
        // 1. VENTAS
        const allSales = await SaleService.getSales();
        const todaySales = allSales.filter(sale => new Date(sale.date).toLocaleDateString('es-ES') === todayStr);

        const cash = todaySales
            .filter(s => s.method === 'cash' || s.method === 'payment_cash')
            .reduce((sum, s) => sum + s.total, 0);

        const card = todaySales
            .filter(s => s.method === 'card' || s.method === 'payment_card')
            .reduce((sum, s) => sum + s.total, 0);

        // 2. GASTOS (NUEVO)
        const allExpenses = await ExpenseService.getExpenses();
        const todayExpenses = allExpenses
            .filter(e => new Date(e.date).toLocaleDateString('es-ES') === todayStr)
            .reduce((sum, e) => sum + e.amount, 0);

        setSystemCash(cash);
        setSystemCard(card);
        setSystemExpenses(todayExpenses); // <--- Guardamos los gastos
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const handleSaveCut = async () => {
        const initial = parseFloat(initialAmount) || 0;
        const withdrawn = systemExpenses; // Usamos los gastos registrados
        const declared = parseFloat(realAmount) || 0;
        
        const expected = (systemCash + initial) - withdrawn;
        const diff = declared - expected;
        const currentUserName = auth.currentUser?.displayName || auth.currentUser?.email || "Desconocido";

        const newCut = {
            date: new Date().toISOString(),
            totalSales: systemCash + systemCard,
            totalSalesCash: systemCash,
            totalSalesCard: systemCard,
            initialAmount: initial,
            totalWithdrawals: withdrawn, // Guardamos los retiros automáticos
            expectedAmount: expected,
            realAmount: declared,
            difference: diff,
            notes: notes,
            userName: currentUserName
        };

        await CashCutService.createCut(newCut);
        loadData();
    };

    if (loading) return <div className="p-10 text-center text-gray-400">Verificando caja...</div>;

    if (existingCut) {
        // ... (Tu código existente para mostrar el ticket de cierre YA HECHO - No cambia, solo asegúrate de mostrar retiros si quieres) ...
        return (
             <div className="h-full bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
                    <h2 className="text-2xl font-black text-gray-800 mb-1">Caja Cerrada</h2>
                    <p className="text-gray-400 font-bold text-sm mb-6">El corte del día ya fue registrado.</p>

                    <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 border border-dashed border-gray-300">
                        <div className="flex justify-between"><span className="text-gray-500 font-bold text-xs uppercase">Cajero</span><span className="font-bold text-blue-600 text-xs">{existingCut.userName || "Desconocido"}</span></div>
                        <div className="h-px bg-gray-200 my-2"></div>
                        <div className="flex justify-between"><span className="text-gray-500 font-bold text-xs uppercase">Ventas (Efectivo)</span><span className="font-bold text-gray-800 text-xs">{formatCurrency(existingCut.totalSalesCash)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 font-bold text-xs uppercase">Gastos/Salidas</span><span className="font-bold text-red-500 text-xs">-{formatCurrency(existingCut.totalWithdrawals)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 font-bold text-xs uppercase">Efectivo Declarado</span><span className="font-bold text-gray-800 text-xs">{formatCurrency(existingCut.realAmount)}</span></div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between items-center"><span className="text-gray-500 font-bold text-xs uppercase">Diferencia</span><span className={`font-black text-lg ${existingCut.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>{existingCut.difference > 0 ? '+' : ''}{formatCurrency(existingCut.difference)}</span></div>
                    </div>
                    
                    <button onClick={() => window.location.reload()} className="text-blue-600 text-xs font-bold hover:underline">Actualizar sistema</button>
                </div>
            </div>
        );
    }

    // --- ESCENARIO: CALCULADORA (SIN CERRAR) ---
    // Calculamos lo que debe haber
    const currentExpected = (parseFloat(initialAmount) || 0) + systemCash - systemExpenses;
    const currentDiff = (parseFloat(realAmount) || 0) - currentExpected;

    return (
        <div className="h-full bg-gray-100 p-6 overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Cierre de Caja (Hoy)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-400 font-bold text-xs uppercase mb-4">Lo que dice el sistema</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center"><span className="text-gray-600 font-bold">💵 Ventas en Efectivo</span><span className="text-xl font-black text-gray-800">{formatCurrency(systemCash)}</span></div>
                            
                            {/* AQUÍ MOSTRAMOS LOS GASTOS AUTOMÁTICOS */}
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="text-red-600 font-bold">💸 Gastos Registrados</span>
                                <span className="text-xl font-black text-red-600">-{formatCurrency(systemExpenses)}</span>
                            </div>

                            <div className="flex justify-between items-center"><span className="text-gray-600 font-bold">💳 Ventas con Tarjeta</span><span className="text-xl font-black text-gray-800">{formatCurrency(systemCard)}</span></div>
                            <div className="h-px bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-center"><span className="text-blue-600 font-bold">TOTAL VENDIDO</span><span className="text-2xl font-black text-blue-600">{formatCurrency(systemCash + systemCard)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                    <h3 className="text-gray-400 font-bold text-xs uppercase mb-6">Tu Conteo (Arqueo)</h3>
                    <div className="space-y-4">
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fondo Inicial</label><div className="relative"><span className="absolute left-3 top-3 text-gray-400 font-bold">$</span><input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" /></div></div>
                        
                        {/* EL CAMPO DE RETIROS YA NO ES EDITABLE, SE CALCULA SOLO */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Retiros / Gastos (Automático)</label>
                            <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-red-500 text-right">
                                - {formatCurrency(systemExpenses)}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100"><div className="flex justify-between items-center mb-1"><span className="text-blue-800 font-bold text-sm">Debes tener en efectivo:</span><span className="text-xl font-black text-blue-800">{formatCurrency(currentExpected)}</span></div></div>
                        <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">¿Cuánto contaste realmente?</label><div className="relative"><span className="absolute left-3 top-3 text-gray-400 font-bold">$</span><input type="number" value={realAmount} onChange={e => setRealAmount(e.target.value)} className="w-full pl-8 p-3 bg-white border-2 border-black rounded-xl font-black text-xl text-gray-900 outline-none focus:shadow-lg transition-shadow" placeholder="0.00" /></div></div>
                        <div className={`p-4 rounded-xl text-center transition-all ${realAmount === '' ? 'bg-gray-100' : currentDiff === 0 ? 'bg-green-100 text-green-700' : currentDiff > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}><p className="text-xs font-bold uppercase mb-1">Diferencia</p><p className="text-2xl font-black">{currentDiff > 0 ? '+' : ''}{formatCurrency(currentDiff)}</p></div>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas..." className="w-full p-3 border border-gray-200 rounded-lg text-sm mb-4"></textarea>
                        <button onClick={handleSaveCut} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-transform active:scale-95 shadow-lg">CONFIRMAR CIERRE</button>
                    </div>
                </div>
            </div>
        </div>
    );
};