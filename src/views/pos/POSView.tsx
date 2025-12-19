// src/views/pos/POSView.tsx
import { useState } from 'react'; // <--- Asegúrate de importar useState
import { usePOSViewModel } from '../../viewmodels/usePOSViewModel';
import { TicketModal } from '../../components/TicketModal';
import { ExpenseModal } from '../../components/ExpenseModal'; // <--- IMPORTAR

export const POSView = () => {
    // ... (todo lo que ya tenías del viewModel) ...
    const { 
        products, cart, addToCart, decreaseQuantity, removeFromCart,
        searchQuery, setSearchQuery, total, loading,
        amountReceived, setAmountReceived, change,
        paymentType, setPaymentType,
        customer, handleCustomerChange,
        installmentAmount, confirmSale,
        showTicket, lastSale, closeTicket 
    } = usePOSViewModel();

    // --- ESTADO PARA EL MODAL DE GASTOS ---
    const [showExpense, setShowExpense] = useState(false); // <--- NUEVO

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="flex h-full flex-col md:flex-row bg-gray-100 overflow-hidden relative">
            
            {/* MODALES */}
            {showTicket && <TicketModal sale={lastSale} onClose={closeTicket} />}
            {showExpense && <ExpenseModal onClose={() => setShowExpense(false)} />} {/* <--- NUEVO */}

            {/* SECCIÓN IZQUIERDA: PRODUCTOS */}
            <div className="flex-1 flex flex-col h-full p-4 overflow-hidden">
                <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex gap-4">
                    {/* BUSCADOR */}
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* --- BOTÓN DE GASTOS (NUEVO) --- */}
                    <button 
                        onClick={() => setShowExpense(true)}
                        className="bg-red-50 text-red-600 px-6 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition-colors flex flex-col items-center justify-center text-xs"
                    >
                        <span className="text-xl">💸</span>
                        <span>Gastos</span>
                    </button>
                </div>

                {/* ... (El resto del grid de productos sigue igual) ... */}
                <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                     {/* ... tu código de productos ... */}
                     {loading ? (
                        <div className="text-center p-10 text-gray-500">Cargando inventario...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(product => (
                                <div 
                                    key={product.id} 
                                    onClick={() => addToCart(product)}
                                    className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-md active:scale-95 group relative overflow-hidden ${product.stock <= 0 ? 'opacity-60 grayscale' : ''}`}
                                >
                                    {product.stock <= 0 && <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center font-bold text-gray-500 rotate-[-12deg] border-2 border-gray-300 z-10">AGOTADO</div>}
                                    <div className="h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">📦</div>
                                    <h3 className="font-bold text-gray-800 leading-tight mb-1 truncate">{product.name}</h3>
                                    <div className="flex justify-between items-end">
                                        <p className="text-blue-600 font-black text-lg">{formatCurrency(product.salePrice)}</p>
                                        <p className={`text-xs font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-400'}`}>Stock: {product.stock}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ... (La sección derecha del carrito sigue igual) ... */}
            <div className="w-full md:w-[400px] bg-white border-l border-gray-200 h-full flex flex-col shadow-xl z-20">
                {/* ... Copia aquí todo lo que ya tenías en tu POSView para el carrito ... */}
                {/* Header Carrito */}
                <div className="p-5 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-2"><span>🛒</span> Ticket de Venta</h2>
                    <p className="text-xs text-gray-400 font-bold">{cart.reduce((acc, item) => acc + item.quantity, 0)} artículos</p>
                </div>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 opacity-50">
                            <p className="font-bold">Carrito vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center group bg-white border border-transparent hover:border-gray-100 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <button onClick={() => addToCart(item)} className="w-6 h-6 rounded bg-gray-100 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold transition-colors">+</button>
                                        <span className="font-black text-gray-800 w-6 text-center text-sm">{item.quantity}</span>
                                        <button onClick={() => decreaseQuantity(item.id!)} className="w-6 h-6 rounded bg-gray-100 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold transition-colors">-</button>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 w-28" title={item.name}>{item.name}</p>
                                        <p className="text-xs text-gray-400">{formatCurrency(item.salePrice)} c/u</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="font-bold text-gray-800">{formatCurrency(item.salePrice * item.quantity)}</p>
                                    <button onClick={() => removeFromCart(item.id!)} className="text-[10px] text-red-400 hover:text-red-600 font-bold mt-1">Eliminar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Zona de Pago */}
                <div className="border-t border-gray-200 p-5 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-400 font-bold uppercase text-sm">Total a Pagar</span>
                        <span className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(total)}</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {/* Botones de Tipo de Pago */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {['contado', 'tarjeta', '2-pagos', '3-pagos'].map((type) => (
                                <button 
                                    key={type} 
                                    onClick={() => setPaymentType(type)} 
                                    className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold rounded-md capitalize transition-all ${paymentType === type ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {type.replace('-', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Input Contado */}
                        {paymentType === 'contado' && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        placeholder="Recibido..." 
                                        className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-lg outline-none focus:border-blue-500" 
                                        value={amountReceived} 
                                        onChange={(e) => setAmountReceived(e.target.value)} 
                                    />
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-lg border transition-all ${change < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                    <span className={`text-xs font-bold uppercase ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>{change < 0 ? 'Falta Dinero:' : 'Su Cambio:'}</span>
                                    <span className={`text-xl font-black ${change < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(change))}</span>
                                </div>
                            </div>
                        )}

                        {/* Formulario Crédito */}
                        {paymentType.includes('pagos') && (
                            <div className="space-y-2 animate-fadeIn bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <p className="text-xs font-bold text-orange-800 uppercase mb-2">Datos del Cliente (Crédito)</p>
                                <input name="name" placeholder="Nombre completo" className="w-full p-2 text-xs border border-orange-200 rounded mb-1 outline-none focus:border-orange-500" value={customer.name} onChange={handleCustomerChange} />
                                <input name="phone" placeholder="Teléfono" className="w-full p-2 text-xs border border-orange-200 rounded mb-1 outline-none focus:border-orange-500" value={customer.phone} onChange={handleCustomerChange} />
                                <input name="address" placeholder="Dirección" className="w-full p-2 text-xs border border-orange-200 rounded outline-none focus:border-orange-500" value={customer.address} onChange={handleCustomerChange} />
                                <div className="mt-2 text-right border-t border-orange-200 pt-1"><p className="text-xs text-orange-600 font-bold">Pago Quincenal: {formatCurrency(installmentAmount)}</p></div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={confirmSale}
                        disabled={cart.length === 0 || (paymentType === 'contado' && change < 0)}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 
                            ${cart.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
                              (paymentType === 'contado' && change < 0) ? 'bg-red-100 text-red-400 cursor-not-allowed' : 
                              'bg-black text-white hover:bg-gray-800 hover:shadow-xl'}
                        `}
                    >
                        <span>COBRAR E IMPRIMIR</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};