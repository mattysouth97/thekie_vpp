import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/vpp_agg_set_prototype_v1/",
  plugins: [vue(), vueJsx(), basicSsl()],
  optimizeDeps: {
    include: ["quill"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // data.go.kr SMP API 프록시
      "/api/data-go-kr/smp": {
        target: "https://apis.data.go.kr/B553530/smp",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/data-go-kr\/smp/, ""),
        secure: true,
      },
      // data.go.kr REC API 프록시
      "/api/data-go-kr/rec": {
        target: "https://apis.data.go.kr/B553530/rec",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/data-go-kr\/rec/, ""),
        secure: true,
      },
    },
  },
});
