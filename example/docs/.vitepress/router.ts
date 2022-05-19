import { reactive, inject, markRaw, nextTick } from 'vue'
import type { Component, InjectionKey } from 'vue'
import { inBrowser } from 'vitepress'

export interface Route {
  path: string
  component: Component | null
}

export interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}

export const RouterSymbol: InjectionKey<Router> = Symbol()

// we are just using URL to parse the pathname and hash - the base doesn't
// matter and is only passed to support same-host hrefs.
const fakeHost = `http://a.com`



const getDefaultRoute = (): Route => ({
  path: '/',
  component: null,
})

interface PageModule {
  default: Component
}

export function createLiveDemoRouter(
  loadPageModule: (path: string) => PageModule | Promise<PageModule>,
  fallbackComponent?: Component
): Router {
  const route = reactive(getDefaultRoute())

  function go(href: string = inBrowser ? location.href : '/') {
    // ensure correct deep link so page refresh lands on correct files.
    const url = new URL(href, fakeHost)
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      url.pathname += '.html'
      href = url.pathname + url.search + url.hash
    }
    if (inBrowser) {
      // save scroll position before changing url
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  let latestPendingPath: string | null = null

  async function loadPage(href: string, scrollPosition = 0, isRetry = false) {
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = loadPageModule(pendingPath)
      // only await if it returns a Promise - this allows sync resolution
      // on initial render in SSR.
      if ('then' in page && typeof page.then === 'function') {
        page = await page
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null

        const { default: comp } = page as PageModule
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`)
        }

        route.path = pendingPath
        route.component = markRaw(comp)

        if (inBrowser) {
          nextTick(() => {
            window.scrollTo(0, scrollPosition)
          })
        }
      }
    } catch (err: any) {
      if (!err.message.match(/fetch/)) {
        console.error(err)
      }

      // retry on fetch fail: the page to hash map may have been invalidated
      // because a new deploy happened while the page is open. Try to fetch
      // the updated pageToHash map and fetch again.

      if (latestPendingPath === pendingPath) {
        latestPendingPath = null
        route.path = pendingPath
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null
      }
    }
  }

  if (inBrowser) {
    window.addEventListener(
      'click',
      (e) => {
        const link = (e.target as Element).closest('a')
        if (link) {
          const { href, protocol, hostname, pathname, hash, target } = link
          const currentUrl = window.location
          const extMatch = pathname.match(/\.\w+$/)
          // only intercept inbound links
          if (
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey &&
            target !== `_blank` &&
            protocol === currentUrl.protocol &&
            hostname === currentUrl.hostname &&
            !(extMatch && extMatch[0] !== '.html')
          ) {
            e.preventDefault()
            if (pathname === currentUrl.pathname) {
              // scroll between hash anchors in the same page
              if (hash && hash !== currentUrl.hash) {
                history.pushState(null, '', hash)
                // still emit the event so we can listen to it in themes
                window.dispatchEvent(new Event('hashchange'))
                // use smooth scroll when clicking on header anchor links
              }
            } else {
              go(href)
            }
          }
        }
      },
      { capture: true }
    )

    window.addEventListener('popstate', (e) => {
      loadPage(location.href, (e.state && e.state.scrollPosition) || 0)
    })

    window.addEventListener('hashchange', (e) => {
      e.preventDefault()
    })
  }

  return {
    route,
    go
  }
}

export function useLiveDemoRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) {
    throw new Error('useRouter() is called without provider.')
  }
  // @ts-ignore
  return router
}

export function useLiveDemoRoute(): Route {
  return useLiveDemoRouter().route
}

