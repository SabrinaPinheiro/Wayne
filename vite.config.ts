import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Garantir que os arquivos de configuração sejam copiados
    copyPublicDir: true,
  },
  // Configuração para SPA - redireciona todas as rotas para index.html
  preview: {
    port: 8080,
    host: "::",
  },
  // Configuração adicional para garantir SPA routing
  appType: 'spa',
}));
