import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'

const common = {
	input: 'src/index.ts',
	external: ['undici-shim', 'tslib']
}

const generatedCode = {
    arrowFunctions: true,
    constBindings: true,
    objectShorthand: true
}

const esm = {
	...common,
    plugins: [esbuild(), resolve()],
    output: {
        generatedCode,
        file: 'dist/esm.js',
        format: 'es'
    }
}

const umd = {
	...common,
    plugins: [esbuild(), resolve({ browser: true })],
    output: {
        generatedCode,
        name: 'twittxr',
        globals: {
            'undici-shim': 'undici'
        },
        file: 'dist/umd.cjs',
        format: 'umd',
        exports: "named"
    }
}

export default [umd, esm]