const { bundlePlugin, bundleTheme, bundleDemo } = require('./bundle-assets')
const { bundlePluginType, bundleThemeType, bundleDemoType } = require('./bundle-type')

function parseAraguments() {
  const mode = process.argv[2]
  const argv = {
    mode
  }
  if (mode == 'dev') {
    argv.type = process.argv[3]
  }
  return argv
}

async function bundle() {

  const { mode, type } = parseAraguments()
  if (mode == 'dev') {
    if (type == 'plugin') {
      bundlePlugin('dev')
    }
    if (type == 'plugin-type') {
      bundlePluginType('dev')
    }
    if (type == 'theme') {
      bundleTheme('dev')
    }
    if (type == 'theme-type') {
      bundleThemeType('dev')
    }
    if (type == 'iframe') {
      bundleDemo('dev')
    }
    if (type == 'iframe-type') {
      bundleDemoType('dev')
    }
  } else if (mode == 'build') {
    await bundlePlugin('build', true)
    await bundlePluginType('build')
    await bundleTheme('build')
    await bundleThemeType('build')
    await bundleDemo('build')
    await bundleThemeType('build')
  }

}
bundle()