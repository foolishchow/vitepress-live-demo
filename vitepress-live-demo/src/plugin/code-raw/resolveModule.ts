import fs from 'fs'
import path from 'path'
import util from 'util'
import { highlight } from './highlight'
const readFile = util.promisify(fs.readFile)
const exist = util.promisify(fs.exists)
import type { LiveDemoPluginOptions } from '..'

export type FileAttr = {
  filePath: string;
  name: string;
  codeStr: string;
  htmlStr?: string;
  language: string;
};
/**
 * 读取文件
 */
export async function resolveModule(filePath: string, opt: LiveDemoPluginOptions): Promise<FileAttr | null> {
  const extisted = await exist(filePath);
  if (!extisted) return null
  const language = path.extname(filePath).replace(/\./, '')

  const rawContent = await readFile(filePath, 'utf-8');
  const hlgs = highlight(rawContent, language)

  return {
    name: path.basename(filePath),
    filePath: filePath.replace(process.cwd(), ''),
    codeStr: encodeURIComponent(rawContent),
    language,
    htmlStr: encodeURIComponent(wrapCode(hlgs, language, opt)),
  };
}


function wrapCode(highlighted: string, language: string, opt: LiveDemoPluginOptions) {
  if (opt.lineNumber??true) {
    return lineNumber(highlighted, language)
  }
  return `<div class="language-${language}">${highlighted}</div>`
}

function lineNumber(highlighted: string, language: string) {
  const lines = highlighted.split('\n')
  const lineNumbersCode = [...Array(lines.length)]
    .map((line, index) => `<span class="line-number">${index + 1}</span><br>`)
    .join('')
  const lineNumbersWrapperCode = `<div class="line-numbers-wrapper">${lineNumbersCode}</div>`
  return `<div class="language-${language} line-numbers-mode">${highlighted}${lineNumbersWrapperCode}</div>`
}
