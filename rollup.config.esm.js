import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
module.exports = {
  input: 'lib.js',
  output: {
    file: './dist/simulation-station.esm.js',
    format: 'esm'
  },
  plugins: [
    terser({
        module: true
      }
    ),
    resolve({
      module: true
    })
  ]
};