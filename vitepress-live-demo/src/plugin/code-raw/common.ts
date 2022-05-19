import path from 'path'

export const LiveDemoScheme = `live-demo:`
export const LiveDemoExtName = '.demo'
export const LiveDemoExtReg = /\.demo$/
export const ResolvedVirtualModuleId = '\0' + LiveDemoScheme

/**
 *  `\0live-demo:${xxx}.demo`
 * @param file
 * @returns
 */
export function getFileLiveDemoModuleId(file:string){
  return `${ResolvedVirtualModuleId}${getRelativePath(file)}${LiveDemoExtName}`
}
/**
 * 是不是LiveDemo请求
 * @param id
 * @returns
 */
export function isLiveDemo(id:string){
  return id.startsWith(LiveDemoScheme)
}

/**
 * warp  `live-demo:xxxx/xxx.demo` => `\0live-demo:xxxx/xxx.demo`
 * @param id
 * @returns
 */
export function resolveLiveDemoModule(id:string){
  return '\0' + id
}

/**
 * is `moduleId` startsWith `\0live-demo:`
 */
export function isReslovedLiveDemoModuleId(moduleId:string){
  return moduleId.startsWith(ResolvedVirtualModuleId)
}

export function getReslovedModuleFile(moduleId:string){
  return moduleId.replace(ResolvedVirtualModuleId, '').replace(LiveDemoExtReg,'')
}

/**
 * transfer absolute file path to relative path of current `process.cwd()`
 */
export function getRelativePath(file:string){
  return file.replace(process.cwd(),'').substring(1)
}
/**
 * transfer relative path of current `process.cwd()` to absolute file path
 */
export function getAbsolutePath(file:string){
  return path.resolve(process.cwd(),file)
}

