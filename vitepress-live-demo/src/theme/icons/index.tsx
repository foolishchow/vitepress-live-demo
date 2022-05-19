import { HTMLAttributes, SetupContext, createVNode } from 'vue'
import CaretTop from './caret-top.vue'
import Copy from './copy.vue'
import NewTab from './new_tab.vue'
import Reload from './reload.vue'
import SourceCode from './source_code.vue'
import Success from './success.vue'
export { CaretTop, Copy, NewTab, Reload, Success, SourceCode }

const Icons = {
  success: Success,
  copy: Copy,
  sourceCode: SourceCode,
  reload: Reload,
  newTab: NewTab,
  top: CaretTop
}

type IconProps = HTMLAttributes & { name: keyof typeof Icons }
export function LiveDemoIcon(props: IconProps, context: SetupContext) {
  return <span class="live-demo-icon" {...context.attrs} >
    {createVNode(Icons[props.name])}
  </span>
}