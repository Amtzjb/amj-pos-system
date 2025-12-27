// src/views/products/AddProductView.tsx
import { useState, useMemo } from 'react'; // Importamos useMemo
import { useProductFormViewModel } from '../../viewmodels/useProductFormViewModel';
import { ProductListView } from './ProductListView';

export const AddProductView = () => {
    const { form, table } = useProductFormViewModel();
    const { product, handleChange, saveProduct, loading, isEditing, resetForm } = form;

    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- NUEVOS ESTADOS PARA FILTROS Y BÚSQUEDA ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("todos");
    const [sortBy, setSortBy] = useState("default"); // default, a-z, z-a, price-asc, price-desc, stock-asc

    const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all";
    const labelClass = "block text-xs font-bold text-gray-500 mb-1 uppercase";

    // --- LÓGICA DE FILTRADO Y ORDENAMIENTO (useMemo para eficiencia) ---
    const processedProducts = useMemo(() => {
        let result = [...table.productList];

        // 1. Filtrar por Búsqueda (Nombre o Código)
        if (searchTerm.trim() !== "") {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(lowerTerm) || 
                p.barcode?.includes(lowerTerm)
            );
        }

        // 2. Filtrar por Categoría
        if (filterCategory !== "todos") {
            result = result.filter(p => (p.category || 'otros') === filterCategory);
        }

        // 3. Ordenar
        result.sort((a, b) => {
            switch (sortBy) {
                case 'a-z': return a.name.localeCompare(b.name);
                case 'z-a': return b.name.localeCompare(a.name);
                case 'price-asc': return a.salePrice - b.salePrice;
                case 'price-desc': return b.salePrice - a.salePrice;
                case 'stock-asc': return a.stock - b.stock;
                case 'stock-desc': return b.stock - a.stock;
                default: return 0; // Orden por defecto (creación)
            }
        });

        return result;
    }, [table.productList, searchTerm, filterCategory, sortBy]);


    // --- CÁLCULOS FINANCIEROS (Usamos la lista completa original, no la filtrada, para que los totales sean reales) ---
    const physicalProducts = table.productList.filter(p => !p.isOnDemand && p.stock > 0);
    const totalInvestment = physicalProducts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const totalSaleValue = physicalProducts.reduce((acc, p) => acc + (p.salePrice * p.stock), 0);
    const potentialProfit = totalSaleValue - totalInvestment;
    const totalItems = physicalProducts.reduce((acc, p) => acc + p.stock, 0);

    const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    // --- HANDLERS ---
    const handleOpenCreate = () => { resetForm(); setIsModalOpen(true); };
    const handleEditProduct = (productToEdit: any) => { table.prepareEdit(productToEdit); setIsModalOpen(true); };
    const handleCloseModal = () => { resetForm(); setIsModalOpen(false); };
    const handleSaveAndClose = async () => { await saveProduct(); setIsModalOpen(false); };
    
    const handleOnDemandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        if (e.target.checked) {
            handleChange({ target: { name: 'stock', value: '0', type: 'number' } } as any);
            handleChange({ target: { name: 'minStock', value: '0', type: 'number' } } as any);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-1rem)] md:h-screen overflow-hidden bg-gray-100">
            
            {/* --- SECCIÓN FIJA SUPERIOR --- */}
            <div className="flex-none p-4 md:p-6 pb-2 max-w-7xl mx-auto w-full space-y-4">
                
                {/* ENCABEZADO */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <span>📦</span> Inventario General
                    </h2>
                    <button onClick={handleOpenCreate} className="bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 hover:scale-105 transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        AGREGAR PRODUCTO
                    </button>
                </div>

                {/* DASHBOARD FINANCIERO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                        <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Inversión (Costo)</p><p className="text-xl md:text-2xl font-black text-gray-800">{formatMoney(totalInvestment)}</p></div>
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">🏦</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
                        <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Valor en Venta</p><p className="text-xl md:text-2xl font-black text-green-600">{formatMoney(totalSaleValue)}</p><p className="text-[10px] text-gray-400 hidden md:block">{totalItems} productos físicos</p></div>
                        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-xl">💵</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center justify-between">
                        <div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ganancia Potencial</p><p className="text-xl md:text-2xl font-black text-purple-600">{formatMoney(potentialProfit)}</p></div>
                        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-xl">🚀</div>
                    </div>
                </div>

                {/* --- NUEVA BARRA DE HERRAMIENTAS (BUSCADOR Y FILTROS) --- */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-3 items-center">
                    
                    {/* Buscador */}
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre o código..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtros Container */}
                    <div className="flex gap-2 w-full md:w-auto">
                        {/* Selector Categoría */}
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="flex-1 md:w-40 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="todos">📂 Todas</option>
                            <option value="snacks">🍔 Snacks</option>
                            <option value="productos">🧴 Belleza</option>
                            <option value="herramientas">✂️ Herramientas</option>
                            <option value="otros">📦 Otros</option>
                        </select>

                        {/* Selector Orden */}
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 md:w-40 py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none focus:border-blue-500 cursor-pointer"
                        >
                            <option value="default">📅 Recientes</option>
                            <option value="a-z">🔤 Nombre (A-Z)</option>
                            <option value="z-a">🔤 Nombre (Z-A)</option>
                            <option value="price-asc">💲 Precio (Bajo)</option>
                            <option value="price-desc">💲 Precio (Alto)</option>
                            <option value="stock-asc">📉 Menos Stock</option>
                            <option value="stock-desc">📈 Más Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN SCROLLABLE (TABLA) --- */}
            <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 max-w-7xl mx-auto w-full">
                <ProductListView 
                    products={processedProducts} // PASAMOS LA LISTA FILTRADA
                    loading={table.loading} 
                    onDelete={table.deleteProduct} 
                    onEdit={handleEditProduct} 
                />
            </div>

            {/* --- MODAL (Sin cambios) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar relative animate-scaleIn">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-red-500 rounded-full p-2 transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                        <div className={`p-6 md:p-8 border-t-8 ${isEditing ? 'border-orange-500' : 'border-blue-600'}`}>
                            
                            <div className="mb-6 pr-8">
                                <h2 className={`text-2xl font-black flex items-center gap-2 ${isEditing ? 'text-orange-700' : 'text-gray-800'}`}>
                                    <span>{isEditing ? '✏️' : '✨'}</span> {isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Completa la información para actualizar tu inventario.</p>
                            </div>
                            
                            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className={labelClass}>¿Qué tipo de artículo es?</label>
                                <select name="category" value={product.category || 'otros'} onChange={handleChange} className={`${inputClass} font-bold text-gray-700`}>
                                    <option value="otros">📦 General / Otros</option>
                                    <option value="snacks">🍔 Snacks y Bebidas</option>
                                    <option value="productos">🧴 Productos Belleza</option>
                                    <option value="herramientas">✂️ Herramientas / Equipo</option>
                                </select>
                            </div>

                            <div className="mb-6 flex items-center gap-3 bg-purple-50 p-4 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors">
                                <input type="checkbox" id="isOnDemand" name="isOnDemand" checked={product.isOnDemand || false} onChange={handleOnDemandChange} className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 border-gray-300 cursor-pointer" />
                                <div className="cursor-pointer">
                                    <label htmlFor="isOnDemand" className="font-bold text-purple-800 text-sm cursor-pointer block">🚚 Producto "Sobre Pedido" (Dropshipping)</label>
                                    <p className="text-xs text-purple-600">No manejas stock físico. Se activará el control de pedidos pendientes.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-1"><label className={labelClass}>Código / Barcode</label><input name="barcode" value={product.barcode} onChange={handleChange} placeholder="Escanea..." className={`${inputClass} bg-yellow-50`} /></div>
                                <div className="md:col-span-2"><label className={labelClass}>Nombre del Producto</label><input name="name" value={product.name} onChange={handleChange} placeholder="Ej. Secadora Babyliss Pro" className={inputClass} /></div>
                                <div className="md:col-span-1 grid grid-cols-2 gap-2">
                                    <div><label className={labelClass}>Stock</label><input type="number" name="stock" value={product.isOnDemand ? 0 : (product.stock || '')} onChange={handleChange} placeholder="0" disabled={product.isOnDemand} className={`${inputClass} font-bold ${product.isOnDemand ? 'bg-gray-200 text-gray-400' : ''}`} /></div>
                                    <div><label className={`${labelClass} text-red-500`}>Mín. 🚨</label><input type="number" name="minStock" value={product.isOnDemand ? 0 : (product.minStock || '')} onChange={handleChange} placeholder="5" disabled={product.isOnDemand} className={`${inputClass} border-red-200 text-red-600 ${product.isOnDemand ? 'bg-gray-200 text-gray-400' : ''}`} /></div>
                                </div>
                            </div>

                            <div className="mb-4"><label className={labelClass}>Descripción (Opcional)</label><input name="description" value={product.description} onChange={handleChange} placeholder="Detalles adicionales..." className={inputClass} /></div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div><label className={labelClass}>Costo (Compra)</label><div className="relative"><span className="absolute left-3 top-2 text-gray-500 font-bold">$</span><input type="number" name="costPrice" value={product.costPrice || ''} onChange={handleChange} className={`${inputClass} pl-7`} placeholder="0.00" /></div></div>
                                <div><label className={labelClass}>Precio Mercado</label><div className="relative"><span className="absolute left-3 top-2 text-gray-500 font-bold">$</span><input type="number" name="marketPrice" value={product.marketPrice || ''} onChange={handleChange} className={`${inputClass} pl-7`} placeholder="0.00" /></div></div>
                                <div><label className={`${labelClass} text-green-700`}>Precio Venta</label><div className="relative"><span className="absolute left-3 top-2 text-green-700 font-bold">$</span><input type="number" name="salePrice" value={product.salePrice || ''} onChange={handleChange} className={`${inputClass} pl-7 border-green-300 ring-green-100 text-lg font-bold text-green-800`} placeholder="0.00" /></div></div>
                                <div><label className={`${labelClass} text-purple-700`}>Mayoreo</label><div className="relative"><span className="absolute left-3 top-2 text-purple-700 font-bold">$</span><input type="number" name="wholesalePrice" value={product.wholesalePrice || ''} onChange={handleChange} className={`${inputClass} pl-7 border-purple-300 ring-purple-100 text-purple-800`} placeholder="0.00" /></div></div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleCloseModal} className="flex-1 py-3 rounded-lg font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">CANCELAR</button>
                                <button onClick={handleSaveAndClose} disabled={loading} className={`flex-[2] py-3 rounded-lg font-bold text-white shadow-md transition-all flex justify-center items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-black hover:bg-gray-800 hover:-translate-y-1'}`}>{loading ? 'Procesando...' : (isEditing ? 'ACTUALIZAR DATOS' : 'GUARDAR PRODUCTO')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};