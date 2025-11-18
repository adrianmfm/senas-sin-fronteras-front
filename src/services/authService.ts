/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthResult, UserProfile } from '@/types/auth';

const googleProvider = new GoogleAuthProvider();

export class AuthService {
  
  /**
   * Login con email y contraseña
   */
  static async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Actualizar último login en Firestore
      await AuthService.updateLastLogin(result.user.uid);
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: AuthService.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Registro con email y contraseña
   */
  static async registerWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil del usuario en Firestore
      await AuthService.createUserProfile(result.user);
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: AuthService.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Login con Google
   */
  static async loginWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Verificar si es primera vez del usuario
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await AuthService.createUserProfile(result.user);
      } else {
        await AuthService.updateLastLogin(result.user.uid);
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      return { 
        success: false, 
        error: AuthService.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<AuthResult> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Error en logout:', error);
      return { 
        success: false, 
        error: 'Error al cerrar sesión' 
      };
    }
  }

  /**
   * Enviar email de reseteo de contraseña
   */
  static async sendPasswordReset(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Error enviando reset:', error);
      return { 
        success: false, 
        error: AuthService.getErrorMessage(error.code) 
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateUserProfile(displayName?: string, photoURL?: string): Promise<AuthResult> {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No hay usuario autenticado' };
      }

      await updateProfile(auth.currentUser, { displayName, photoURL });
      
      // Actualizar en Firestore también
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        photoURL,
        updatedAt: new Date()
      });

      return { success: true, user: auth.currentUser };
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        error: 'Error al actualizar perfil' 
      };
    }
  }

  /**
   * Escuchar cambios de autenticación
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Obtener usuario actual
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Obtener perfil completo del usuario desde Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Crear perfil del usuario en Firestore
   */
  private static async createUserProfile(user: User): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
  }

  /**
   * Actualizar último login
   */
  private static async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando último login:', error);
    }
  }

  /**
   * Convertir códigos de error de Firebase a mensajes amigables
   */
  private static getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuario deshabilitado',
      'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
      'auth/network-request-failed': 'Error de conexión',
      'auth/popup-closed-by-user': 'Login cancelado por el usuario',
      'auth/cancelled-popup-request': 'Login cancelado',
    };

    return errorMessages[errorCode] || 'Error desconocido';
  }
}

export { auth };