import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../data/storage';
import { DEMO_USERS } from '../data/mockData';
import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseErrorMessage } from '../firebase/authErrors';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  firebaseUser: FirebaseUser | null;
  registerWithEmail: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [selectedChildId, setSelectedChildIdState] = useState<string>('s_1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StorageService.init();
    const storedChild = StorageService.getSelectedChildId();
    if (storedChild) setSelectedChildIdState(storedChild);

    // Subscribe to Firebase Authentication state
    // Does NOT assume logged-in state until Firebase confirms
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Fetch user profile from Firestore users collection
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let activeUser: User;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            activeUser = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Người dùng',
              email: fbUser.email || data.email || '',
              role: (data.role as Role) || 'teacher',
              avatar: data.avatar || fbUser.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              phone: data.phone
            };
          } else {
            // First time login via Google or uninitialized profile: create document
            activeUser = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Giáo viên',
              email: fbUser.email || '',
              role: 'teacher',
              avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
            };

            await setDoc(userDocRef, {
              id: fbUser.uid,
              name: activeUser.name,
              email: activeUser.email,
              role: activeUser.role,
              avatar: activeUser.avatar,
              createdAt: new Date().toISOString()
            });
          }

          setUser(activeUser);
          StorageService.setCurrentUser(activeUser);
        } catch (e) {
          console.warn('Could not retrieve Firestore user document, using auth profile:', e);
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Người dùng SMART CLASS',
            email: fbUser.email || '',
            role: 'teacher',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
          };
          setUser(fallbackUser);
          StorageService.setCurrentUser(fallbackUser);
        }
      } else {
        // Firebase confirmed user is NOT authenticated
        // Check if explicitly using local Demo Mode preview
        const isDemo = sessionStorage.getItem('smartclass_is_demo_mode') === 'true';
        if (isDemo) {
          const current = StorageService.getCurrentUser();
          setUser(current);
        } else {
          // Clear user session to avoid false logged-in states
          setUser(null);
          localStorage.removeItem('smartclass_current_user');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * 1. Register with Email and Password directly on Firebase Authentication
   */
  const registerWithEmail = async (
    name: string,
    email: string,
    password: string,
    role: Role
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create user in Firebase Authentication
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;

      // Update Firebase Auth display name
      if (name.trim()) {
        try {
          await updateProfile(fbUser, { displayName: name.trim() });
        } catch (e) {
          console.warn('Could not update Auth displayName:', e);
        }
      }

      const defaultAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

      // Persist profile into Cloud Firestore
      const newUserProfile: User = {
        id: fbUser.uid,
        name: name.trim(),
        email: fbUser.email || email.trim(),
        role: role,
        avatar: defaultAvatar
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          id: fbUser.uid,
          name: newUserProfile.name,
          email: newUserProfile.email,
          role: newUserProfile.role,
          avatar: newUserProfile.avatar,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Could not save user profile to Firestore:', err);
      }

      // Exit demo mode if active
      sessionStorage.removeItem('smartclass_is_demo_mode');
      setUser(newUserProfile);
      StorageService.setCurrentUser(newUserProfile);

      return { success: true };
    } catch (err: any) {
      console.error('Firebase registration error:', err);
      const friendlyMsg = getFirebaseErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  /**
   * 2. Login with Email and Password directly on Firebase Authentication
   */
  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;

      // Exit demo mode
      sessionStorage.removeItem('smartclass_is_demo_mode');

      // Fetch user profile from Firestore
      let userRole: Role = 'teacher';
      let userName = fbUser.displayName || 'Người dùng';
      let userAvatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.role) userRole = d.role;
          if (d.name) userName = d.name;
          if (d.avatar) userAvatar = d.avatar;
        } else {
          // If Firestore profile doesn't exist yet, save it
          await setDoc(doc(db, 'users', fbUser.uid), {
            id: fbUser.uid,
            name: userName,
            email: fbUser.email,
            role: userRole,
            avatar: userAvatar,
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('Could not read Firestore profile on login:', e);
      }

      const activeUser: User = {
        id: fbUser.uid,
        name: userName,
        email: fbUser.email || email.trim(),
        role: userRole,
        avatar: userAvatar
      };

      setUser(activeUser);
      StorageService.setCurrentUser(activeUser);

      return { success: true };
    } catch (err: any) {
      console.error('Firebase login error:', err);
      const friendlyMsg = getFirebaseErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  /**
   * 3. Login with Google Popup (Firebase Auth)
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      sessionStorage.removeItem('smartclass_is_demo_mode');

      // Sync user profile to Firestore
      let userRole: Role = 'teacher';
      let userName = fbUser.displayName || 'Giáo viên';
      let userAvatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.role) userRole = d.role;
          if (d.name) userName = d.name;
          if (d.avatar) userAvatar = d.avatar;
        } else {
          await setDoc(doc(db, 'users', fbUser.uid), {
            id: fbUser.uid,
            name: userName,
            email: fbUser.email,
            role: userRole,
            avatar: userAvatar,
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('Could not sync Google user to Firestore:', e);
      }

      const activeUser: User = {
        id: fbUser.uid,
        name: userName,
        email: fbUser.email || '',
        role: userRole,
        avatar: userAvatar
      };

      setUser(activeUser);
      StorageService.setCurrentUser(activeUser);

      return { success: true };
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err);
      const friendlyMsg = getFirebaseErrorMessage(err);
      return { success: false, error: friendlyMsg };
    }
  };

  // General login adapter
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (password) {
      return loginWithEmail(email, password);
    }
    // Fallback if password was empty
    return { success: false, error: 'Vui lòng nhập mật khẩu tài khoản.' };
  };

  /**
   * 4. Sign Out
   */
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    sessionStorage.removeItem('smartclass_is_demo_mode');
    localStorage.removeItem('smartclass_current_user');
    setUser(null);
    setFirebaseUser(null);
  };

  /**
   * Quick Demo Role Switch (Kept for instant review without breaking demo presets)
   */
  const switchRole = (newRole: Role) => {
    sessionStorage.setItem('smartclass_is_demo_mode', 'true');
    const target = DEMO_USERS.find(u => u.role === newRole) || DEMO_USERS[0];
    setUser(target);
    StorageService.setCurrentUser(target);
  };

  const setSelectedChildId = (id: string) => {
    setSelectedChildIdState(id);
    StorageService.setSelectedChildId(id);
  };

  const resetDemoData = () => {
    StorageService.resetToDemo();
    const current = StorageService.getCurrentUser();
    setUser(current);
    setSelectedChildIdState('s_1');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Đang kết nối Firebase Authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        firebaseUser,
        registerWithEmail,
        loginWithEmail,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        selectedChildId,
        setSelectedChildId,
        resetDemoData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
