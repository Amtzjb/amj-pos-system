// src/App.tsx
import { useState, useEffect } from 'react';
import { AuthService } from './services/AuthService';
import { auth } from './firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { AddProductView } from './views/products/AddProductView';
import { POSView } from './views/pos/POSView';
import { CreditsView } from './views/credits/CreditsView';
import { SalesHistoryView } from './views/sales/SalesHistoryView';
import { CashCutView } from './views/cash/CashCutView';
import { CashCutHistoryView } from './views/cash/CashCutHistoryView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { Sidebar } from './components/Sidebar';

function App() {
  const [user, setUser] = useState<User | null>(null);
  
  const [currentView, setCurrentView] = useState<'pos' | 'inventory' | 'credits' | 'sales' | 'cut' | 'cut_history' | 'admin'>('pos');
  
  // Login States
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  
  // NUEVO: Estado para la clave de seguridad del gerente
  const [adminKey, setAdminKey] = useState(""); 

  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try { await AuthService.login(email, pass); } catch (e: any) { setError("Error: Credenciales inválidas"); }
  };

  const handleRegister = async () => {
    // --- VALIDACIÓN DE SEGURIDAD ---
    // Cambia "12345" por la contraseña que tú quieras usar
    if (adminKey !== "12345") {
        return setError("¡Clave de Gerente incorrecta! No tienes permiso para crear usuarios.");
    }

    if (!name) return setError("Por favor ingresa un nombre.");
    
    try { 
        await AuthService.register(email, pass, name); 
        window.location.reload();
    } catch (e: any) { setError(e.message); }
  };

  const handleLogout = () => AuthService.logout();

  // --- ESTRUCTURA PRINCIPAL (Usuario Logueado) ---
  if (user) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
          <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} user={user} />
          <main className="flex-1 h-screen overflow-y-auto bg-gray-50 relative">
              {currentView === 'pos' && <POSView />}
              {currentView === 'inventory' && <AddProductView />}
              {currentView === 'credits' && <CreditsView />}
              {currentView === 'sales' && <SalesHistoryView />}
              {currentView === 'cut' && <CashCutView />}
              {currentView === 'cut_history' && <CashCutHistoryView />}
              {currentView === 'admin' && <AdminDashboardView />}
          </main>
      </div>
    );
  }

  // --- PANTALLA DE LOGIN / REGISTRO ---
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 border border-gray-100">
        <div className="flex justify-center mb-6">
           <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-center text-gray-800 tracking-tight">AMJ POS System</h1>
        <p className="text-center text-xs text-gray-400 font-bold uppercase mb-8">{isRegistering ? 'Nuevo Usuario' : 'Iniciar Sesión'}</p>
        
        <div className="space-y-4">
            {isRegistering && (
                <div className="animate-fadeIn space-y-4">
                    {/* INPUT DE CLAVE DE GERENTE (NUEVO) */}
                    <div>
                        <label className="text-xs font-bold text-red-500 uppercase ml-1">Clave de Gerente (Seguridad)</label>
                        <input 
                            type="password" 
                            placeholder="Clave maestra..." 
                            className="w-full p-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none bg-red-50 placeholder-red-200 text-red-900" 
                            onChange={(e) => setAdminKey(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre (Quién usará esta cuenta)</label>
                        <input type="text" placeholder="Ej. Vendedora Turno 1" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
            )}
            
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo</label>
                <input type="email" placeholder="usuario@tienda.com" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
                <input type="password" placeholder="••••••" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" onChange={(e) => setPass(e.target.value)} />
            </div>
        </div>

        {error && <p className="text-red-500 text-xs font-bold mt-4 bg-red-50 p-2 rounded text-center border border-red-100">{error}</p>}

        {isRegistering ? (
            <button onClick={handleRegister} className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:bg-gray-800 font-bold shadow-lg transition-all">Registrar Usuario (Admin)</button>
        ) : (
            <button onClick={handleLogin} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all">Ingresar</button>
        )}
        
        <button onClick={() => { setIsRegistering(!isRegistering); setError(""); setAdminKey(""); }} className="w-full mt-4 text-gray-400 text-xs hover:text-blue-600 font-bold underline">
            {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Registrar nuevo empleado/usuario?'}
        </button>
      </div>
    </div>
  );
}

export default App;