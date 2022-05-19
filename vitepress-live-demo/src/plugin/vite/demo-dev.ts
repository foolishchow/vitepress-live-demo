import { Plugin } from 'vite'
import path from 'path'
import { ParsedViteConfig ,parseConfig} from './common'

const rawIndex = ()=>{
  const demoIndex = require.resolve('vitepress-live-demo/lib/iframe')
  return  `<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="">
  </head>
  <body>
    <div id="app"></div>
    <script>var __VP_MODULE_ROOT__ = '/@fs/${process.cwd()}/'</script>
    <script type="module" src="/@fs/${demoIndex}"></script>
  </body>
</html>`
}

/**
 * an `Vite` plugin for server `live-demo` ~demos.html?xxx
 */
export function DemoDevPlugin() {
  let config:ParsedViteConfig = {} as any
  return {
    name: 'vite:live-demo:demo-dev', // 必须的，将会在 warning 和 error 中显示
    enforce: 'post',
    apply:'serve',
    configResolved(_config){
      config = parseConfig(_config)
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url
        const demoPreffix = path.normalize(`/${config.BASE_URL}/~demos.html`)
        if (url?.startsWith(demoPreffix)) {
          // console.info(url.replace(demoPreffix, ''))
          // const file = url.replace(demoPreffix,'')
          const result = await server.transformIndexHtml(
            req.url!, rawIndex())
          if (result) {
            res.setHeader('Content-Type', 'text/html')
            res.end(result);
            return
          }
        }
        await next()
      })
    }
  } as Plugin
}





