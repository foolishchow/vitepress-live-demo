import { LiveDemoScheme } from './common'

const resolvedVirtualModuleId = '\0' + LiveDemoScheme

const stringify = (data:any)=>JSON.stringify(data,null,4)
export function accepthmr(id: string, result: any) {
  // https://github.com/vitejs/vite/issues/4646
  const meta = 'import.meta'
  return `import {createHotContext as __vite__createHotContext} from "/@vite/client";
${meta}.hot = __vite__createHotContext("${resolvedVirtualModuleId}${id}");
${(result).code} `
}

export function hmr(id: string, data: any, ssr: boolean) {
  if (ssr) {
    return `export default ${stringify(data)};`
  }
  // https://github.com/vitejs/vite/issues/4646
  const meta = 'import.meta'
  return `const __default__ = ${stringify(data)};
  export default __default__;
  if(__VUE_HMR_RUNTIME__){
    __default__.__hmrId = "${id}"
    __VUE_HMR_RUNTIME__.createRecord("${id}", __default__)
    ${meta}.hot.accept(({default: __default}) => {
      // console.info(__default)
      __VUE_HMR_RUNTIME__.reload("${id}", __default)
    })
  }
`
}