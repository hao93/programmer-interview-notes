import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  build: {
    // 沙箱禁止文件删除（safe-delete 钩子拦截 rm/unlink），
    // 故关闭 emptyOutDir，避免 build 清空 dist 时触发删除拦截导致构建失败。
    emptyOutDir: false,
  },
  plugins: [
    react(),
    // 仅在 build 时内联为单文件 HTML，便于整站加密后静态托管到 GitHub Pages
    ...(command === 'build' ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
