// src/viewmodels/usePOSViewModel.ts
import { useState, useEffect } from 'react';
import type { Product } from '../models/Product';
import { ProductService } from '../services/ProductService';
import { CreditService } from '../services/CreditService';
import { SaleService, type Sale } from '../services/SaleService';
import { auth } from '../firebase/config';

export interface CartItem extends Product {
    quantity: number;
}

export interface CustomerInfo {
    name: string;
    phone: string;
    address: string;
    notes: string;
}

export const usePOSViewModel = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Estados de Pago
    const [amountReceived, setAmountReceived] = useState<string>(""); 
    const [paymentType, setPaymentType] = useState<string>("contado"); 
    
    // Estado del Cliente (Créditos)
    const [customer, setCustomer] = useState<CustomerInfo>({
        name: '', phone: '', address: '', notes: ''
    });

    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [showTicket, setShowTicket] = useState(false);

    useEffect(() => { loadProducts(); }, []);

    const loadProducts = async () => {
        // setLoading(true); // Comentamos esto para que no parpadee feo al recargar después de vender
        const data = await ProductService.getProducts();
        setProducts(data);
        setLoading(false);
    };

    const addToCart = (product: Product) => {
        if (product.stock <= 0) { alert("¡Sin stock!"); return; }
        
        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            // Validamos que no agregue más de lo que hay en stock en tiempo real
            if (exists) {
                if (exists.quantity >= product.stock) {
                    alert("No hay más unidades disponibles");
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else { 
                return [...prev, { ...product, quantity: 1 }]; 
            }
        });
    };

    const decreaseQuantity = (id: string) => {
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const receivedValue = parseFloat(amountReceived) || 0;
    const change = receivedValue - total;

    const calculateInstallment = () => {
        if (paymentType === '2-pagos') return total / 2;
        if (paymentType === '3-pagos') return total / 3;
        return 0;
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const closeTicket = () => {
        setShowTicket(false);
        setLastSale(null);
    };

    // --- FUNCIÓN PRINCIPAL DE VENTA ---
    const confirmSale = async () => {
        if (cart.length === 0) return;

        const sellerName = auth.currentUser?.displayName || auth.currentUser?.email || "Desconocido";

        const saleItems = cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.salePrice,
            cost: item.costPrice || 0
        }));

        const date = new Date().toISOString();

        // Objeto Base
        let newSale: Sale = {
            date: date,
            total: total,
            method: 'cash',
            items: saleItems,
            customerName: "Cliente Mostrador",
            sellerName: sellerName
        };

        try {
            // A) VENTA A CRÉDITO
            if (paymentType.includes('pagos')) {
                if (!customer.name || !customer.phone) {
                    alert("⚠️ Nombre y Teléfono obligatorios para crédito.");
                    return;
                }
                const installments = paymentType === '2-pagos' ? 2 : 3;
                const payPerInstallment = total / installments;
                
                newSale.method = 'credit';
                newSale.customerName = customer.name;
                newSale.installmentCount = installments;
                newSale.installmentAmount = payPerInstallment;

                await CreditService.createCreditSale({
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerAddress: customer.address,
                    customerNotes: customer.notes,
                    items: cart,
                    totalDebt: total,
                    remainingDebt: total,
                    installmentCount: installments,
                    payments: [],
                    status: 'active',
                    date: date
                });

                await SaleService.createSale(newSale);

            } else {
                // B) VENTA NORMAL
                const method = paymentType === 'tarjeta' ? 'card' : 'cash';
                newSale.method = method;

                if (method === 'cash') {
                    newSale.receivedAmount = receivedValue;
                    newSale.change = change;
                }
                
                await SaleService.createSale(newSale);
            }

            // --- AQUÍ ESTÁ LA MAGIA DEL DESCUENTO DE STOCK ---
            // Recorremos cada producto vendido y restamos su cantidad en Firebase
            for (const item of cart) {
                if (item.id) {
                    await ProductService.updateStock(item.id, item.quantity);
                }
            }

            // --- ACTUALIZAMOS LA VISTA ---
            // Volvemos a cargar los productos para que veas el stock actualizado
            await loadProducts();

            // Mostramos Ticket
            setLastSale(newSale); 
            setShowTicket(true);

            // Limpieza
            setCart([]);
            setAmountReceived("");
            setCustomer({ name: '', phone: '', address: '', notes: '' });
            setPaymentType("contado");

        } catch (error) {
            console.error(error);
            alert("❌ Error: " + error);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.barcode?.includes(searchQuery)
    );

    return {
        products: filteredProducts,
        cart, addToCart, decreaseQuantity, removeFromCart,
        searchQuery, setSearchQuery, total, loading,
        amountReceived, setAmountReceived, change,
        paymentType, setPaymentType,
        customer, handleCustomerChange,
        installmentAmount: calculateInstallment(),
        confirmSale,
        showTicket, lastSale, closeTicket 
    };
};