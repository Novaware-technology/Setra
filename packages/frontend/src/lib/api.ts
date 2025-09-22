// src/lib/api.ts

// Classe customizada para tratar erros da API de forma mais clara
export class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  /**
   * Uma função wrapper para o fetch que centraliza a lógica de chamada à nossa API.
   * - Adiciona o base URL da API automaticamente.
   * - Adiciona o token de autenticação em todas as requisições.
   * - Padroniza o tratamento de respostas e erros.
   */
  export async function api(endpoint: string, options: RequestInit = {}) {
    // Pega o token do localStorage (onde o salvaremos após o login)
    const token = localStorage.getItem('authToken');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
  
    // Se o token existir, adiciona ao cabeçalho de autorização
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
  
      // Se a resposta não for OK (status 2xx), trata como um erro
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Tenta pegar o corpo do erro
        const errorMessage = errorData.message || `Erro ${response.status}`;
        throw new ApiError(errorMessage, response.status);
      }
      
      // Para respostas sem conteúdo, como DELETE (status 204)
      if (response.status === 204) {
        return;
      }

      // Verifica se há conteúdo na resposta antes de tentar fazer parse do JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }

      // Verifica se há conteúdo no corpo da resposta
      const text = await response.text();
      if (!text || text.trim() === '') {
        return;
      }

      // Tenta fazer parse do JSON
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('Erro ao fazer parse do JSON:', parseError);
        return;
      }
    } catch (error) {
      // Re-lança o erro para que possa ser tratado por quem chamou a função
      console.error('Erro na chamada da API:', error);
      throw error;
    }
  }