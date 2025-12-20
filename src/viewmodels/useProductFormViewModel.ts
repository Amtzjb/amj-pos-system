// src/viewmodels/useProductFormViewModel.ts
import { useState, useEffect } from 'react';
import { ProductService } from '../services/ProductService';
import type { Product } from '../models/Product';

export const useProductFormViewModel = () => {
    // 1. Estado inicial del producto
    const initialProductState: Product = {
        name: '',
        description: '',
        barcode: '',
        category: 'otros',
        isOnDemand: false, // <--- NUEVO: Inicializamos el checkbox en falso
        costPrice: 0,
        marketPrice: 0,
        salePrice: 0,
        wholesalePrice: 0,
        stock: 0
    };

    const [product, setProduct] = useState<Product>(initialProductState);
    const [productList, setProductList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Estado para saber si estamos editando
    const [isEditing, setIsEditing] = useState(false); 

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const data = await ProductService.getProducts();
        setProductList(data);
        setLoading(false);
    };

    // --- MODIFICACIÓN IMPORTANTE PARA CHECKBOX ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Si es un checkbox, leemos 'checked', si no, leemos 'value'
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setProduct(prev => ({
            ...prev,
            // Si es número lo convertimos, si no, pasa directo (o pasa el booleano del checkbox)
            [name]: type === 'number' ? parseFloat(value) || 0 : finalValue
        }));
    };

    // Función para limpiar y cancelar
    const resetForm = () => {
        setProduct(initialProductState);
        setIsEditing(false);
    };

    const saveProduct = async () => {
        if (!product.name || product.salePrice <= 0) {
            alert("Por favor completa el nombre y el precio de venta.");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && product.id) {
                // ACTUALIZAR
                await ProductService.updateProduct(product.id, product);
                alert("Producto actualizado correctamente");
            } else {
                // CREAR NUEVO
                await ProductService.addProduct(product);
                alert("Producto guardado correctamente");
            }
            
            resetForm(); // Limpiamos
            fetchProducts(); // Recargamos lista
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este producto?")) return;
        setLoading(true);
        await ProductService.deleteProduct(id);
        fetchProducts();
        setLoading(false);
    };

    // --- AQUÍ ESTÁ EL TRUCO DEL SCROLL (Mantenido) ---
    const prepareEdit = (productToEdit: Product) => {
        setProduct(productToEdit);
        setIsEditing(true); 
        
        // 1. Intenta scrollear la ventana normal
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 2. IMPORTANTE: Intenta scrollear el contenedor principal (<main>)
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        form: {
            product,
            handleChange,
            saveProduct,
            loading,
            isEditing,
            resetForm 
        },
        table: {
            productList,
            loading,
            deleteProduct,
            prepareEdit 
        }
    };
};