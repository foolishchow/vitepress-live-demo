const path = require('path')
const { build: viteBuild } = require('vite')
/**  @type {(option?:import('@vitejs/plugin-vue').Options)=>import('vite').Plugin} */
const vue = require('@vitejs/plugin-vue')
/**  @type {()=>import('vite').Plugin} */
const vueJsx = require('@vitejs/plugin-vue-jsx')
const { externals, entryDir, outDir } = require('./config')

/**
 * @type {import('vite').Plugin}
 */
const KeepMetaPlugin = {
  apply: 'build',
  generateBundle(_, chunks) {
    Object.keys(chunks).forEach(key => {
      const chunk = chunks[key]
      chunk.code = chunk.code.replace(/__\$meta\$__/g, 'import.meta')
    })
  },
  transform(code) {
    return code.replace(/import\.meta/g, '__$meta$__')
  }
}
exports.bundleTheme = (mode, clean = false) => {
  return viteBuild({
    build: {
      emptyOutDir: clean,
      watch: mode == 'dev',
      minify: false,
      rollupOptions: {
        external: externals
      },
      lib: {
        entry: path.resolve(entryDir, 'theme/index.ts'),
        fileName: (formats) => `theme.js`, // 输出文件名
        formats: ['es'],
      },
      outDir
    },
    plugins: [KeepMetaPlugin, vue(), vueJsx()],
  })
}


exports.bundlePlugin = (mode, clean = false) => {
  return viteBuild({
    build: {
      emptyOutDir: clean,
      watch: mode == 'dev',
      minify: false,
      rollupOptions: {
        external: externals
      },
      lib: {
        entry: path.resolve(entryDir, 'plugin/index.ts'),
        fileName: (formats) => `plugin.js`, // 输出文件名
        formats: ['cjs'],
      },
      outDir: path.resolve(outDir)
    },
  })
}

exports.bundleDemo = (mode, clean = false) => {
  return viteBuild({
    build: {
      mode: "development",
      emptyOutDir: clean,
      watch: mode == 'dev',
      minify: false,
      rollupOptions: {
        external: externals,
      },
      lib: {
        entry: path.resolve(entryDir, 'iframe/index.ts'),
        fileName: (formats) => `iframe.js`, // 输出文件名
        formats: ['es'],
      },
      outDir: path.resolve(outDir)
    },
    plugins: [KeepMetaPlugin]
  })
}





