import path from 'path';

import { defineConfig } from "vite";


export default defineConfig({
  base: '/jsx-exploration/',
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/components'),
      '@vanillajs': path.resolve(__dirname, './src/vanillajs'),
      '@pui-jsx': path.resolve(__dirname, './src/pui-jsx'),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxFactory: 'jsx',
    jsxImportSource: '@pui-jsx',
    // jsxImportSource: '@vanillajs',
  }
});
