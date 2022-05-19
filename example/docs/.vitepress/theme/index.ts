import { VitepressLiveDemo , LiveDemoComponentName , LiveDemoComponenentProps} from 'vitepress-live-demo/lib/theme'
import DefaultTheme from "vitepress/dist/client/theme-default";
import type { Theme } from 'vitepress/dist/client'
import "vitepress-live-demo/lib/style.css"
import "./custom.css"
export default {
  ...DefaultTheme,
  enhanceApp(ctx){
    VitepressLiveDemo.enhanceApp(ctx)
  }
} as Theme