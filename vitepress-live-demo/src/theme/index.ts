import type { Theme } from 'vitepress/dist/client'
// @ts-ignore
import DefaultTheme from 'vitepress/dist/client/theme-default';
import { LiveDemoComponenent, LiveDemoComponenentProps } from './LiveDemoContainer';
import { LiveDemoComponentName } from '../constant'
import './custom.css'

export const VitepressLiveDemo: Theme = {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    app.component(LiveDemoComponentName, LiveDemoComponenent);
  },
}

export { LiveDemoComponenent, LiveDemoComponentName, LiveDemoComponenentProps }
