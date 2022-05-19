/**  @typedef {import('rollup').RollupOptions} RollupOptions*/
/**  @typedef {import('rollup').OutputOptions} OutputOptions*/
const { rollup, watch } = require('rollup')
/**  @type {import('rollup').PluginImpl<import('rollup-plugin-dts').Options>} */
const dts = require("rollup-plugin-dts").default;
const { externals, typeExternal } = require('./config')


/**
 * @param {'dev'|'build'} mode
 * @param {RollupOptions} option
 * @param {OutputOptions} output
 */
function bundleType(mode, option, output) {
  /** @type {RollupOptions} */
  const opt = {
    ...option,
    output: output,
    plugins: [dts({
      respectExternal: true,
      compilerOptions: {
        skipDefaultLibCheck: true,
        skipLibCheck: true
      }
    })]
  }
  if (mode == 'dev') {
    return watch(opt)
  }
  return rollup(opt)
    .then(bundle => {
      return bundle.write(output);
    })
}

exports.bundlePluginType = async (mode) => {
  /**
   * @type {OutputOptions}
   */
  const outputOption = {
    file: "lib/plugin.d.ts",
    format: "es"
  }
  /**
   * @type {RollupOptions}
   */
  const option = {
    watch: mode == 'dev',
    input: "src/plugin/index.ts",
    external: externals,
  }
  return bundleType(mode, option, outputOption)
}

exports.bundleThemeType = async (mode) => {
  /**
  * @type {OutputOptions}
  */
  const outputOption = {
    file: "lib/theme.d.ts",
    format: "es"
  }
  /**
   * @type {RollupOptions}
   */
  const option = {
    watch: mode == 'dev',
    input: "src/theme/index.ts",
    external: typeExternal,
  }
  return bundleType(mode, option, outputOption)
}

exports.bundleDemoType = async (mode) => {
  /**
  * @type {OutputOptions}
  */
  const outputOption = {
    file: "lib/iframe.d.ts",
    format: "es"
  }
  /**
   * @type {RollupOptions}
   */
  const option = {
    watch: mode == 'dev',
    input: "src/iframe/index.ts",
    external: typeExternal,
  }
  return bundleType(mode, option, outputOption)
}

