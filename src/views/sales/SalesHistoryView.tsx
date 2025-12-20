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
    const totalSalesValue = filteredSales
        .filter(s => !s.method.includes('payment'))
        .reduce((acc, sale) => acc + sale.total, 0);

    const totalCashReal = filteredSales
        .filter(s => s.method !== 'credit')
        .reduce((acc, sale) => acc + sale.total, 0);

    const totalProfit = filteredSales.reduce((totalAcc, sale) => {
        if (sale.method.includes('payment')) return totalAcc;
        const saleProfit = sale.items.reduce((itemAcc, item) => {
            const price = item.price || 0;
            const cost = item.cost || 0; 
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

    // Helper para alternar expansión
    const toggleExpand = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando historial...</div>;

    return (
        <div className="h-full bg-gray-100 p-4 md:p-6 overflow-y-auto">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Movimientos del Día</h2>
                    <p className="text-xs text-gray-400 font-bold">Fecha seleccionada: {filterDate}</p>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase pl-2">Fecha:</span>
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="font-bold text-gray-800 outline-none cursor-pointer w-full md:w-auto" />
                </div>
            </div>

            {/* GRID DE TOTALES (Funciona igual en móvil y PC) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Mercancía</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalSalesValue)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Precio venta total</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingreso Real (Caja)</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{formatCurrency(totalCashReal)}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Lo que entró al cajón/banco</p>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Ganancia Estimada</p>
                    <p className="text-2xl font-black text-green-700 mt-1">{formatCurrency(totalProfit)}</p>
                    <p className="text-[10px] text-green-600/70 mt-1 font-bold">Venta - Costo Producto</p>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            {filteredSales.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-lg">No hubo movimientos este día.</p>
                 </div>
            ) : (
                <>
                    {/* ========================================================== */}
                    {/* VISTA MÓVIL (TICKETS) - visible solo en pantallas chicas */}
                    {/* ========================================================== */}
                    <div className="md:hidden space-y-4">
                        {filteredSales.map((sale) => {
                            const isPayment = sale.method.includes('payment');
                            const borderColor = isPayment ? 'border-l-purple-500' : (sale.method === 'credit' ? 'border-l-orange-500' : 'border-l-green-500');
                            
                            return (
                                <div 
                                    key={sale.id} 
                                    onClick={() => sale.id && !isPayment && toggleExpand(sale.id)}
                                    className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-[6px] ${borderColor} active:scale-[0.98] transition-transform`}
                                >
                                    {/* Cabecera del Ticket */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-0.5">{formatDate(sale.date)}</p>
                                            <h3 className="font-bold text-gray-800 text-sm">
                                                {sale.customerName || "Venta de Mostrador"}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block text-xl font-black ${sale.method === 'credit' ? 'text-gray-400' : 'text-gray-900'}`}>
                                                {sale.method === 'credit' ? formatCurrency(sale.total) : `+${formatCurrency(sale.total)}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detalles e Icono */}
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center gap-2">
                                            {getMethodBadge(sale.method)}
                                            <span className="text-[10px] text-gray-400 ml-1">👤 {sale.sellerName || 'Sistema'}</span>
                                        </div>
                                        {!isPayment && (
                                            <div className="text-gray-300">
                                                {expandedRow === sale.id ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lista Expandible (Móvil) */}
                                    {expandedRow === sale.id && !isPayment && (
                                        <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                                            <ul className="space-y-2">
                                                {sale.items.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between text-xs text-gray-600">
                                                        <span><b className="text-blue-600">{item.quantity}x</b> {item.name}</span>
                                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ========================================================== */}
                    {/* VISTA ESCRITORIO (TABLA) - visible solo en pantallas medianas+ */}
                    {/* ========================================================== */}
                    <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
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
                                                    <button onClick={() => sale.id && toggleExpand(sale.id)} className={`p-2 rounded-full transition-all ${expandedRow === sale.id ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-gray-300 hover:bg-gray-100'}`}>
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
                </>
            )}
        </div>
    );
};