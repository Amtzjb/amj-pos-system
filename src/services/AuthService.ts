// src/services/AuthService.ts
import { auth } from "../firebase/config";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile // <--- Importante para guardar el nombre
} from "firebase/auth";

export const AuthService = {
    login: (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    },

    // AHORA RECIBIMOS EL NOMBRE TAMBIÉN
    register: async (email: string, pass: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        
        // Guardamos el nombre en el perfil del usuario de Firebase
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: name
            });
        }
        
        return userCredential;
    },

    logout: () => {
        return signOut(auth);
    }
};