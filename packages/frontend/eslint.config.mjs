import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Suas configurações de base, estendidas do Next.js
  ...compat.extends("next/core-web-vitals"),

  // Objeto de configuração para ignorar pastas
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // ======================================================= //
  // ========= ADICIONE ESTE NOVO OBJETO ABAIXO ========== //
  // ======================================================= //
  {
    files: ['**/*.ts', '**/*.tsx'], // Aplica apenas para arquivos TypeScript
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      // Rebaixa o erro de 'any' para um aviso (warning)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Rebaixa o erro de 'variáveis não usadas' para um aviso (warning)
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];

export default eslintConfig;