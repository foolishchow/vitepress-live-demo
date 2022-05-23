import MarkdownIt from 'markdown-it';
import * as path from 'path'
import * as fs from 'fs'
import { LiveDemoComponentName } from '../../constant';
import { getRelativePath, LiveDemoExtName, LiveDemoScheme } from '../code-raw/common';

const attrRE = /\b(?<key>\w+)(="(?<value>[^"]*)")?/g;
export function parseDemoAttr(attrs: string): ParsedAttrs {
  const meta: any = {};
  let rez = null;
  while ((rez = attrRE.exec(attrs))) {
    // @ts-ignore
    const { key, value } = rez.groups;
    const newValue = value === void 0 ? true : value;
    if (Array.isArray(meta[key])) {
      meta[key].push(newValue);
    } else if (!meta[key]) {
      meta[key] = newValue;
    } else {
      meta[key] = [meta[key], newValue];
    }
  }
  return meta;
}


function resolveFiles(basePath: string, files: string[]) {
  return files.map((file) => {
    const filePath = path.resolve(basePath, file)
    if (!fs.existsSync(filePath)) {
      throw new Error(`[Live Demo] Demo File NotFound: file not found\n\t${file}`)
    }
    return getRelativePath(filePath)
  })
}

type ParsedAttrs = {
  iframe?: boolean
  compact?: boolean
  src?: string
  file?: string
  files?: string[]
}

type DemoInfo = {
  withBase: boolean
  demoIndex: number
  fileIndex: number
  demoCache: { [key: string]: string }
  rawCache: { [key: string]: string }
}

export function compatDemo(meta: ParsedAttrs, md: MarkdownIt) {
  // @ts-ignore
  const { __path: mdPath, __data: data } = md;
  const mdDir = path.dirname(mdPath)
  const fileList = resolveFiles(mdDir, [meta.src!, meta.file].filter(s => s) as any)

  // console.info(meta)
  const hoistedTags: string[] = data.hoistedTags || (data.hoistedTags = []);
  const demoInfo: DemoInfo = data.demoInfo || (data.demoInfo = { withBase: false, demoIndex: 0, fileIndex: 0, demoCache: {}, rawCache: {} });

  const demo: string[] = [`<${LiveDemoComponentName}`]
  demo.push(`source="${fileList[0]}"`)

  if (meta.compact) {
    demo.push(`compact`)
  }
  if (meta.iframe) {
    demo.push(`iframe`)
  }

  const fileParam: string[] = []
  fileList.forEach(file => {
    const fileName = importRaw(file, hoistedTags, demoInfo)
    fileParam.push(fileName)
  })

  demo.push(`:files="[${fileParam.join(',')}]"`)

  importVitepress(hoistedTags, demoInfo)
  demo.push(`:demo-src="withBase('~demos.html#/${fileList[0]}')"`)

  demo.push('>')
  if (meta.iframe) {
    demo.push(`<iframe :src="withBase('~demos.html#/${fileList[0]}')"/>`)
  } else {
    const localName = importSrc(meta.src!, hoistedTags, demoInfo)
    demo.push(`<${localName}/>`)
  }
  demo.push(`</${LiveDemoComponentName}>`)
  return demo.join(' ')

}

function importVitepress(hoistedTags: string[], demoInfo: DemoInfo) {
  if (demoInfo.withBase) return;
  demoInfo.withBase = true
  addImportDeclaration(hoistedTags, '{withBase}', `vitepress`);
}
function importRaw(fileSrc: string, hoistedTags: string[], demoInfo: DemoInfo) {
  if (demoInfo.rawCache[fileSrc]) {
    return demoInfo.rawCache[fileSrc]
  }
  const localName = `RawFile_${demoInfo.fileIndex++}`;
  addImportDeclaration(hoistedTags, localName, `${LiveDemoScheme}${fileSrc}${LiveDemoExtName}`);
  demoInfo.rawCache[fileSrc] = localName
  return localName
}

function importSrc(fileSrc: string, hoistedTags: string[], demoInfo: DemoInfo) {
  if (demoInfo.demoCache[fileSrc]) {
    return demoInfo.demoCache[fileSrc]
  }
  const localName = `LiveDemo_${demoInfo.demoIndex++}`;
  addImportDeclaration(hoistedTags, localName, fileSrc);
  demoInfo.demoCache[fileSrc] = localName
  return localName
}

const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/;
/** 在script里添加组件引入语句 */
function addImportDeclaration(hoistedTags: string[], localName: string, source: string) {
  const existingScriptIndex = hoistedTags.findIndex((tag) => {
    return scriptSetupRE.test(tag);
  });
  if (existingScriptIndex === -1) {
    hoistedTags.push(`<script setup>\nimport ${localName} from '${source}';\n</script>`);
  } else {
    hoistedTags[existingScriptIndex] = hoistedTags[existingScriptIndex].replace(
      /<\/script>/,
      `\nimport ${localName} from '${source}';\n</script>`,
    );
  }
}
