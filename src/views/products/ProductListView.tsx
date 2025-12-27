// src/views/products/ProductListView.tsx
import type { Product } from '../../models/Product';

interface Props {
    products: Product[];
    loading: boolean;
    onDelete: (id: string) => void;
    onEdit: (product: Product) => void;
}

export const ProductListView = ({ products, loading, onDelete, onEdit }: Props) => {
    
    // Función auxiliar para formatear dinero
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // Función para obtener el estado del stock (Colores y Etiquetas)
    const getStockStatus = (product: Product) => {
        const minStock = product.minStock || 0;
        let className = '';
        let label = '';

        if (product.isOnDemand) {
            if (product.stock < 0) {
                className = 'bg-red-100 text-red-800 border border-red-200 animate-pulse';
                label = `DEBES: ${Math.abs(product.stock)}`;
            } else {
                className = 'bg-purple-100 text-purple-800 border border-purple-200';
                label = 'SOBRE PEDIDO';
            }
        } else {
            if (product.stock <= 0) {
                className = 'bg-gray-200 text-gray-500 border border-gray-300 line-through';
                label = 'AGOTADO';
            } else if (product.stock <= minStock) {
                className = 'bg-red-100 text-red-800 border border-red-200 font-black';
                label = `${product.stock} pz (BAJO)`;
            } else if (product.stock <= (minStock + 2)) {
                className = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
                label = `${product.stock} pz`;
            } else {
                className = 'bg-green-100 text-green-800 border border-green-200';
                label = `${product.stock} pz`;
            }
        }
        return { className, label };
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Cargando inventario...</div>;
    if (products.length === 0) return <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-b-xl">No hay productos registrados todavía.</div>;

    return (
        // CAMBIO PRINCIPAL: h-full y flex-col para gestionar el scroll interno
        <div className="h-full bg-gray-100 md:bg-white rounded-xl md:shadow-lg md:border md:border-gray-200 flex flex-col overflow-hidden">
            
            {/* ========================================================== */}
            {/* VISTA MÓVIL (CARDS) - Scroll independiente */}
            {/* ========================================================== */}
            <div className="md:hidden flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                {products.map((product) => {
                    const status = getStockStatus(product);
                    const profit = product.salePrice - product.costPrice;
                    const pay2 = (product.salePrice / 2).toFixed(2);
                    
                    return (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            {/* Cabecera Card: Nombre y Precio */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                                    {product.barcode && <p className="text-xs text-gray-400 font-mono">#{product.barcode}</p>}
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-black text-blue-600">{formatCurrency(product.salePrice)}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Precio</span>
                                </div>
                            </div>

                            {/* Badge de Stock */}
                            <div className="mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>
                                    {status.label}
                                </span>
                            </div>

                            {/* Grid de Costos */}
                            <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Costo</p><p className="font-medium text-gray-600">{formatCurrency(product.costPrice)}</p></div>
                                <div><p className="text-[10px] text-green-600 font-bold uppercase">Ganancia</p><p className="font-bold text-green-600">{formatCurrency(profit)}</p></div>
                                <div><p className="text-[10px] text-purple-600 font-bold uppercase">Mayoreo</p><p className="font-bold text-purple-600">{formatCurrency(product.wholesalePrice)}</p></div>
                                <div><p className="text-[10px] text-gray-400 font-bold uppercase">2 Pagos</p><p className="font-medium text-gray-800">${pay2}</p></div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex gap-2 border-t border-gray-100 pt-3">
                                <button onClick={() => onEdit(product)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><span>✏️ Editar</span></button>
                                <button onClick={() => product.id && onDelete(product.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"><span>🗑️ Borrar</span></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ========================================================== */}
            {/* VISTA ESCRITORIO (TABLA) - Scroll independiente y Header Sticky */}
            {/* ========================================================== */}
            <div className="hidden md:block flex-1 overflow-auto custom-scrollbar">
                <table className="min-w-full leading-normal">
                    {/* CAMBIO CLAVE: sticky top-0 para fijar encabezados */}
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 shadow-sm">
                            <th className="px-5 py-4 whitespace-nowrap bg-gray-100">PRODUCTO</th>
                            <th className="px-5 py-4 text-center whitespace-nowrap bg-gray-100">STOCK / ALERTA</th>
                            <th className="px-5 py-4 whitespace-nowrap bg-gray-100">COSTOS</th>
                            <th className="px-5 py-4 text-blue-700 whitespace-nowrap bg-gray-100">VENTA (1PZ)</th>
                            <th className="px-5 py-4 text-purple-700 whitespace-nowrap bg-gray-100">MAYOREO (&gt;3)</th>
                            <th className="px-5 py-4 text-green-700 whitespace-nowrap bg-gray-100">GANANCIA</th>
                            <th className="px-5 py-4 whitespace-nowrap min-w-[160px] bg-gray-100">PLAN DE PAGOS</th>
                            <th className="px-5 py-4 text-center whitespace-nowrap bg-gray-100">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => {
                            const status = getStockStatus(product);
                            const profit = product.salePrice - product.costPrice;
                            const pay2 = (product.salePrice / 2).toFixed(2);
                            const pay3 = (product.salePrice / 3).toFixed(2);
                            
                            return (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="text-gray-900 font-bold text-lg">{product.name}</p>
                                        {product.description && <p className="text-gray-500 text-sm mt-1">{product.description}</p>}
                                        {product.barcode && <p className="text-xs text-gray-400 font-mono mt-1">#{product.barcode}</p>}
                                    </td>
                                    
                                    <td className="px-5 py-4 text-center align-middle">
                                        <span className={`inline-flex items-center justify-center px-3 py-1 font-bold text-xs rounded-full shadow-sm whitespace-nowrap ${status.className}`}>
                                            {status.label}
                                        </span>
                                        {!product.isOnDemand && product.minStock && product.minStock > 0 && (
                                            <p className="text-[10px] text-gray-400 mt-1">Mín: {product.minStock}</p>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-gray-500 font-medium whitespace-nowrap">{formatCurrency(product.costPrice)}</td>
                                    <td className="px-5 py-4 font-bold text-blue-600 text-xl whitespace-nowrap">{formatCurrency(product.salePrice)}</td>
                                    <td className="px-5 py-4 text-purple-600 font-bold text-lg whitespace-nowrap">{formatCurrency(product.wholesalePrice)}</td>
                                    <td className="px-5 py-4 text-green-600 font-bold text-lg whitespace-nowrap">{formatCurrency(profit)}</td>
                                    
                                    <td className="px-5 py-4 align-middle">
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase bg-white px-1.5 rounded border border-gray-200">2 Pagos</span>
                                                <b className="text-gray-800 text-sm">${pay2}</b>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase bg-white px-1.5 rounded border border-gray-200">3 Pagos</span>
                                                <b className="text-gray-800 text-sm">${pay3}</b>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-center align-middle whitespace-nowrap">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => onEdit(product)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                            </button>
                                            <button onClick={() => product.id && onDelete(product.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Eliminar">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};