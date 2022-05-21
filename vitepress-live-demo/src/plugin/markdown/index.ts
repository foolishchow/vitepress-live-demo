import MarkdownIt from 'markdown-it';
import { compatDemo, parseDemoAttr } from './render';

export const MarkdownItLiveDemo = (md: MarkdownIt) => {
  md.renderer.rules.html_inline = md.renderer.rules.html_block = (tokens, idx) => {
    const content = tokens[idx].content;
    if (/^<demo(?=(\s|>|$))/i.test(content.trim())) {
      const attrs = parseDemoAttr(content)
      if(!attrs.src){
        return ''
      }
      return compatDemo(attrs,md)
    }

    if(/<\/demo/i.test(content.trim())) {
      return '';
    }
    return content
  };

};
