import DOMPurify from 'dompurify';

export function sanitizeEmailHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  const config = {
    ALLOWED_TAGS: [
      'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
      'blockquote', 'br', 'button', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
      'data', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption',
      'figure', 'font', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr',
      'i', 'img', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'nav',
      'ol', 'p', 'pre', 'q', 's', 'samp', 'section', 'small', 'span', 'strong', 'style',
      'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time',
      'tr', 'u', 'ul', 'var', 'video', 'wbr'
    ],

    ALLOWED_ATTR: [
      'accept', 'action', 'align', 'alt', 'autocomplete', 'background', 'bgcolor',
      'border', 'cellpadding', 'cellspacing', 'charset', 'class', 'colspan', 'color',
      'cols', 'content', 'coords', 'datetime', 'dir', 'disabled', 'download', 'enctype',
      'for', 'form', 'headers', 'height', 'hidden', 'href', 'hreflang', 'id', 'lang',
      'list', 'max', 'maxlength', 'media', 'method', 'min', 'multiple', 'name',
      'placeholder', 'readonly', 'rel', 'required', 'role', 'rowspan', 'rows', 'scope',
      'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcset', 'start', 'step',
      'style', 'summary', 'tabindex', 'target', 'title', 'type', 'usemap', 'valign',
      'value', 'width', 'wrap'
    ],

    ALLOW_DATA_ATTR: true,

    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|data|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    KEEP_CONTENT: true,

    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,

    FORCE_BODY: false,
    SANITIZE_DOM: true,
    SANITIZE_STYLE: true,
  };

  return DOMPurify.sanitize(html, config) as string;
}
