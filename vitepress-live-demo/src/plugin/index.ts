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
  // alwaysIframe?: boolean
  /**
   * whether show open in new Tab
   *
   * @default false
   */
  // alwaysShowNewTabIcon?: boolean

  /**
   * options for scan demo
   *
   * `only used in build`
   *
   * [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).
   * @default   {[`docs/**\/*.{vue,ts,tsx,js,jsx}`, `examples/**\/*.{vue,ts,tsx,js,jsx}`,'!.vitepress','!**\/*\/vite.config.{ts,js}']}
   */
  demos?: string[]
}


function VitePluginLiveDemo(option: LiveDemoPluginOptions = {}): PluginOption {


  return [
    RawCodePlugin(option),
    DemoDevPlugin(),
    DemoBuildPlugin(option)
  ]
}
export { VitePluginLiveDemo, MarkdownItLiveDemo }
