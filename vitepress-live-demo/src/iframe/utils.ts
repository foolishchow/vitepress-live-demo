export function injectQuery(url:string, queryToInject?:string) {
  // skip urls that won't be handled by vite
  if (!url.startsWith('.') && !url.startsWith('/')) {
      return url;
  }
  // can't use pathname from URL since it may be relative like ../
  const pathname = url.replace(/#.*$/, '').replace(/\?.*$/, '');
  const { search, hash } = new URL(url, 'http://vitejs.dev');
  const searches = [
    queryToInject?queryToInject:'',
    search.slice(1)?search.slice(1):''
  ].filter(s=>s)
  return `${pathname}?${searches.length? "?"+searches.join('&'):''}${hash || ''}`;
  // return `${pathname}?${queryToInject}${search ? `&` + search.slice(1) : ''}${hash || ''}`;
}

export function normalize(val:string){
  return val.replace(/(\/)+/g,'/')
}