# vitepress-live-demo

> view demo in vitepress
>  - support iframe 
>  - support isolate demo view in `~/demo.html`

inspried by 
- [dumi](https://d.umijs.org/zh-CN)
- [create-vitepress-demo](https://github.com/bowencool/create-vitepress-demo)

# demo

[vform-element](https://foolishchow.gitee.io/vform-element/)   
or see [`example`](./example/)

# install 
```
npm i vitepress-live-demo
```

# Config


## config `.vitepress/config.ts`

```typescript
import { MarkdownItLiveDemo, VitePluginLiveDemo } from 'vitepress-live-demo'
import { UserConfig } from 'vitepress';
import type { DefaultTheme } from 'vitepress/types/default-theme'

export const config: UserConfig<DefaultTheme.Config> = {
  // https://vitepress.vuejs.org/guide/markdown.html#advanced-configuration
  markdown: {
    config: (md) => {
      md.use(MarkdownItLiveDemo)
    },
  },
  vite: {
    plugins: [
      VitePluginLiveDemo({ lineNumber: true })
    ]
  }
};

export default config
```

## config `.vitepress/theme/index.js`

```typescript
import { VitepressLiveDemo } from 'vitepress-live-demo/lib/theme'
import DefaultTheme from "vitepress/dist/client/theme-default";
import type { Theme } from 'vitepress/dist/client'
import "vitepress-live-demo/lib/style.css"
export default {
  ...DefaultTheme, // or ...VitepressLiveDemo
  enhanceApp(ctx){
    VitepressLiveDemo.enhanceApp(ctx)
  }
} as Theme
```

## custom DemoComponent 
```typescript
import { LiveDemoComponentName , LiveDemoComponenentProps} from 'vitepress-live-demo/lib/theme'
import DefaultTheme from "vitepress/dist/client/theme-default";
import type { Theme } from 'vitepress/dist/client'
import { defineComponent } from 'vue'

// write your component
const YourComponent = defineComponent({
  // this is the props 
  props:LiveDemoComponenentProps,
  setUp(props,context){

  }
})

export default {
  ...DefaultTheme, 
  enhanceApp(ctx){
    // VitepressLiveDemo.enhanceApp(ctx)   remove this
    // add this
    ctx.app.component(LiveDemoComponentName, YourComponent)
  }
} as Theme
```


## link `demo` 
- common mode
```markdown
<demo src="path-to-file" />
```

- iframe mode
```markdown
<demo src="path-to-file" />
```
