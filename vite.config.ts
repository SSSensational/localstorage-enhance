/// <reference types="vitest" />
import ts2 from 'rollup-plugin-typescript2';
import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        environment: 'happy-dom'
    },
    plugins: [
        {
            ...ts2({
                check: true,
                tsconfig: './tsconfig.json',
                tsconfigOverride: {
                    compilerOptions: {
                        sourceMap: false,
                        declaration: true,
                        declarationMap: false,
                    },
                },
            }),
            enforce: 'pre',
        },
    ],
    build: {
        target: 'es6',
        lib: {
            entry: 'src/index.ts',
            fileName: () => 'index.js',
            formats: ['es'],
        }
    },
});