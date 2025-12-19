// src/views/admin/AdminDashboardView.tsx
import { useEffect, useState } from 'react';
import { type Sale, SaleService } from '../../services/SaleService';

export const AdminDashboardView = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtro de Mes Actual por defecto
    const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // formato YYYY-MM

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await SaleService.getSales();
        setSales(data);
        setLoading(false);
    };

    // --- LÓGICA DE FILTRADO Y CÁLCULOS ---
    
    // 1. Filtrar ventas por el mes seleccionado
    const filteredSales = sales.filter(s => s.date.startsWith(monthFilter));

    // 2. Calcular Ranking de Vendedores
    const sellersRanking: { [key: string]: number } = {};
    
    filteredSales.forEach(sale => {
        // Ignoramos abonos de deuda para no duplicar venta, solo ventas reales
        if (sale.method.includes('payment')) return;

        const seller = sale.sellerName || "Desconocido";
        if (!sellersRanking[seller]) sellersRanking[seller] = 0;
        sellersRanking[seller] += sale.total;
    });

    // Convertir a array y ordenar de mayor a menor
    const sortedSellers = Object.entries(sellersRanking)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

    // 3. Calcular Top Productos
    const productsRanking: { [key: string]: number } = {};

    filteredSales.forEach(sale => {
        if (sale.method.includes('payment')) return;

        sale.items.forEach(item => {
            if (!productsRanking[item.name]) productsRanking[item.name] = 0;
            productsRanking[item.name] += item.quantity;
        });
    });

    // Top 5 Productos más vendidos
    const topProducts = Object.entries(productsRanking)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    if (loading) return <div className="p-10 text-center text-gray-400">Analizando datos...</div>;

    // Calcular el máximo vendido para las barras de progreso
    const maxSale = sortedSellers.length > 0 ? sortedSellers[0].total : 1;

    return (
        <div className="h-full bg-gray-100 p-6 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                        <span>📊</span> Panel de Control
                    </h2>
                    <p className="text-xs text-gray-400 font-bold">Estadísticas de rendimiento</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase pl-2">Mes:</span>
                    <input 
                        type="month" 
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="font-bold text-gray-800 outline-none cursor-pointer bg-transparent"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- TARJETA 1: RANKING VENDEDORES --- */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <h3 className="text-gray-800 font-black text-lg mb-6 flex items-center gap-2">
                        <span>🏆</span> Top Vendedores
                    </h3>

                    {sortedSellers.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No hay ventas este mes.</p>
                    ) : (
                        <div className="space-y-6">
                            {sortedSellers.map((seller, index) => {
                                // Calculamos porcentaje para la barra
                                const percent = (seller.total / maxSale) * 100;
                                // Colores para el top 3
                                const medalColor = index === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                                   index === 1 ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                                                   index === 2 ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                                   'bg-white text-gray-500 border-transparent';

                                return (
                                    <div key={seller.name} className="relative">
                                        <div className="flex justify-between items-end mb-1 z-10 relative">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border ${medalColor}`}>
                                                    {index + 1}
                                                </span>
                                                <span className="font-bold text-gray-700">{seller.name}</span>
                                            </div>
                                            <span className="font-black text-gray-900">{formatCurrency(seller.total)}</span>
                                        </div>
                                        {/* Barra de progreso visual */}
                                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-600' : 'bg-blue-300'}`} 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- TARJETA 2: PRODUCTOS ESTRELLA --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-800 font-black text-lg mb-6 flex items-center gap-2">
                        <span>⭐</span> Productos Más Vendidos
                    </h3>

                    {topProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">Sin datos aún.</p>
                    ) : (
                        <div className="space-y-0">
                            {topProducts.map((prod, index) => (
                                <div key={prod.name} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 text-blue-600 font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                                            #{index + 1}
                                        </div>
                                        <p className="font-bold text-gray-600 text-sm">{prod.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-gray-800 text-lg">{prod.qty}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Unidades</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* --- RESUMEN TOTAL --- */}
            <div className="mt-8 bg-gray-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-2">Total Ventas (Mes)</h4>
                    <p className="text-4xl font-black tracking-tight">
                        {formatCurrency(filteredSales.reduce((sum, s) => !s.method.includes('payment') ? sum + s.total : sum, 0))}
                    </p>
                </div>
                <div className="h-px w-full md:w-px md:h-16 bg-gray-700"></div>
                <div>
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-2">Transacciones</h4>
                    <p className="text-4xl font-black tracking-tight text-blue-400">
                        {filteredSales.length}
                    </p>
                </div>
                <div className="h-px w-full md:w-px md:h-16 bg-gray-700"></div>
                 <div className="text-right">
                    <h4 className="text-gray-400 font-bold uppercase text-xs mb-2">Ticket Promedio</h4>
                    <p className="text-4xl font-black tracking-tight text-green-400">
                        {filteredSales.length > 0 
                            ? formatCurrency(filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length) 
                            : "$0.00"}
                    </p>
                </div>
            </div>
        </div>
    );
};