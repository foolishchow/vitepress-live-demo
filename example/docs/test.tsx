import { defineComponent } from 'vue'
import './test.css'

export default defineComponent({
  name: '1231',
  setup() {

    const dasharray = 2 * Math.PI * 111
    const dashoffset = dasharray - 30 / 200 * dasharray
    return () => {
      return <div class="points-plate">
        <svg class="svg" viewBox="0 0 444 222">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#79A5FF" />
              <stop offset="100%" stop-color="#1763FF" />
            </linearGradient>
          </defs>
          <path path-id="blueGradient" d="M 222,121 m -111,0 a 111,111 0 0 1 222,0 "
            stroke="#F3F7FF" stroke-width="12"
          ></path>
          <path path-id="blueGradient" d="M 222,121 m -111,0 a 111,111 0 0 1 222,0 "
            stroke="#F3F7FF" stroke-width="10" stroke-dasharray={dasharray}
            stroke-dashoffset={dashoffset}
            style={{ 'stroke': 'url(#blueGradient)', 'fill': 'transparent' }}></path>
        </svg>
        <div class="center-anchor"></div>
      </div>
    }
  }
})