import { Plugin } from 'vite'
import { LiveDemoScheme, isLiveDemo, resolveLiveDemoModule, isReslovedLiveDemoModuleId, getReslovedModuleFile, getFileLiveDemoModuleId } from '../code-raw/common'
import { accepthmr, hmr } from '../code-raw/hmr'
import { resolveModule } from '../code-raw/resolveModule'
import { getAbsolutePath } from '../code-raw/common'
import type { LiveDemoPluginOptions } from '..'
import * as path from 'path'

function isSSR(option?: { ssr?: boolean }) {
  if (!option) return true
  if (option.ssr != undefined) return option.ssr
  return true
}

export interface Options {
  /**
   * 是否展示lineNumber
   */
  lineNumber: boolean
}
/**
 * an `Vite` plugin for server `live-demo` raw code
 */
export function RawCodePlugin(options: LiveDemoPluginOptions) {
  const files = new Set<string>()
  return {
    name: 'vite:live-demo:raw-code', // 必须的，将会在 warning 和 error 中显示
    enforce: 'post',
    config(config) {
      // https://github.com/vuejs/vitepress/issues/476#issuecomment-1046189073
      // @ts-ignore
      const ssr = config.ssr || (config.ssr={})
      // @ts-ignore
      const noExternal = ssr.noExternal || (ssr.noExternal = [])
      noExternal.push('vitepress-live-demo')
      const optimizeDeps = config.optimizeDeps || (config.optimizeDeps = {})
      const exclued = optimizeDeps.exclude || (optimizeDeps.exclude = [])
      exclued.push('vitepress-live-demo')
    },
    configResolved(config) {
      // config.env.Live_Demo_Alawys_Show_New_Tab = options.alwaysShowNewTabIcon ?? false
    },
    handleHotUpdate(ctx) {
      if (files.has(ctx.file)) {
        const moduleNode = ctx.server.moduleGraph.getModuleById(getFileLiveDemoModuleId(ctx.file))
        if (moduleNode) {
          ctx.server.moduleGraph.invalidateModule(moduleNode)
          ctx.modules.push(moduleNode)
        }
      }
      return ctx.modules
    },
    resolveId(id) {
      if (isLiveDemo(id)) {
        return {
          id: resolveLiveDemoModule(id)
        }
      }
    },
    async load(moduleId, option) {
      if (isReslovedLiveDemoModuleId(moduleId)) {
        const file = getReslovedModuleFile(moduleId)
        const res = await resolveModule(file, options)
        if (res) {
          files.add(getAbsolutePath(file))
          return {
            code: `${hmr(moduleId, res, isSSR(option))}`
          }
        }
        return {
          code: `export default null`
        }
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const base = server.config.base
        const preffix = path.normalize(`/${base}`)
        const preffixWithScheme = path.normalize(`${preffix}/${LiveDemoScheme}`)
        const url = req.url
        if (url?.startsWith(preffixWithScheme)) {
          const id = url.replace(preffix, '').replace(/^\//, '').split('?')[0]
          // @ts-ignore
          const result = await this.load?.(resolveLiveDemoModule(id), { ssr: false })
          res.setHeader('Content-Type', 'application/javascript')
          res.end(accepthmr(id, result))
          return
        }
        await next()
      })
    }
  } as Plugin
}






