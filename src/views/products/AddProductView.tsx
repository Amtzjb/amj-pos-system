// src/views/products/AddProductView.tsx
import { useProductFormViewModel } from '../../viewmodels/useProductFormViewModel';
import { ProductListView } from './ProductListView';

export const AddProductView = () => {
    const { form, table } = useProductFormViewModel();
    // Jalamos las variables nuevas: isEditing y resetForm
    const { product, handleChange, saveProduct, loading, isEditing, resetForm } = form;

    // Clases comunes para los inputs
    const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";
    const labelClass = "block text-xs font-bold text-gray-500 mb-1 uppercase";

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* --- SECCIÓN: FORMULARIO --- */}
            {/* Cambia de color si estamos editando (Naranja) o creando (Azul) */}
            <div className={`rounded-xl shadow-lg p-6 mb-8 border-t-4 transition-colors duration-300 ${isEditing ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-600'}`}>
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isEditing ? 'text-orange-700' : 'text-gray-800'}`}>
                        <span>{isEditing ? '✏️' : '📦'}</span> 
                        {isEditing ? 'Editando Producto' : 'Agregar Nuevo Producto'}
                    </h2>
                    
                    {/* Botón cancelar edición: Solo sale si estamos editando */}
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-red-500 underline font-bold">
                            Cancelar Edición
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-1">
                        <label className={labelClass}>Código / Barcode</label>
                        <input 
                            name="barcode" 
                            value={product.barcode} 
                            onChange={handleChange} 
                            placeholder="Escanea o escribe..." 
                            className={`${inputClass} bg-yellow-50`} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nombre del Producto</label>
                        <input 
                            name="name" 
                            value={product.name} 
                            onChange={handleChange} 
                            placeholder="Ej. Coca Cola 600ml" 
                            className={inputClass} 
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className={labelClass}>Stock Inicial</label>
                        <input 
                            type="number" 
                            name="stock" 
                            value={product.stock || ''} 
                            onChange={handleChange} 
                            placeholder="0"
                            className={inputClass} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-3">
                        <label className={labelClass}>Descripción (Opcional)</label>
                        <input 
                            name="description" 
                            value={product.description} 
                            onChange={handleChange} 
                            placeholder="Detalles adicionales, talla, color..." 
                            className={inputClass} 
                        />
                    </div>
                </div>

                {/* AREA DE PRECIOS */}
                <div className="bg-white/50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className={labelClass}>Costo (Compra)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                            <input 
                                type="number" 
                                name="costPrice" 
                                value={product.costPrice || ''} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                className={`${inputClass} pl-7`} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Precio Mercado</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                            <input 
                                type="number" 
                                name="marketPrice" 
                                value={product.marketPrice || ''} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                className={`${inputClass} pl-7`} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className={`${labelClass} text-green-700`}>Precio Venta (Público)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-green-700 font-bold">$</span>
                            <input 
                                type="number" 
                                name="salePrice" 
                                value={product.salePrice || ''} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                className={`${inputClass} pl-7 border-green-300 ring-green-100 text-lg font-bold text-green-800`} 
                            />
                        </div>
                    </div>
                    <div>
                         <label className={`${labelClass} text-purple-700`}>Mayoreo (&gt;3 pz)</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2 text-purple-700 font-bold">$</span>
                            <input 
                                type="number" 
                                name="wholesalePrice" 
                                value={product.wholesalePrice || ''} 
                                onChange={handleChange} 
                                placeholder="0.00"
                                className={`${inputClass} pl-7 border-purple-300 ring-purple-100 text-purple-800`} 
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={saveProduct} 
                    disabled={loading}
                    // El botón cambia de color si es Edición o Nuevo
                    className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 
                          isEditing ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-lg' : 'bg-gray-900 hover:bg-black hover:shadow-lg hover:-translate-y-1'}
                    `}
                >
                    {loading ? (
                        <span>Procesando...</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            {isEditing ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO'}
                        </>
                    )}
                </button>
            </div>

            {/* --- SECCIÓN: TABLA DE PRODUCTOS --- */}
            <ProductListView 
                products={table.productList} 
                loading={table.loading} 
                onDelete={table.deleteProduct} 
                onEdit={table.prepareEdit} // <--- NUEVO: Pasamos la función de editar
            />
        </div>
    );
};