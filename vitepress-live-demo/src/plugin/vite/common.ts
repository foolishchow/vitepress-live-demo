import { ResolvedConfig } from 'vite';

export interface ParsedViteConfig {
  isDev: boolean
  ssr: boolean,
  BASE_URL:string,
  // outDir:string
}
export function parseConfig(config: ResolvedConfig): ParsedViteConfig {

  const result: ParsedViteConfig = {
    BASE_URL:config.env.BASE_URL,
    isDev: config.env.DEV,
    ssr: !!config.build.ssr,
    // outDir:config.publicDir
  }
  // console.info(config.build.rollupOptions.output)
  return result
}