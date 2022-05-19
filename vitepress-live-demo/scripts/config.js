const package = require('../package.json')
const path = require('path')
require('util').promisify
const externals = [
  "fs",
  "path",
  "util",
  "os",
  "net",
  "globby",
  ...Object.keys(package.dependencies || {}),
  ...Object.keys(package.devDependencies || {}),
  "chalk",
  "prismjs",
  "prismjs/components/index",
  "vitepress/dist/client/theme-default",
  "markdown-it"
]
/**
 *
 * @param {string} source
 * @param {string | undefined} importer
 * @param {boolean} isResolved
 */
exports.externals = function (source, importer, isResolved) {
  if (externals.some(external => source.startsWith(external))) {
    return true
  }
  // console.info(source)
  return false
}
/**
 *
 * @param {string} source
 * @param {string | undefined} importer
 * @param {boolean} isResolved
 */
exports.typeExternal = function (source, importer, isResolved) {
  if (externals.some(external => source.startsWith(external))) {
    return true
  }
  if (source.endsWith('.css')) {
    return true
  }
  return false
}

// 打包的入口文件
exports.entryDir = path.resolve(__dirname, '../src')
// 出口文件夹
exports.outDir = path.resolve(__dirname, '../lib')
// vite基础配置