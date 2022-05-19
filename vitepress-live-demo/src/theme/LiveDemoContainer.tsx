import { computed, defineComponent, onMounted, PropType, ref, SetupContext } from 'vue';
import useCopy from './useCopy';
import { LiveDemoIcon } from './icons'
import './live-demo.css'
import { LiveDemoFile } from '../constant';

/**
 * LiveDemoComponentProps definition
 */
export const LiveDemoComponenentProps = {
  /**
   * file path relative to `process.cwd()`
   */
  source: {
    type: String,
    required: true
  },
  demoSrc: {
    type: String,
    required: true
  },
  /**
   * use iframe
   */
  iframe: {
    type: Boolean,
  },
  compact: {
    type: Boolean,
  },
  files: {
    type: Array as PropType<LiveDemoFile[]>,
    default: () => [],
  },
}
/**
 * component for `LiveDemo`
 */
export const LiveDemoComponenent = defineComponent({
  props: LiveDemoComponenentProps,
  setup(props, context) {
    const slotWrapper = ref<HTMLElement>();
    const currentTab = ref<string>(props.files[0]?.name);
    const currentFile = computed(() => props.files.find((file) => file.name === currentTab.value));
    const sourceVisible = ref(false)

    const { copied, copy, error } = useCopy({
      text: computed(() => decodeURIComponent(currentFile.value?.codeStr || '')),
      // html: true,
    });
    const tooltip = computed(() => {
      if (error.value) {
        return `复制失败: ${error.value?.message}`;
      }
      if (copied.value) {
        return '复制成功';
      }
      return '点击复制';
    });
    function openNewTab() {
      if (props.demoSrc) {
        window.open(props.demoSrc)
      }
    }
    function reload() {
      const iframe = slotWrapper.value?.querySelector('iframe');
      iframe?.contentDocument?.location.reload();
    }

    onMounted(() => {
      if (props.iframe) {
        setTimeout(() => {
          const iframe = slotWrapper.value?.querySelector('iframe');
          if (iframe) {
            const definedHeight = iframe.getAttribute('height');
            if (definedHeight) return;
            iframe.onload = () => {
              setTimeout(() => {
                const html = iframe.contentWindow?.document.documentElement;
                // console.log(iframe, html);
                if (html) {
                  // console.log(html.scrollHeight, html.clientHeight, html.offsetHeight);
                  iframe.style.height = `${html.scrollHeight}px`;
                }
              }, 1000);
            };
          }
        }, 0);
      }
    });


    return () => {

      const iframeWrap = onlyWhen(
        props.iframe,
        <div class="browser-nav"></div>
      )
      const iframeIcons = onlyWhen(
        props.iframe,
        <ToolTip tip="刷新">
          <LiveDemoIcon name="reload" onClick={reload} />
        </ToolTip>
      )

      const fileHeaders = onlyWhen(
        sourceVisible.value && props.files.length > 1,
        <div class="file-tab">
          {props.files.map(file => <span
            key={file.name}
            title={file.name}
            onClick={() => { currentTab.value = file.name }}
            class={{ active: currentTab.value === file.name }}
          >
            {file.name}
          </span>)}
        </div>
      )
      const codeIcons = onlyWhen(
        props.files && props.files.length > 0,
        <div class="action-line__buttons" style="margin-left: auto">
          <ToolTip tip={tooltip.value}>
            <LiveDemoIcon onClick={copy}
              name={copied.value ? 'success' : 'copy'}
              class={{ 'is-success': copied.value }} />
          </ToolTip>
          <ToolTip tip={sourceVisible.value ? '收起源码' : '查看源代码'}>
            <LiveDemoIcon name="sourceCode" onClick={() => { sourceVisible.value = !sourceVisible.value }} />
          </ToolTip>
        </div>
      )


      return <client-only>
        {iframeWrap}
        <section {...context.attrs} class="live-demo-container">

          <div ref={slotWrapper} class={['demo-block', { compact: props.compact, iframe: props.iframe }]}>
            {context?.slots?.default?.()}
          </div>

          <div class="action-line">
            <div class="action-line__buttons">
              <ToolTip tip="在新标签页中打开">
                <LiveDemoIcon name='newTab' onClick={openNewTab} />
              </ToolTip>
              {iframeIcons}
            </div>
            {fileHeaders}
            {codeIcons}
          </div>

          {sourceVisible.value && currentFile.value?.htmlStr ? <div
            innerHTML={decodeURIComponent(currentFile.value.htmlStr)}
            key="highlight"
            class="code-wrapper"
          /> : null}

          {sourceVisible.value && !currentFile.value?.htmlStr && currentFile.value?.codeStr ? <div
            key="highlight"
            class="code-wrapper"
          > <pre>{currentFile.value.codeStr}</pre></div> : null}
          {sourceVisible.value ? <div class="botton-line" key="button" onClick={() => sourceVisible.value = false}>
            <LiveDemoIcon name='top' />
            收起
          </div> : null}
        </section>
      </client-only>
    }

  },
});

function ToolTip(props: { tip: string }, context: SetupContext) {
  return <div class="live-demo-tooltip">
    {context?.slots?.default?.()}
    <span class="tooltiptext tooltip-top">{props.tip}</span>
  </div>
}

function onlyWhen(condition: boolean, element: JSX.Element | JSX.Element[]): undefined | JSX.Element | JSX.Element[] {
  if (condition) {
    return element
  }
  return undefined
}