// @ts-ignore
import { createApp as createClientApp, createSSRApp, h } from 'vue';
import { inBrowser } from 'vitepress';
import { RouterSymbol, createLiveDemoRouter, useLiveDemoRoute } from './router';
import { withBase } from 'vitepress'
import { injectQuery, normalize } from './utils'

function pathToFile(hash: string) {
  const file = hash.replace(/^\/?#/, '').replace(/^\//,'')
  // @ts-ignore
  if (window.__VP_LIVE_DEMO_HASH__) {
    const pageName = file.replace(/\//g, "_").replace(/^\//, '')
    // @ts-ignore
    const hash = __VP_LIVE_DEMO_HASH__[pageName]

    return normalize(`./live_demo_${pageName}.${hash}.js`)
  }
  if (!inBrowser) {
    // @ts-ignore
    return normalize(`/${window.__VP_MODULE_ROOT__ || ""}/${file}`)
  }
  hash = hash.split("?")[0]
  // @ts-ignore
  return withBase(normalize(`/${window.__VP_MODULE_ROOT__ || ""}/${file}`))
}

const NotFound = (() => '404 Not Found');
const VitePressLiveDempApp = {
  name: 'VitePressLiveDempApp',
  setup() {
    const route = useLiveDemoRoute()
    return () => {
      if (route.component) {
        return h(route.component)
      }
      return null
    };
  }
};
export function createApp() {
  const router = newRouter();
  handleHMR(router);
  const app = newApp();
  app.provide(RouterSymbol, router);
  // install global components
  return { app, router };
}
function newApp() {
  // @ts-ignore
  return import.meta.env.PROD
    ? createSSRApp(VitePressLiveDempApp)
    : createClientApp(VitePressLiveDempApp);
}
function newRouter() {
  return createLiveDemoRouter((path) => {
    let pageFilePath = pathToFile(path);
    // use lean build if this is the initial page load or navigating back
    // to the initial loaded path (the static vnodes already adopted the
    // static content on that load so no need to re-fetch the page)
    // in browser: native dynamic import
    if (inBrowser) {
      // @ts-ignore
      return import(/*@vite-ignore*/ injectQuery(pageFilePath, ''));
    }
    // SSR: sync require
    // @ts-ignore
    return require(pageFilePath);
  }, NotFound);
}
function handleHMR(router: any) {
  // update route.data on HMR updates of active page
  // @ts-ignore
  if (import.meta.hot) {
    // @ts-ignore // hot reload pageData
    import.meta.hot.on('vitepress:pageData', (payload) => {
      if (shouldHotReload(payload)) {
        router.route.data = payload.pageData;
      }
    });
  }
}
function shouldHotReload(payload: any) {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '');
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '');
  return payloadPath === locationPath;
}
if (inBrowser) {
  const { app, router } = createApp();
  // wait until page component is fetched before mounting
  router.go().then(() => {
    // dynamically update head tags
    // useUpdateHead(router.route, data.site);
    app.mount('#app');
  });
}


