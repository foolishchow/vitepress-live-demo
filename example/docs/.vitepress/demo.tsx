// @ts-ignore
import { createApp as createClientApp, createSSRApp, h } from 'vue';
import { inBrowser } from 'vitepress';
import { RouterSymbol, createLiveDemoRouter, useLiveDemoRoute } from './router';

function pathToFile(path) {
  // @ts-ignore
  const base = import.meta.env.BASE_URL;
  const preffix = `/${base}/~demos/`.replace(/\/\//g, '')
  const id = path.replace(preffix, '').replace(/\.html$/, '')
  // @ts-ignore
  return `${__VP_MODULE_ROOT__ || ""}/${id}`
}

const NotFound = (() => '404 Not Found');
const VitePressApp = {
  name: 'VitePressApp',
  setup() {
    const route = useLiveDemoRoute()
    return () => {
      console.info(h)
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
    ? createSSRApp(VitePressApp)
    : createClientApp(VitePressApp);
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
      return import(/*@vite-ignore*/ __vite__injectQuery(pageFilePath, ''));
    }
    // SSR: sync require
    // @ts-ignore
    return require(pageFilePath);
  }, NotFound);
}
function handleHMR(router) {
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
function shouldHotReload(payload) {
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


