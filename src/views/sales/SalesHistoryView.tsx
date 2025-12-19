// src/views/sales/SalesHistoryView.tsx
import { useEffect, useState } from 'react';
import { type Sale, SaleService } from '../../services/SaleService';

export const SalesHistoryView = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    // Filtro de fecha
    const getTodayString = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    
    const [filterDate, setFilterDate] = useState<string>(getTodayString());

    useEffect(() => { loadSales(); }, []);

    const loadSales = async () => {
        const data = await SaleService.getSales();
        setSales(data);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // --- FILTRADO POR FECHA ---
    const filteredSales = sales.filter(sale => {
        if (!filterDate) return true;
        const saleDateObj = new Date(sale.date);
        const offset = saleDateObj.getTimezoneOffset() * 60000;
        const saleDateStr = new Date(saleDateObj.getTime() - offset).toISOString().split('T')[0];
        return saleDateStr === filterDate;
    });

    // --- CÁLCULOS MAESTROS ---
    
    // 1. VALOR VENDIDO (Mercancía)
    const totalSalesValue = filteredSales
        .filter(s => !s.method.includes('payment')) // Excluimos abonos, solo ventas reales
        .reduce((acc, sale) => acc + sale.total, 0);

    // 2. DINERO REAL (Caja)
    const totalCashReal = filteredSales
        .filter(s => s.method !== 'credit') // Excluimos créditos (no entró dinero)
        .reduce((acc, sale) => acc + sale.total, 0);

    // 3. GANANCIA ESTIMADA (Utilidad)
    const totalProfit = filteredSales.reduce((totalAcc, sale) => {
        // Solo calculamos ganancia de ventas de mercancía (no de abonos de deuda)
        if (sale.method.includes('payment')) return totalAcc;

        const saleProfit = sale.items.reduce((itemAcc, item) => {
            const price = item.price || 0;
            const cost = item.cost || 0; 
            // Si el costo es 0 (ventas viejas), la ganancia será igual al precio.
            const profitPerItem = (price - cost) * item.quantity;
            return itemAcc + profitPerItem;
        }, 0);

        return totalAcc + saleProfit;
    }, 0);

    const getMethodBadge = (method: string) => {
        switch(method) {
            case 'cash': return <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-200">💵 Efectivo</span>;
            case 'card': return <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">💳 Tarjeta</span>;
            case 'credit': return <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">⏳ Crédito</span>;
            case 'payment_cash': return <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">💰 Abono (Efe)</span>;
            case 'payment_card': return <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200">🏦 Abono (Dig)</span>;
            default: return method;
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando historial...</div>;

    return (
        <div className="h-full bg-gray-100 p-6 overflow-y-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Movimientos del Día</h2>
                    <p className="text-xs text-gray-400 font-bold">Fecha seleccionada: {filterDate}</p>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase pl-2">Fecha:</span>
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="font-bold text-gray-800 outline-none cursor-pointer" />
                </div>
            </div>

            {/* GRID DE 3 TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* 1. Mercancía Vendida */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Mercancía</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalSalesValue)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Precio venta total</p>
                </div>

                {/* 2. Dinero Real */}
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingreso Real (Caja)</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{formatCurrency(totalCashReal)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Lo que entró al cajón/banco</p>
                </div>

                {/* 3. GANANCIA (NUEVA TARJETA) */}
                <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Ganancia Estimada</p>
                    <p className="text-2xl font-black text-green-700 mt-1">{formatCurrency(totalProfit)}</p>
                    <p className="text-[10px] text-green-600/70 mt-1 font-bold">Venta - Costo Producto</p>
                </div>
            </div>

            {/* TABLA DE MOVIMIENTOS */}
            {filteredSales.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-lg">No hubo movimientos este día.</p>
                 </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-200">
                                <th className="p-4">Hora</th>
                                <th className="p-4">Info</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Monto</th>
                                <th className="p-4 text-center">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredSales.map((sale) => (
                                <>
                                    <tr key={sale.id} className={`transition-colors ${sale.method.includes('payment') ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-blue-50'}`}>
                                        <td className="p-4 font-bold text-gray-400 text-xs">{formatDate(sale.date)}</td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {sale.customerName || "Venta de Mostrador"}
                                            <span className="block text-[10px] text-gray-400 font-normal mt-0.5">
                                                👤 {sale.sellerName || 'Sistema'}
                                            </span>
                                        </td>
                                        <td className="p-4">{getMethodBadge(sale.method)}</td>
                                        <td className={`p-4 text-right font-bold text-base ${sale.method === 'credit' ? 'text-gray-400' : 'text-green-600'}`}>
                                            {sale.method === 'credit' ? formatCurrency(sale.total) : `+${formatCurrency(sale.total)}`}
                                        </td>
                                        <td className="p-4 text-center">
                                            {!sale.method.includes('payment') && (
                                                <button onClick={() => setExpandedRow(expandedRow === sale.id ? null : sale.id!)} className={`p-2 rounded-full transition-all ${expandedRow === sale.id ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-gray-300 hover:bg-gray-100'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRow === sale.id && !sale.method.includes('payment') && (
                                        <tr className="bg-gray-50/50 animate-fadeIn">
                                            <td colSpan={5} className="p-4 shadow-inner">
                                                <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-3">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Productos</p>
                                                    <ul className="space-y-1">
                                                        {sale.items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between text-xs text-gray-600 border-b border-gray-50 last:border-0 pb-1 last:pb-0">
                                                                <span><b className="text-blue-600">{item.quantity}x</b> {item.name}</span>
                                                                <div className="text-right">
                                                                    <span className="block">{formatCurrency(item.price * item.quantity)}</span>
                                                                    {/* Mostramos ganancia por item solo aquí abajo en pequeñito */}
                                                                    {(item.cost && item.cost > 0) && (
                                                                        <span className="text-[9px] text-green-600 font-bold">
                                                                            (Ganancia: {formatCurrency((item.price - item.cost) * item.quantity)})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};