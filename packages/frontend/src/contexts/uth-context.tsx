// src/contexts/auth-context.tsx
'use client'; // Este componente precisa rodar no cliente

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../lib/api';
import { jwtDecode } from 'jwt-decode';

// 1. Tipagem para os dados do nosso usuário e do contexto
interface User {
  id: string;
  email: string;
  name: string;
  selected_theme: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 2. Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. O Componente "Provedor" que vai gerenciar toda a lógica
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Efeito que roda quando o app carrega para verificar se já existe um token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken: { sub: string; email: string; roles: string[] } = jwtDecode(token);
          const userData = await me(token);
          setUser({ 
            id: userData.id, 
            email: userData.email, 
            name: userData.name, 
            selected_theme: userData.selected_theme,
            roles: decodedToken.roles 
          });
        } catch (error) {
          console.error('Erro ao decodificar o token:', error);
          // Se o token for inválido, limpa tudo
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const token = response.access_token;
      localStorage.setItem('authToken', token);

      const decodedToken: { sub: string; email: string; roles: string[] } = jwtDecode(token);
      const userData = await me(token);
      setUser({ 
        id: userData.id, 
        email: userData.email, 
        name: userData.name, 
        selected_theme: userData.selected_theme,
        roles: decodedToken.roles 
      });

      router.push('/'); // Redireciona para a página principal após o login
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('E-mail ou senha inválidos.');
      }
      throw new Error('Ocorreu um erro ao tentar fazer login.');
    }
  };

  const me = async (token: string) => {
    try {
      const response = await api('/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw new Error('Token inválido.');
      }
      throw new Error('Ocorreu um erro ao tentar fazer login.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    router.push('/login'); // Redireciona para a página de login
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}