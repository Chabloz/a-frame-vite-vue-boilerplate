import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import vue from "@vitejs/plugin-vue";

const fullReloadPlugin = {
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
};

export default defineConfig(({ command, mode }) => {
  const config = {
    // base: "/aframe-vue-boilerplate/",
    base: "/test/",
    plugins: [
      basicSsl(),
      vue({
        template: {
          compilerOptions: {
            // Allow A-Frame elements to be in Vue template
            isCustomElement: (tag) => tag.startsWith("a-"),
          },
        },
      }),
      fullReloadPlugin,
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  };

  return config;
});
