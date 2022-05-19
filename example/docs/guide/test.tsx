import { defineComponent } from 'vue'
import './test.css'

export default defineComponent({
  name: '123',
  setup() {
    return () => {
      return <span class="red-text">This is an Demo</span>
    }
  }
})