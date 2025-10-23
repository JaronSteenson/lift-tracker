import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

require('./ci/version-service-worker');

export default defineConfig({
    plugins: [vue()],
    root: 'resources',
    publicDir: '../public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'resources/index.html'),
        },
    },
    server: {
        port: 3000,
        host: 'localhost',
        strictPort: true,
    },
    define: {
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(true),
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
        },
        extensions: ['.js', '.vue', '.json'],
    },
});
