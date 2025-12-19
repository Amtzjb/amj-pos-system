// src/components/Sidebar.tsx
// src/components/Sidebar.tsx
import type { User } from "firebase/auth";

interface Props {
    // Agregamos 'admin'
    currentView: 'pos' | 'inventory' | 'credits' | 'sales' | 'cut' | 'cut_history' | 'admin';
    onNavigate: (view: 'pos' | 'inventory' | 'credits' | 'sales' | 'cut' | 'cut_history' | 'admin') => void;
    onLogout: () => void;
    user: User | null;
}

export const Sidebar = ({ currentView, onNavigate, onLogout, user }: Props) => {
    
    const MenuBtn = ({ view, icon, label }: { view: any, icon: any, label: string }) => (
        <button 
            onClick={() => onNavigate(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold mb-2
                ${currentView === view 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
                    : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'}
            `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="w-64 bg-gray-100 h-screen flex flex-col p-4 border-r border-gray-200 shrink-0">
            {/* LOGO */}
            <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72m-13.5 8.65h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">AMJ POS</h1>
                </div>
            </div>

            {/* MENU ITEMS */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                
                {/* --- SECCIÓN ADMIN --- */}
                <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-4">Gerencia</p>
                <MenuBtn view="admin" label="Panel de Control" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>} />

                <div className="my-4 border-t border-gray-200 w-full"></div>
                <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-4">Operación</p>
                
                <MenuBtn view="pos" label="Punto de Venta" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>} />
                <MenuBtn view="inventory" label="Inventario" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>} />
                <MenuBtn view="credits" label="Cuentas por Cobrar" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>} />

                <div className="my-4 border-t border-gray-200 w-full"></div>
                <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-4">Administración</p>

                <MenuBtn view="sales" label="Historial Ventas" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>} />
                <MenuBtn view="cut_history" label="Bitácora Cortes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>} />

                <div className="my-2"></div>
                <button 
                    onClick={() => onNavigate('cut')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold mb-2
                        ${currentView === 'cut' ? 'bg-black text-white shadow-lg' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'}
                    `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25l1.214 1.942a2.25 2.25 0 001.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 011.872 1.002l.164.246a2.25 2.25 0 001.872 1.002h2.092a2.25 2.25 0 001.872-1.002l.164-.246A2.25 2.25 0 0116.954 9h4.636M2.41 9a2.25 2.25 0 00-.16.832V12a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.832c0-.287-.055-.57-.16-.832M9 6h6" /></svg>
                    <span>Cerrar Caja</span>
                </button>
            </div>

            {/* FOOTER USER */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mt-auto">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-800 truncate">{user?.displayName || "Usuario"}</p>
                        <p className="text-[10px] text-green-600 font-bold">● En línea</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cerrar Sesión</button>
            </div>
        </div>
    );
};