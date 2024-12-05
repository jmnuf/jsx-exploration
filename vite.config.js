import path from 'path';

import { defineConfig } from "vite";


export default defineConfig({
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/app'),
            '@components': path.resolve(__dirname, './src/components'),
            '@vanillajs': path.resolve(__dirname, './src/vanillajs'),
        },
    },
    esbuild: {
        jsx: 'automatic',
        jsxFactory: 'jsx',
        jsxImportSource: '@vanillajs',
    }
});
