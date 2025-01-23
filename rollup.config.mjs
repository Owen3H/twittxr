import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

import pkg from './package.json' assert { type: 'json' }

const common = {
	input: 'src/index.ts',
	external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
        json(),
        resolve({ preferBuiltins: true }), 
        commonjs({ requireReturnsDefault: 'auto' }),
        esbuild()
    ]
}

const generatedCode = {
    arrowFunctions: true,
    constBindings: true,
    objectShorthand: true
}

const esm = {
	...common,
    output: {
        generatedCode,
        file: pkg.exports.import,
        format: 'es',
        inlineDynamicImports: true
    }
}

const cjs = {
	...common,
    output: {
        generatedCode,
        file: pkg.exports.require,
        format: 'cjs',
        inlineDynamicImports: true
    }
}

export default [esm, cjs]