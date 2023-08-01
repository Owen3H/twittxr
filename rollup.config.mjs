import resolve from '@rollup/plugin-node-resolve'

import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

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

const types = {
	input: 'src/types.ts',
    plugins: [dts()],
    output: {
      file: `dist/types.d.ts`,
      format: 'es',
    }
}

export default [umd, esm, types]