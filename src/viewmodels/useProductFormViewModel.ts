// src/viewmodels/useProductFormViewModel.ts
import { useState, useEffect } from 'react';
import type { Product } from '../models/Product';
import { ProductService } from '../services/ProductService';

export const useProductFormViewModel = () => {
    // Estado inicial limpio
    const initialProductState: Product = {
        name: '', description: '', barcode: '',
        costPrice: 0, marketPrice: 0, salePrice: 0, wholesalePrice: 0, stock: 0
    };

    const [product, setProduct] = useState<Product>(initialProductState);
    const [loadingForm, setLoadingForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Para saber si estamos editando

    // Tabla
    const [productList, setProductList] = useState<Product[]>([]);
    const [loadingTable, setLoadingTable] = useState(true);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoadingTable(true);
        try {
            const data = await ProductService.getProducts();
            setProductList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue = e.target.type === 'number' ? (parseFloat(value) || 0) : value;
        setProduct(prev => ({ ...prev, [name]: finalValue }));
    };

    // --- LÓGICA DE GUARDAR / ACTUALIZAR ---
    const saveProduct = async () => {
        if (!product.name || product.salePrice <= 0) {
            alert("Nombre y Precio Venta son obligatorios");
            return;
        }

        setLoadingForm(true);
        try {
            if (isEditing && product.id) {
                // MODO ACTUALIZAR
                await ProductService.updateProduct(product.id, product);
                alert('✅ Producto Actualizado');
            } else {
                // MODO CREAR NUEVO
await ProductService.addProduct(product);                alert('✅ Producto Creado');
            }
            
            resetForm();
            fetchProducts(); // Recargar la tabla
        } catch (error: any) {
            alert('❌ Error: ' + error.message);
        } finally {
            setLoadingForm(false);
        }
    };

    // --- ACCIONES DE TABLA ---
    const deleteProduct = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este producto? No se puede deshacer.")) return;
        try {
            await ProductService.deleteProduct(id);
            setProductList(prev => prev.filter(p => p.id !== id)); // Lo quitamos de la lista visualmente
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const prepareEdit = (productToEdit: Product) => {
        setProduct(productToEdit); // Subimos los datos al formulario
        setIsEditing(true); // Activamos modo edición
        // Hacemos scroll hacia arriba suavemente para que vea el form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setProduct(initialProductState);
        setIsEditing(false);
    };

    return {
        form: { 
            product, 
            handleChange, 
            saveProduct, 
            loading: loadingForm, 
            isEditing,     // Exportamos esto para cambiar el texto del botón
            resetForm      // Exportamos esto para el botón "Cancelar"
        },
        table: { 
            productList, 
            loading: loadingTable, 
            deleteProduct, 
            prepareEdit    // Exportamos la función de editar
        }
    };
};