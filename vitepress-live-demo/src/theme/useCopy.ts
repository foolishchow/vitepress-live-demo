import { ref, unref } from 'vue';
import type { Ref } from 'vue';
import copy from './clipboard-copy'

type MaybeRef<T> = T | Ref<T>

type copyBaseProps = {
  text: MaybeRef<string | HTMLElement>; // 拷贝到剪切板里的文本或 HTML 元素
  duration?: number; // 拷贝完成后的延迟时间
  onSuccess?: () => void; // 拷贝成功的回调函数
  onError?: (error: unknown) => void; // 拷贝失败的回调函数
};

interface Stoppable {
  /**
   * A ref indicate whether a stoppable instance is executing
   */
  isPending: Ref<boolean>;
  /**
   * Stop the effect from executing
   */
  stop: () => void;
  /**
   * Start the effects
   */
  start: () => void;
}

function useTimeout(
  cb: (...args: unknown[]) => any,
  interval: MaybeRef<number>
): Stoppable {
  const isPending = ref<boolean>(false)
  const timerId = ref<number|undefined>()
  return {
    isPending,
    start() {
      if(timerId.value){
        clearTimeout(timerId.value)
      }
      isPending.value = true
      // @ts-ignore
      timerId.value = setTimeout(() => {
        cb();
        isPending.value = false
        timerId.value = undefined
      }, unref(interval))
    },
    stop() {
      if(timerId.value){
        clearTimeout(timerId.value)
        timerId.value = undefined
      }
    }
  }
}

export default function useCopy({ text, duration = 1000, onSuccess, onError, ...copyOptions }: copyBaseProps) {
  const copied = ref(false);
  const error = ref();
  const timeout = useTimeout(() => {
    copied.value = false;
    error.value = null;
  }, duration);

  return {
    error,
    copied,
    copy(options?: any) {
      if (copied.value) return;
      const textOrElement = unref(text);
      copy(textOrElement)
        .then(() => {
          copied.value = true;
          onSuccess?.();
          timeout.start();
        })
        .catch((err: Error) => {
          error.value = err;
          onError?.(err);
          timeout.start();
          throw err;
        });
    },
  };
}
