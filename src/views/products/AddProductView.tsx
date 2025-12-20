// src/views/products/AddProductView.tsx
import { useProductFormViewModel } from '../../viewmodels/useProductFormViewModel';
import { ProductListView } from './ProductListView';

export const AddProductView = () => {
    const { form, table } = useProductFormViewModel();
    const { product, handleChange, saveProduct, loading, isEditing, resetForm } = form;

    const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";
    const labelClass = "block text-xs font-bold text-gray-500 mb-1 uppercase";

    // --- CÁLCULOS AUTOMÁTICOS DE DINERO (NUEVO) ---
    // Solo sumamos productos FÍSICOS (stock > 0) y que NO sean sobre pedido
    const physicalProducts = table.productList.filter(p => !p.isOnDemand && p.stock > 0);
    
    const totalInvestment = physicalProducts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const totalSaleValue = physicalProducts.reduce((acc, p) => acc + (p.salePrice * p.stock), 0);
    const potentialProfit = totalSaleValue - totalInvestment;
    const totalItems = physicalProducts.reduce((acc, p) => acc + p.stock, 0);

    const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // --- FUNCIÓN ESPECIAL PARA EL CHECKBOX ---
    const handleOnDemandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        if (e.target.checked) {
            // Si es sobre pedido, stock y mínimo se van a 0
            handleChange({ target: { name: 'stock', value: '0', type: 'number' } } as any);
            handleChange({ target: { name: 'minStock', value: '0', type: 'number' } } as any);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            
            {/* --- SECCIÓN 1: FORMULARIO (Tu código original intacto) --- */}
            <div className={`rounded-xl shadow-lg p-6 mb-8 border-t-4 transition-colors duration-300 ${isEditing ? 'bg-orange-50 border-orange-500' : 'bg-white border-blue-600'}`}>
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold flex items-center gap-2 ${isEditing ? 'text-orange-700' : 'text-gray-800'}`}>
                        <span>{isEditing ? '✏️' : '📦'}</span> 
                        {isEditing ? 'Editando Producto' : 'Agregar Nuevo Producto'}
                    </h2>
                    
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-gray-500 hover:text-red-500 underline font-bold">
                            Cancelar Edición
                        </button>
                    )}
                </div>
                
                {/* --- SELECTOR DE CATEGORÍA --- */}
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className={labelClass}>¿Qué tipo de artículo es?</label>
                    <select 
                        name="category" 
                        value={product.category || 'otros'} 
                        onChange={handleChange}
                        className={`${inputClass} font-bold text-gray-700`}
                    >
                        <option value="otros">📦 General / Otros</option>
                        <option value="snacks">🍔 Snacks y Bebidas</option>
                        <option value="productos">🧴 Productos Belleza</option>
                        <option value="herramientas">✂️ Herramientas / Equipo</option>
                    </select>
                </div>

                {/* --- CHECKBOX SOBRE PEDIDO --- */}
                <div className="mb-6 flex items-center gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                    <input 
                        type="checkbox" 
                        id="isOnDemand"
                        name="isOnDemand"
                        checked={product.isOnDemand || false} 
                        onChange={handleOnDemandChange}
                        className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 border-gray-300 cursor-pointer"
                    />
                    <div className="cursor-pointer">
                        <label htmlFor="isOnDemand" className="font-bold text-purple-800 text-sm cursor-pointer block">
                            🚚 Producto "Sobre Pedido" (Dropshipping)
                        </label>
                        <p className="text-xs text-purple-600">
                            No manejas stock físico. Se activará el control de pedidos pendientes.
                        </p>
                    </div>
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
                            placeholder="Ej. Secadora Babyliss Pro" 
                            className={inputClass} 
                        />
                    </div>
                    
                    {/* --- STOCK Y ALERTA (SEMÁFORO) --- */}
                    <div className="md:col-span-1 grid grid-cols-2 gap-2">
                        <div>
                            <label className={labelClass}>Stock Actual</label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={product.isOnDemand ? 0 : (product.stock || '')} 
                                onChange={handleChange} 
                                placeholder="0"
                                disabled={product.isOnDemand}
                                className={`${inputClass} font-bold ${product.isOnDemand ? 'bg-gray-200 text-gray-400' : ''}`} 
                            />
                        </div>
                        <div>
                            <label className={`${labelClass} text-red-500`}>Alerta Mín. 🚨</label>
                            <input 
                                type="number" 
                                name="minStock" 
                                value={product.isOnDemand ? 0 : (product.minStock || '')} 
                                onChange={handleChange} 
                                placeholder="5"
                                disabled={product.isOnDemand}
                                title="Te avisaremos cuando baje de esta cantidad"
                                className={`${inputClass} border-red-200 focus:border-red-500 text-red-600 ${product.isOnDemand ? 'bg-gray-200 text-gray-400' : ''}`} 
                            />
                        </div>
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

            {/* --- SECCIÓN 2: NUEVO DASHBOARD FINANCIERO 💰 (AQUÍ ESTÁ LO NUEVO) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* TARJETA 1: INVERSIÓN */}
                <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Inversión (Costo)</p>
                        <p className="text-2xl font-black text-gray-800">{formatMoney(totalInvestment)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">🏦</div>
                </div>

                {/* TARJETA 2: VALOR DE VENTA */}
                <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Valor en Venta</p>
                        <p className="text-2xl font-black text-green-600">{formatMoney(totalSaleValue)}</p>
                        <p className="text-xs text-gray-400">{totalItems} productos físicos</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-xl">💵</div>
                </div>

                {/* TARJETA 3: GANANCIA POTENCIAL */}
                <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ganancia Potencial</p>
                        <p className="text-2xl font-black text-purple-600">{formatMoney(potentialProfit)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-xl">🚀</div>
                </div>
            </div>

            {/* --- SECCIÓN 3: TABLA DE PRODUCTOS --- */}
            <ProductListView 
                products={table.productList} 
                loading={table.loading} 
                onDelete={table.deleteProduct} 
                onEdit={table.prepareEdit} 
            />
        </div>
    );
};