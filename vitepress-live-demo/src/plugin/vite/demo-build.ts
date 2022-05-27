import { Plugin } from 'vite'
import path from 'path'
import { ParsedViteConfig, parseConfig } from './common'
import { OutputBundle, OutputChunk, OutputAsset } from 'rollup'
import * as fs from 'fs'
import type { LiveDemoPluginOptions } from '..'
// @ts-ignore
const globby: typeof import('globby') = require('globby')

const defaultDemos = ['docs/**/*.{js,jsx,ts,tsx,vue}','examples/**/*.{js,jsx,ts,tsx,vue}','!.vitepress',"!**/*/vite.config.{js,ts}"]

export function DemoBuildPlugin(option:LiveDemoPluginOptions) {
  let config: ParsedViteConfig = {} as any
  const chunkMap: any = {}
  return {
    name: "vite:live-demo:demo-build",
    apply: 'build',
    enforce: 'pre',
    async config(config) {
      if(config.build?.ssr) return
      const input = config?.build?.rollupOptions?.input || {}
      const demosGlobby = option.demos ?? defaultDemos
      const demos = await globby(demosGlobby)
      // console.info(demos)
      demos.forEach(demo => {
        // @ts-ignore
        input[`live_demo_${demo.replace(/\//g, '_')}`] = path.resolve(demo)
      })
      if (demos.length > 0) {
        // @ts-ignore
        input['live_demo'] = require.resolve('vitepress-live-demo/lib/iframe')
      }
    },
    configResolved(resolvedConfig) {
      config = parseConfig(resolvedConfig)
      if (config.ssr) {
        return
      }
      const output = resolvedConfig.build.rollupOptions.output
      resolvedConfig.build.rollupOptions.output = {
        ...output,
        manualChunks(id, ctx) {
          // app
          if (/node_modules\/vitepress\/dist\/client\/app\/index/.test(id)) {
            return
          }
          if (/node_modules\/@vue\//.test(id)) {
            return "framework"
          }
          try {
            // @ts-ignore
            if (output && output.manualChunks) {
              // @ts-ignore
              const result = output.manualChunks(id, ctx)
              if (result) {
                return result
              }
            }
          } catch (e) {

          }
        }
      }
    },
    generateBundle(option, bundle) {
      for (let key in bundle) {
        const chunk = bundle[key]
        if (chunk.type == 'chunk') {
          try {
            // console.info(chunk.name)
            if (chunk.isEntry && chunk.facadeModuleId && chunk.name.startsWith('live_demo')) {
              const hash = chunk.fileName.match(hashRE)![1]
              chunkMap![chunk.name] = hash
            }
            // console.info(key, chunk.name)
          } catch (e) { }
        } else {
          // console.info(key, omit(chunk, 'source', 'isAsset'))
        }
        if (key.indexOf('app') > -1) continue
        if (key.indexOf('.css') > -1) continue
        // console.info(`writeBundle ${key}    `,bundle[key])
      }
    },
    writeBundle(options, bundle) {
      for (const name in bundle) {
        if (bundle[name].type === 'asset') {
          // @ts-ignore
          // console.info(name, omit(bundle[name], 'source', 'isAsset'))
        }
      }
      if (!chunkMap['live_demo']) {
        return
      }
      writeDemoHtml(options.dir!, config, chunkMap, bundle)
    },
  } as Plugin
}

const hashRE = /\.(\w+)\.js$/

function writeDemoHtml(
  dir: string,
  config: ParsedViteConfig,
  demoMap: any,
  bundle: OutputBundle
) {
  let live_demo_chunk: OutputChunk | undefined
  let live_demo_chunks: OutputChunk[] = []
  let live_demo_css: OutputAsset[] = []
  for (const name in bundle) {
    let chunk = bundle[name]
    if (chunk.type === 'asset') {
      // console.info(name, omit(chunk, 'source', 'isAsset'))
      if (chunk.name?.endsWith('.css')) {
        live_demo_css.push(chunk)
      }
      // console.info(name, omit(chunk, 'source', 'isAsset'))
    } else {
      if (chunk.name == 'live_demo') {
        live_demo_chunk = chunk
      } else if (chunk.name.startsWith('live_demo')) {
        live_demo_chunks.push(chunk)
        // console.info(name, omit(chunk, 'modules', 'code', 'importedBindings'))
      }
    }
  }
  if (!live_demo_chunk) {
    return
  }
  const hash: any = {}
  live_demo_chunks.forEach(chunk => {
    hash[chunk.name.replace('live_demo_', '')] = demoMap[chunk.name]
  })
  const demoFile = path.resolve(dir, '~demos.html')
  fs.writeFileSync(demoFile, `<!DOCTYPE html>
  <html>
    <head>
      <title></title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="description" content="">
      ${live_demo_css.map(chunk => `<link rel="stylesheet" href="${config.BASE_URL}${chunk.fileName}">`)}
    </head>
    <body>
      <div id="app"></div>
      <script>__VP_LIVE_DEMO_HASH__=${JSON.stringify(hash)}</script>
      <script type="module" src="${config.BASE_URL}${live_demo_chunk.fileName}"></script>
    </body>
  </html>`)
}
const omit = <T extends object>(data: T, ...keys: (keyof T & string)[]) => {
  const result: Partial<T> = {}
  Object.keys(data)
    .filter(key => keys.every(fil => fil != key))
    .forEach(key => {
      // @ts-ignore
      result[key] = data[key]
    })
  return result
}


