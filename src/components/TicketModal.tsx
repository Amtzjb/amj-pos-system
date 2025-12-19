// src/components/TicketModal.tsx
// src/components/TicketModal.tsx
import type { Sale } from '../services/SaleService';

interface Props {
    sale: Sale | null;
    onClose: () => void;
}

export const TicketModal = ({ sale, onClose }: Props) => {
    if (!sale) return null;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    const date = new Date(sale.date).toLocaleDateString('es-ES') + ' ' + new Date(sale.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'});

    const handlePrint = () => {
        window.print();
    };

    const isPayment = sale.method.includes('payment');

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 print:bg-white print:p-0 print:absolute print:inset-0">
            <div className="bg-white w-full max-w-[350px] p-6 shadow-2xl rounded-sm print:shadow-none print:w-full print:max-w-none">
                
                {/* Header */}
                <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                    <h2 className="font-black text-2xl uppercase tracking-tighter">AMJ STORE</h2>
                    <p className="text-xs text-gray-500 uppercase font-bold mt-1">
                        {isPayment ? 'Comprobante de Abono' : 'Ticket de Venta'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{date}</p>
                    <p className="text-xs text-gray-500 mt-1">Atendió: <span className="font-bold text-gray-800">{sale.sellerName || 'Cajero'}</span></p>
                </div>

                {/* --- CONTENIDO PARA ABONOS (DEUDAS) --- */}
                {isPayment && (
                    <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-100">
                        <p className="text-sm font-bold text-center text-gray-800 mb-3 border-b border-gray-200 pb-2">ESTADO DE CUENTA</p>
                        
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Saldo Anterior:</span>
                            <span>{formatCurrency(sale.debtPrevious || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-800 mb-1">
                            <span>SU ABONO:</span>
                            <span>- {formatCurrency(sale.total)}</span>
                        </div>
                        <div className="border-t border-gray-300 my-2"></div>
                        <div className="flex justify-between text-sm font-black text-gray-900">
                            <span>RESTA:</span>
                            <span>{formatCurrency(sale.debtRemaining || 0)}</span>
                        </div>
                        
                        {sale.debtRemaining === 0 && (
                            <div className="mt-3 text-center font-bold text-xs text-green-600 border border-green-200 bg-green-50 p-1 rounded">
                                ¡CUENTA LIQUIDADA! 🎉
                            </div>
                        )}
                    </div>
                )}

                {/* --- CONTENIDO PARA VENTAS NORMALES --- */}
                {!isPayment && (
                    <div className="space-y-2 text-sm mb-6 font-mono">
                        {sale.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                                <div>
                                    <span className="font-bold mr-2">{item.quantity}x</span>
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Totales Generales */}
                <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
                    {!isPayment && (
                        <div className="flex justify-between items-center text-lg font-black">
                            <span>TOTAL</span>
                            <span>{formatCurrency(sale.total)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Método:</span>
                        <span className="uppercase font-bold">
                            {sale.method === 'cash' || sale.method === 'payment_cash' ? 'Efectivo' : 
                             sale.method === 'card' || sale.method === 'payment_card' ? 'Tarjeta/Transf' : 
                             sale.method === 'credit' ? 'Crédito' : 'Otro'}
                        </span>
                    </div>

                    {/* Detalles Extra para Ventas Contado */}
                    {sale.method === 'cash' && sale.receivedAmount !== undefined && (
                        <div className="pt-2 border-t border-dotted border-gray-200 mt-2">
                            <div className="flex justify-between items-center text-xs text-gray-600">
                                <span>Pagó con:</span>
                                <span className="font-bold">{formatCurrency(sale.receivedAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-gray-800 mt-1">
                                <span>Cambio:</span>
                                <span>{formatCurrency(sale.change || 0)}</span>
                            </div>
                        </div>
                    )}

                     {/* Detalles Extra para Ventas Crédito (Plan) */}
                     {sale.method === 'credit' && (
                        <div className="pt-2 border-t border-dotted border-gray-200 mt-2 bg-gray-50 p-2 rounded">
                            <p className="text-xs font-bold text-gray-800 mb-1">Cliente: {sale.customerName}</p>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                                <span>Plan:</span>
                                <span className="font-bold">{sale.installmentCount} Pagos Quincenales</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400">¡GRACIAS POR SU PREFERENCIA!</p>
                </div>

                {/* Botones */}
                <div className="mt-8 flex gap-3 print:hidden">
                    <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200">Cerrar</button>
                    <button onClick={handlePrint} className="flex-1 bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 flex justify-center gap-2 items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        Imprimir
                    </button>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print\\:absolute, .print\\:absolute * { visibility: visible; }
                    .print\\:absolute { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; border: none !important; }
                }
            `}</style>
        </div>
    );
};