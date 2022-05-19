import { UserConfig } from 'vitepress';
import { Plugin, PluginOption } from 'vite'
import { MarkdownItLiveDemo } from './markdown'
import { RawCodePlugin } from './vite/raw-code'
import { DemoDevPlugin } from './vite/demo-dev'
import { DemoBuildPlugin } from './vite/demo-build';
/**
 * 插件
 */
export const LiveDemoConfig: UserConfig = {

  // https://vitepress.vuejs.org/guide/markdown.html#advanced-configuration
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(MarkdownItLiveDemo);
    },
  },

  vite: {
    plugins: [
      VitePluginLiveDemo()
    ]
  }
};


export interface LiveDemoPluginOptions {
  /**
   * whether show lineNumber for live demo code
   *
   * @default true
   */
  lineNumber?: boolean
  /**
   * whether use Iframe for live demo for default
   *
   * this is useful when you are writing an demo for mobile
   *
   * @default false
   */
  // preferIframe?: boolean

  /**
   * options for scan demo
   *
   * `only used in build`
   *
   * [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).
   * @default   {[`docs/**\/*.{vue,ts,tsx,js,jsx}`, `examples/**\/*.{vue,ts,tsx,js,jsx}`,'!.vitepress']}
   */
  demos?: string[]
}



function VitePluginLiveDemo(option: LiveDemoPluginOptions = {}): PluginOption {
  const defaultDemos = ['docs/**/*.{js,jsx,ts,tsx,vue}','examples/**/*.{js,jsx,ts,tsx,vue}','!.vitepress']
  const defaultOption: Required<LiveDemoPluginOptions> = {
    lineNumber: true,
    // preferIframe: false,
    demos: defaultDemos
  }
  const opt: Required<LiveDemoPluginOptions> = {
    ...defaultOption,
    ...option
  }
  if(!opt.demos || opt.demos.length == 0){
    opt.demos = defaultDemos
  }
  return [
    RawCodePlugin(opt),
    DemoDevPlugin(),
    DemoBuildPlugin(opt)
  ]
}
export { VitePluginLiveDemo, MarkdownItLiveDemo }
