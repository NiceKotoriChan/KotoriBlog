(function () {
  var HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  var ATTR_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

  function escapeHtml(value) {
    return String(value).replace(/[&<>]/g, function (c) { return HTML_ESC[c]; });
  }

  function escapeAttr(value) {
    return String(value).replace(/[&<>"]/g, function (c) { return ATTR_ESC[c]; });
  }

  function slugify(text) {
    var slug = String(text).trim().toLowerCase()
      .replace(/[`*_~[\]()#!>+.,:;'"“”‘’？！，。、·]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug || 'section';
  }

  function plain(text) {
    return String(text)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/[`*_~]/g, '');
  }

  var RE_COMMENT_JS = '(?:\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)';
  var RE_COMMENT_HASH = '(?:#[^\\n]*)';
  var RE_STRING = '(?:"(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)';
  var RE_NUMBER = '(?:\\b0[xX][0-9a-fA-F]+\\b|\\b\\d+(?:\\.\\d+)*\\b)';
  var KEYWORDS = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'await', 'async',
    'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'delete', 'this', 'super', 'yield', 'in', 'of',
    'def', 'elif', 'lambda', 'pass', 'raise', 'with', 'as', 'None', 'True', 'False', 'and', 'or', 'not', 'self',
    'fn', 'pub', 'use', 'impl', 'struct', 'enum', 'match', 'mut', 'mod', 'go', 'defer', 'package', 'func',
    'type', 'range', 'chan', 'echo', 'exit', 'cd', 'ls', 'cat', 'rm', 'mkdir', 'cp', 'mv', 'git', 'npm',
    'node', 'curl', 'sudo', 'then', 'fi', 'done', 'select', 'insert', 'update', 'where'
  ];
  var RE_KEYWORD = '(?:\\b(?:' + KEYWORDS.join('|') + ')\\b)';

  var HASH_LANGS = { py: 1, python: 1, sh: 1, bash: 1, shell: 1, zsh: 1, yaml: 1, yml: 1, toml: 1, rb: 1, ruby: 1, conf: 1, ini: 1, r: 1 };
  var PLAIN_LANGS = { '': 1, text: 1, txt: 1, html: 1, xml: 1, css: 1, scss: 1, md: 1, markdown: 1, diff: 1, json: 1, jsonc: 1, plain: 1 };

  function highlight(code, lang) {
    if (PLAIN_LANGS[lang]) return escapeHtml(code);
    var comment = HASH_LANGS[lang] ? RE_COMMENT_HASH : RE_COMMENT_JS;
    var re = new RegExp('(' + comment + ')|(' + RE_STRING + ')|(' + RE_NUMBER + ')|(' + RE_KEYWORD + ')', 'g');
    return escapeHtml(code).replace(re, function (match, com, str, num, kw) {
      if (com) return '<span class="tok-com">' + com + '</span>';
      if (str) return '<span class="tok-str">' + str + '</span>';
      if (num) return '<span class="tok-num">' + num + '</span>';
      if (kw) return '<span class="tok-kw">' + kw + '</span>';
      return match;
    });
  }

  function renderCode(code, lang) {
    var label = lang || 'text';
    return [
      '<figure class="code">',
      '<figcaption class="code-head">',
      '<span class="code-lang">' + escapeHtml(label) + '</span>',
      '<button class="code-copy" type="button" data-copy>copy</button>',
      '</figcaption>',
      '<pre><code class="language-' + escapeAttr(label) + '">' + highlight(code, lang) + '</code></pre>',
      '</figure>'
    ].join('');
  }

  function indentOf(line) {
    return line.match(/^[ \t]*/)[0].replace(/\t/g, '  ').length;
  }

  function isBlockStart(line) {
    if (!line.trim()) return false;
    if (/^#{1,6}\s+/.test(line)) return true;
    if (/^\s*(?:`{3,}|~{3,})/.test(line)) return true;
    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) return true;
    if (/^\s{0,3}>/.test(line)) return true;
    if (/^\s{0,3}(?:[-*+]|\d+[.)])\s+/.test(line)) return true;
    return false;
  }

  function inline(text) {
    var out = escapeHtml(text);
    var codes = [];
    out = out.replace(/`([^`\n]+)`/g, function (match, code) {
      codes.push(code);
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (match, alt, src, title) {
      return '<img src="' + escapeAttr(src) + '" alt="' + escapeAttr(alt) + '"' +
        (title ? ' title="' + escapeAttr(title) + '"' : '') + ' loading="lazy">';
    });
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, function (match, label, href, title) {
      var external = /^https?:/i.test(href);
      return '<a href="' + escapeAttr(href) + '"' + (title ? ' title="' + escapeAttr(title) + '"' : '') +
        (external ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
    });
    out = out.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, function (match, pre, url) {
      return pre + '<a href="' + escapeAttr(url) + '" target="_blank" rel="noopener">' + url + '</a>';
    });
    out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    out = out.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    out = out.replace(/\u0000(\d+)\u0000/g, function (match, index) {
      return '<code>' + codes[Number(index)] + '</code>';
    });
    return out;
  }

  function splitRow(row) {
    var line = row.trim();
    if (line.charAt(0) === '|') line = line.slice(1);
    if (line.slice(-1) === '|') line = line.slice(0, -1);
    return line.split('|').map(function (cell) { return cell.trim(); });
  }

  function parseList(lines, start) {
    var head = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    var indent = head[1].length;
    var ordered = /\d/.test(head[2]);
    var startNum = ordered ? parseInt(head[2], 10) : 1;
    var items = [];
    var i = start;

    while (i < lines.length) {
      var m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
      if (!m || m[1].length !== indent) break;
      var block = [m[3]];
      var j = i + 1;
      while (j < lines.length) {
        var line = lines[j];
        if (!line.trim()) {
          var k = j + 1;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && indentOf(lines[k]) > indent) {
            block.push('');
            j++;
            continue;
          }
          break;
        }
        if (indentOf(line) > indent) {
          block.push(line.slice(Math.min(indentOf(line), indent + 3)));
          j++;
          continue;
        }
        break;
      }
      items.push(block);
      i = j;
      var next = i;
      while (next < lines.length && !lines[next].trim()) next++;
      if (!(next < lines.length && indentOf(lines[next]) === indent && /^\s*(?:[-*+]|\d+[.)])\s+/.test(lines[next]))) break;
      i = next;
    }

    var rendered = items.map(function (block) {
      var first = block[0];
      var rest = block.slice(1);
      var task = first.match(/^\[([ xX])\]\s+(.*)$/);
      var body;
      var cls = '';
      if (task) {
        var checked = task[1].toLowerCase() === 'x';
        cls = ' class="task-item' + (checked ? ' done' : '') + '"';
        body = '<span class="box">' + (checked ? 'x' : ' ') + '</span>' + inline(task[2]);
      } else {
        body = inline(first);
      }
      if (rest.some(function (line) { return line.trim(); })) body += renderBlocks(rest).html;
      return '<li' + cls + '>' + body + '</li>';
    }).join('\n');

    var tag = ordered ? 'ol' : 'ul';
    var startAttr = ordered && startNum !== 1 ? ' start="' + startNum + '"' : '';
    return { html: '<' + tag + startAttr + '>\n' + rendered + '\n</' + tag + '>', next: i };
  }

  function renderBlocks(lines) {
    var out = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }

      var fence = line.match(/^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/);
      if (fence) {
        var marker = fence[1].charAt(0);
        var lang = (fence[2] || '').toLowerCase();
        var buf = [];
        i++;
        var closeRe = new RegExp('^\\s*' + (marker === '`' ? '`' : '~') + '{3,}\\s*$');
        while (i < lines.length && !closeRe.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++;
        out.push(renderCode(buf.join('\n'), lang));
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (heading) {
        var level = heading[1].length;
        var text = heading[2];
        var id = slugify(plain(text));
        out.push('<h' + level + ' id="' + escapeAttr(id) + '"><a class="anchor" href="#' + escapeAttr(id) +
          '" aria-hidden="true">#</a>' + inline(text) + '</h' + level + '>');
        i++;
        continue;
      }

      if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        out.push('<hr>');
        i++;
        continue;
      }

      if (/^\s{0,3}>/.test(line)) {
        var quote = [];
        while (i < lines.length) {
          if (/^\s{0,3}>/.test(lines[i])) {
            quote.push(lines[i].replace(/^\s{0,3}>\s?/, ''));
            i++;
          } else if (!lines[i].trim() && i + 1 < lines.length && /^\s{0,3}>/.test(lines[i + 1])) {
            quote.push('');
            i++;
          } else {
            break;
          }
        }
        out.push('<blockquote>' + renderBlocks(quote).html + '</blockquote>');
        continue;
      }

      if (/^\s{0,3}(?:[-*+]|\d+[.)])\s+/.test(line)) {
        var list = parseList(lines, i);
        out.push(list.html);
        i = list.next;
        continue;
      }

      var nextLine = lines[i + 1] || '';
      if (line.indexOf('|') >= 0 && /^[\s|:-]+$/.test(nextLine) && nextLine.indexOf('-') >= 0 && nextLine.indexOf('|') >= 0) {
        var header = splitRow(line);
        var aligns = splitRow(nextLine).map(function (cell) {
          var left = cell.charAt(0) === ':';
          var right = cell.slice(-1) === ':';
          if (left && right) return 'center';
          if (right) return 'right';
          if (left) return 'left';
          return '';
        });
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') >= 0) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        var alignAttr = function (index) {
          return aligns[index] ? ' style="text-align:' + aligns[index] + '"' : '';
        };
        var head = header.map(function (cell, index) {
          return '<th' + alignAttr(index) + '>' + inline(cell) + '</th>';
        }).join('');
        var body = rows.map(function (row) {
          return '<tr>' + header.map(function (_, index) {
            return '<td' + alignAttr(index) + '>' + inline(row[index] || '') + '</td>';
          }).join('') + '</tr>';
        }).join('\n');
        out.push('<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>\n' + body + '\n</tbody></table></div>');
        continue;
      }

      var para = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
        para.push(lines[i].trim());
        i++;
      }
      if (!para.length) {
        para.push(lines[i].trim());
        i++;
      }
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }

    return { html: out.join('\n') };
  }

  function render(source) {
    var lines = String(source).replace(/\r\n?/g, '\n').split('\n');
    return renderBlocks(lines).html;
  }

  window.Markdown = { render: render, escapeHtml: escapeHtml, escapeAttr: escapeAttr };
})();
