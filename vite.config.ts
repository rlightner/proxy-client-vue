import { defineConfig } from 'vite'
import typescript from 'rollup-plugin-typescript2'
import vue from '@vitejs/plugin-vue'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['vue-demi']
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'proxy-client-vue',
      fileName: format => `index.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'vue-demi'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-demi': 'vueDemi',
        }
      },
      plugins: [
        typescript({
          include: ['src/**/*.ts', 'src/**/*.vue']
        })
      ]
    }
  },
  plugins: [vue()]
})
