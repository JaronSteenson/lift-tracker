import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            globals: true,
            pool: 'vmThreads', // fixes css import issue, does break .only
            setupFiles: ['./resources/js/test/setup.js'],
        },
    }),
);
