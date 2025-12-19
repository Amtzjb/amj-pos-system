// src/views/products/ProductListView.tsx
import type { Product } from '../../models/Product';

interface Props {
    products: Product[];
    loading: boolean;
    onDelete: (id: string) => void;
    onEdit: (product: Product) => void; // <--- NUEVO: Para poder editar
}

export const ProductListView = ({ products, loading, onDelete, onEdit }: Props) => {
    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Cargando inventario...</div>;
    if (products.length === 0) return <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-b-xl">No hay productos registrados todavía.</div>;

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <th className="px-5 py-4">PRODUCTO</th>
                        <th className="px-5 py-4 text-center">STOCK</th>
                        <th className="px-5 py-4">COSTOS</th>
                        <th className="px-5 py-4 text-blue-700">VENTA (1PZ)</th>
                        <th className="px-5 py-4 text-purple-700">MAYOREO (&gt;3)</th>
                        <th className="px-5 py-4 text-green-700">GANANCIA</th>
                        <th className="px-5 py-4">CALCULADORA PAGOS</th>
                        <th className="px-5 py-4 text-center">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                        const profit = product.salePrice - product.costPrice;
                        const pay2 = (product.salePrice / 2).toFixed(2);
                        const pay3 = (product.salePrice / 3).toFixed(2);
                        
                        // Lógica para el color del stock
                        const stockClass = product.stock > 0 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200';

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-4">
                                    <p className="text-gray-900 font-bold text-lg">{product.name}</p>
                                    {product.description && <p className="text-gray-500 text-sm mt-1">{product.description}</p>}
                                    {product.barcode && <p className="text-xs text-gray-400 font-mono mt-1">#{product.barcode}</p>}
                                </td>
                                
                                <td className="px-5 py-4 text-center align-middle">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 font-bold text-sm rounded-full shadow-sm whitespace-nowrap ${stockClass}`}>
                                        {product.stock} pz
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-gray-500 font-medium">{formatCurrency(product.costPrice)}</td>
                                <td className="px-5 py-4 font-bold text-blue-600 text-xl">{formatCurrency(product.salePrice)}</td>
                                <td className="px-5 py-4 text-purple-600 font-bold text-lg">{formatCurrency(product.wholesalePrice)}</td>
                                <td className="px-5 py-4 text-green-600 font-bold text-lg">{formatCurrency(profit)}</td>
                                <td className="px-5 py-4 text-sm text-gray-600 space-y-1">
                                    <p className="flex justify-between"><span>2 pagos:</span> <b className="text-gray-800">${pay2}</b></p>
                                    <p className="flex justify-between"><span>3 pagos:</span> <b className="text-gray-800">${pay3}</b></p>
                                </td>
                                <td className="px-5 py-4 text-center align-middle">
                                    <div className="flex justify-center gap-3">
                                        <button 
                                            onClick={() => onEdit(product)} // <--- CONECTADO: Botón Editar
                                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" 
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                        </button>
                                        <button 
                                            onClick={() => product.id && onDelete(product.id)} 
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" 
                                            title="Eliminar"
                                        >
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
    );
};