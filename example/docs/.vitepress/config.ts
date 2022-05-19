import { UserConfig } from 'vitepress';
import type { DefaultTheme } from 'vitepress/types/default-theme'
import vueJsx from '@vitejs/plugin-vue-jsx';
import { MarkdownItLiveDemo, VitePluginLiveDemo } from 'vitepress-live-demo'
export const config: UserConfig<DefaultTheme.Config> = {
  base: '/vite-demo/',
  lang: 'zh-CN',
  title: process.env.npm_package_name,
  description: process.env.npm_package_description,
  themeConfig: {
    sidebar: {
      guide: [
        {
          text: 'demo',
          link: '/guide/demo.html'
        }
      ]
    },
    nav: [
      {
        text: 'home',
        link: '/'
      },
      {
        text: 'guide',
        link: '/guide/demo.html',
        activeMatch: '^/guide/'
      }
    ]
  },
  markdown: {
    lineNumbers: true,
    config: (md) => {
      md.use(MarkdownItLiveDemo)
    },
  },
  vite: {
    server: {
      port: 7001,
      host:'0.0.0.0',
      fs: {
        strict: false,
        // 可以为项目根目录的上一级提供服务
        allow: ['..'],
      },
    },
    build: {
      minify: false
    },
    plugins: [
      vueJsx(),
      VitePluginLiveDemo({ lineNumber: true }),
    ]
  },
};

export default config