// src/views/credits/CreditsView.tsx
import { useCreditsViewModel } from '../../viewmodels/useCreditsViewModel';
import { useState } from 'react';
import { TicketModal } from '../../components/TicketModal'; // <--- IMPORTAR MODAL
import type { Sale } from '../../services/SaleService';

export const CreditsView = () => {
    const { credits, loading, registerPayment, deleteDebt } = useCreditsViewModel();
    
    // Estados para inputs
    const [paymentAmounts, setPaymentAmounts] = useState<{ [key: string]: string }>({});
    const [paymentMethods, setPaymentMethods] = useState<{ [key: string]: 'cash' | 'card' }>({}); 

    // Estados para filtros
    const [activeTab, setActiveTab] = useState<'actives' | 'history'>('actives');
    const [searchTerm, setSearchTerm] = useState("");

    // ESTADOS PARA EL TICKET
    const [showTicket, setShowTicket] = useState(false);
    const [lastPaymentTicket, setLastPaymentTicket] = useState<Sale | null>(null);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
        });
    };

    const handleAmountChange = (id: string, value: string) => {
        setPaymentAmounts(prev => ({ ...prev, [id]: value }));
    };

    const handleMethodChange = (id: string, method: 'cash' | 'card') => {
        setPaymentMethods(prev => ({ ...prev, [id]: method }));
    };

    // LÓGICA DE PAGO
    const handlePay = async (creditId: string, remaining: number) => {
        const amount = parseFloat(paymentAmounts[creditId] || '0');
        const method = paymentMethods[creditId] || 'cash';

        const ticket = await registerPayment(creditId, amount, remaining, method);
        
        if (ticket) {
            // Limpiamos input
            handleAmountChange(creditId, '');
            // Mostramos Ticket
            setLastPaymentTicket(ticket);
            setShowTicket(true);
        }
    };

    const filteredCredits = credits.filter(credit => {
        const matchesTab = activeTab === 'actives' ? credit.status === 'active' : credit.status === 'paid';
        const matchesSearch = 
            credit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            credit.customerPhone.includes(searchTerm);
        return matchesTab && matchesSearch;
    });

    const totalPendingInView = filteredCredits.reduce((sum, c) => sum + c.remainingDebt, 0);

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando cuentas...</div>;

    return (
        <div className="h-full bg-gray-100 p-6 overflow-y-auto flex flex-col relative">
            
            {/* --- MODAL DE TICKET DE ABONO --- */}
            {showTicket && (
                <TicketModal 
                    sale={lastPaymentTicket} 
                    onClose={() => setShowTicket(false)} 
                />
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span>📋</span> Cuentas por Cobrar
                    </h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">
                        Total en pantalla: <span className="text-gray-800">{formatCurrency(totalPendingInView)}</span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Buscar cliente..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
                        />
                    </div>
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex shrink-0">
                        <button onClick={() => setActiveTab('actives')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'actives' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>Pendientes</button>
                        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-green-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>Liquidadas</button>
                    </div>
                </div>
            </div>

            {/* LISTA */}
            {filteredCredits.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-xl border-2 border-dashed border-gray-200 m-4">
                    <p className="font-medium">No se encontraron cuentas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                    {filteredCredits.map(credit => {
                        const paidAmount = credit.totalDebt - credit.remainingDebt;
                        const progress = (paidAmount / credit.totalDebt) * 100;
                        const isPaid = credit.status === 'paid';
                        const currentMethod = paymentMethods[credit.id!] || 'cash';

                        return (
                            <div key={credit.id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-t-4 flex flex-col relative ${isPaid ? 'border-green-500 opacity-90' : 'border-orange-500'}`}>
                                
                                <button onClick={() => deleteDebt(credit.id!)} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>

                                <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 pt-8">
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-lg text-gray-800 truncate" title={credit.customerName}>{credit.customerName}</h3>
                                        <p className="text-xs text-gray-500 font-medium">📞 {credit.customerPhone}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{isPaid ? 'LIQUIDADO' : `A ${credit.installmentCount} PAGOS`}</span>
                                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(credit.date).split(',')[0]}</p>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4 flex-1">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1 font-bold text-gray-500"><span>Pagado: <span className="text-green-600">{formatCurrency(paidAmount)}</span></span><span>Total: {formatCurrency(credit.totalDebt)}</span></div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden"><div className={`h-3 rounded-full transition-all duration-500 ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div></div>
                                    </div>

                                    {!isPaid ? (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center"><p className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">Resta por pagar</p><p className="text-3xl font-black text-orange-600 tracking-tight">{formatCurrency(credit.remainingDebt)}</p></div>
                                    ) : (
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center"><p className="text-sm text-green-700 font-bold">✅ Cuenta Saldada</p></div>
                                    )}

                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Historial</p>
                                        {(!credit.payments || credit.payments.length === 0) ? <p className="text-xs text-gray-300 italic text-center">Sin abonos.</p> : (
                                            <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden max-h-24 overflow-y-auto">
                                                <table className="w-full text-[10px]">
                                                    <tbody className="divide-y divide-gray-100">
                                                        {credit.payments.map((log, index) => (
                                                            <tr key={index} className="hover:bg-blue-50">
                                                                <td className="px-2 py-1 text-gray-500">{formatDate(log.date)}</td>
                                                                <td className="px-2 py-1 text-center text-gray-400">{log.method === 'card' ? '💳' : '💵'}</td>
                                                                <td className="px-2 py-1 text-right font-bold text-green-600">+{formatCurrency(log.amount)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded truncate">
                                        <span className="font-bold">Items:</span> {credit.items.map(i => i.name).join(", ")}
                                    </div>
                                </div>

                                {!isPaid && (
                                    <div className="p-4 bg-gray-100 border-t border-gray-200 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <select 
                                                value={currentMethod}
                                                onChange={(e) => handleMethodChange(credit.id!, e.target.value as 'cash' | 'card')}
                                                className="bg-white border border-gray-300 rounded-lg text-xs font-bold px-2 outline-none focus:border-blue-500 text-gray-700"
                                            >
                                                <option value="cash">💵 Efectivo</option>
                                                <option value="card">💳 Tarjeta/Transf</option>
                                            </select>

                                            <div className="relative w-full">
                                                <span className="absolute left-2 top-2 text-gray-500 font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    value={paymentAmounts[credit.id!] || ''}
                                                    onChange={(e) => handleAmountChange(credit.id!, e.target.value)}
                                                    className="w-full pl-5 p-2 border border-gray-300 rounded-lg text-sm font-bold focus:border-orange-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handlePay(credit.id!, credit.remainingDebt)}
                                            className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                                        >
                                            REGISTRAR ABONO E IMPRIMIR
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};