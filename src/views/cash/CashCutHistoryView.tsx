// src/views/cash/CashCutHistoryView.tsx
import { useEffect, useState } from 'react';
import { type CashCut, CashCutService } from '../../services/CashCutService';

export const CashCutHistoryView = () => {
    const [cuts, setCuts] = useState<CashCut[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        loadCuts();
    }, []);

    const loadCuts = async () => {
        try {
            const data = await CashCutService.getCuts();
            setCuts(data);
        } catch (error) {
            console.error("Error al cargar cortes:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', { 
            weekday: 'short', year: '2-digit', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Cargando auditoría de caja...</div>;

    return (
        <div className="h-full bg-gray-100 p-6 overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <span>📚</span> Bitácora de Cortes de Caja
            </h2>

            {cuts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow border border-dashed border-gray-300">
                    <p className="text-gray-400">No hay cortes registrados aún.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white text-xs uppercase font-bold">
                                <th className="p-4">Fecha Cierre</th>
                                <th className="p-4">Cajero</th> {/* <--- NUEVA COLUMNA */}
                                <th className="p-4 text-right">Fondo Inicial</th>
                                <th className="p-4 text-right">Ventas (Efe)</th>
                                <th className="p-4 text-right">Salidas</th>
                                <th className="p-4 text-right bg-gray-700">Real en Caja</th>
                                <th className="p-4 text-center">Cuadre</th>
                                <th className="p-4 text-center">Info</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {cuts.map((cut) => (
                                <>
                                    <tr key={cut.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-gray-700">{formatDate(cut.date)}</td>
                                        {/* MOSTRAR NOMBRE DEL USUARIO */}
                                        <td className="p-4 font-bold text-blue-600">{cut.userName || "Desconocido"}</td>
                                        
                                        <td className="p-4 text-right text-gray-500">{formatCurrency(cut.initialAmount)}</td>
                                        <td className="p-4 text-right text-green-600 font-bold">+{formatCurrency(cut.totalSalesCash)}</td>
                                        <td className="p-4 text-right text-red-400">-{formatCurrency(cut.totalWithdrawals)}</td>
                                        <td className="p-4 text-right font-black text-gray-800 bg-gray-50">{formatCurrency(cut.realAmount)}</td>
                                        
                                        <td className="p-4 text-center">
                                            {cut.difference === 0 ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">OK</span>
                                            ) : cut.difference > 0 ? (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">+{formatCurrency(cut.difference)}</span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">{formatCurrency(cut.difference)}</span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => setExpandedRow(expandedRow === cut.id ? null : cut.id!)}
                                                className="text-gray-400 hover:text-blue-600 font-bold text-xs underline"
                                            >
                                                {expandedRow === cut.id ? 'Ocultar' : 'Detalles'}
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedRow === cut.id && (
                                        <tr className="bg-gray-50 animate-fadeIn">
                                            <td colSpan={8} className="p-4 shadow-inner">
                                                <div className="flex gap-4 text-xs text-gray-600">
                                                    <div className="bg-white p-3 rounded border border-gray-200 flex-1">
                                                        <p className="font-bold uppercase text-gray-400 mb-1">Notas del Cajero:</p>
                                                        <p className="italic">"{cut.notes || "Sin notas"}"</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded border border-gray-200">
                                                        <p className="font-bold uppercase text-gray-400 mb-1">Ventas Tarjeta (Informativo):</p>
                                                        <p className="text-blue-600 font-bold">{formatCurrency(cut.totalSalesCard)}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded border border-gray-200">
                                                        <p className="font-bold uppercase text-gray-400 mb-1">Debió haber:</p>
                                                        <p className="font-bold">{formatCurrency(cut.expectedAmount)}</p>
                                                    </div>
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