(() => {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    target: 'ko',
    delay: 200,      // 커서가 멈춘 뒤 번역까지의 딜레이(ms)
    maxChars: 600    // 이보다 긴 블록은 커서 위치의 문장만 번역
  };

  const HARD_LIMIT = 1200; // 한 번에 보낼 수 있는 최대 글자수
  const MIN_CHARS = 2;

  let settings = { ...DEFAULTS };

  const FALLBACK_UI = {
    heading: 'Translate to',
    pick: 'Choose language',
    loading: 'Translating…',
    error: 'Translation failed'
  };

  const LANGS =
    (typeof LHT_LANGS !== 'undefined' && LHT_LANGS) ||
    [{ code: 'ko', label: '한국어', ui: FALLBACK_UI }];

  function currentLang() {
    return LANGS.find((l) => l.code === settings.target) || LANGS[0];
  }

  // 선택한 번역 언어에 맞춘 UI 문구
  function t(key) {
    const lang = currentLang();
    return (lang && lang.ui && lang.ui[key]) || FALLBACK_UI[key];
  }

  /* ---------------------------------------------------------------- 말풍선 */

  let host = null;
  let bubble = null;

  function ensureBubble() {
    if (bubble) return bubble;

    host = document.createElement('div');
    host.id = 'lht-host';
    host.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';

    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      .bubble {
        position: fixed;
        max-width: 340px;
        box-sizing: border-box;
        padding: 9px 12px;
        border-radius: 10px;
        background: #1b1f23;
        color: #fff;
        font: 400 13px/1.5 -apple-system, "Segoe UI", "Malgun Gothic", system-ui, sans-serif;
        white-space: pre-wrap;
        word-break: break-word;
        box-shadow: 0 6px 20px rgba(0,0,0,.28);
        opacity: 0;
        transform: translateY(3px);
        transition: opacity .12s ease, transform .12s ease;
        pointer-events: none;
      }
      .bubble.show { opacity: 1; transform: translateY(0); }
      .bubble::after {
        content: "";
        position: absolute;
        left: 12px;
        bottom: -5px;
        width: 10px;
        height: 10px;
        background: #1b1f23;
        transform: rotate(45deg);
        border-radius: 2px;
      }
      .bubble.flip::after { bottom: auto; top: -5px; }
      .src {
        display: block;
        margin-top: 5px;
        font-size: 10px;
        letter-spacing: .04em;
        text-transform: uppercase;
        color: rgba(255,255,255,.45);
      }
      .loading { color: rgba(255,255,255,.6); }
    `;

    bubble = document.createElement('div');
    bubble.className = 'bubble';

    root.append(style, bubble);
    (document.body || document.documentElement).appendChild(host);
    return bubble;
  }

  function place(x, y) {
    const margin = 8;
    const rect = bubble.getBoundingClientRect();

    // 기본: 커서의 우측 상단
    let left = x + 14;
    let top = y - rect.height - 12;
    let flip = false;

    if (left + rect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - rect.width - margin);
    }
    if (top < margin) {
      // 위쪽 공간이 없으면 커서 아래로
      top = y + 20;
      flip = true;
    }

    bubble.classList.toggle('flip', flip);
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }

  function render(content, x, y, opts = {}) {
    ensureBubble();
    bubble.textContent = '';

    const body = document.createElement('span');
    if (opts.loading) body.className = 'loading';
    body.dir = currentLang().rtl ? 'rtl' : 'ltr';
    body.textContent = content;
    bubble.appendChild(body);

    if (opts.src) {
      const tag = document.createElement('span');
      tag.className = 'src';
      tag.textContent = `${opts.src} → ${settings.target}`;
      bubble.appendChild(tag);
    }

    bubble.style.visibility = 'hidden';
    bubble.style.display = 'block';
    place(x, y);
    bubble.style.visibility = 'visible';
    requestAnimationFrame(() => bubble && bubble.classList.add('show'));
  }

  function hide() {
    currentText = null;
    requestId++;
    if (timer) { clearTimeout(timer); timer = null; }
    if (!bubble) return;
    bubble.classList.remove('show');
    bubble.style.display = 'none';
  }

  /* ------------------------------------------------- 왼쪽 언어 선택 패널 */

  let panelHost = null;
  let panelWrap = null;
  let panelList = null;
  let panelCode = null;
  let panelTab = null;
  let panelHead = null;
  let panelOpen = false;

  const PANEL_CSS = `
    .wrap {
      position: fixed;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: flex-start;
      font: 400 13px/1.4 -apple-system, "Segoe UI", "Malgun Gothic", system-ui, sans-serif;
    }
    .tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      width: 34px;
      padding: 9px 0;
      border: 0;
      border-radius: 0 9px 9px 0;
      background: #1b1f23;
      color: #fff;
      font: 700 10px/1 inherit;
      letter-spacing: .03em;
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,.28);
      opacity: .55;
      transition: opacity .15s ease, background .15s ease;
    }
    .wrap:hover .tab, .wrap.open .tab { opacity: 1; }
    .tab:hover { background: #2b3238; }
    .wrap.off .tab { opacity: .3; }
    .globe { font-size: 13px; line-height: 1; }

    .list {
      margin-left: 6px;
      width: 158px;
      max-height: 64vh;
      overflow-y: auto;
      padding: 6px;
      border-radius: 10px;
      background: #fff;
      color: #1b1f23;
      box-shadow: 0 10px 30px rgba(0,0,0,.24);
    }
    .head {
      padding: 4px 8px 7px;
      font-size: 11px;
      color: #767b80;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 6px 8px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .item:hover { background: #eef0f3; }
    .item.active { background: #0a66c2; color: #fff; }
    .item .code { font-size: 11px; opacity: .5; }
    .item.active .code { opacity: .8; }

    @media (prefers-color-scheme: dark) {
      .list { background: #1d2226; color: #e8e9ea; box-shadow: 0 10px 30px rgba(0,0,0,.5); }
      .item:hover { background: #2b3238; }
      .head { color: #8b9096; }
    }
  `;

  function shortCode(code) {
    return code.split('-')[0].toUpperCase();
  }

  function buildPanel() {
    if (panelHost) return;

    panelHost = document.createElement('div');
    panelHost.id = 'lht-panel-host';
    panelHost.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483646;';

    const root = panelHost.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = PANEL_CSS;

    panelWrap = document.createElement('div');
    panelWrap.className = 'wrap';

    panelTab = document.createElement('button');
    const tab = panelTab;
    tab.className = 'tab';
    const globe = document.createElement('span');
    globe.className = 'globe';
    globe.textContent = '🌐';
    panelCode = document.createElement('span');
    panelCode.textContent = shortCode(settings.target);
    tab.append(globe, panelCode);
    tab.addEventListener('click', () => togglePanel(!panelOpen));

    panelList = document.createElement('div');
    panelList.className = 'list';
    panelList.hidden = true;

    panelHead = document.createElement('div');
    panelHead.className = 'head';
    panelList.appendChild(panelHead);

    for (const lang of LANGS) {
      const item = document.createElement('button');
      item.className = 'item';
      item.dataset.code = lang.code;

      const label = document.createElement('span');
      label.textContent = lang.label;
      const code = document.createElement('span');
      code.className = 'code';
      code.textContent = lang.code;
      item.append(label, code);

      item.addEventListener('click', () => {
        settings.target = lang.code;
        chrome.storage.sync.set({ target: lang.code });
        updatePanel();
        togglePanel(false);
        hide();
      });

      panelList.appendChild(item);
    }

    panelWrap.append(tab, panelList);
    root.append(style, panelWrap);
    (document.body || document.documentElement).appendChild(panelHost);

    updatePanel();
  }

  function togglePanel(open) {
    panelOpen = open;
    if (!panelList) return;
    panelList.hidden = !open;
    panelWrap.classList.toggle('open', open);
    if (open) hide(); // 목록을 여는 동안 말풍선은 치운다
  }

  function updatePanel() {
    if (!panelList) return;

    const lang = currentLang();
    panelCode.textContent = shortCode(settings.target);
    panelTab.title = t('pick');
    panelHead.textContent = t('heading');
    panelHead.dir = lang.rtl ? 'rtl' : 'ltr';
    panelWrap.classList.toggle('off', !settings.enabled);
    for (const item of panelList.querySelectorAll('.item')) {
      item.classList.toggle('active', item.dataset.code === settings.target);
    }
  }

  /* --------------------------------------------------------- 텍스트 추출 */

  const SKIP_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'CANVAS', 'IMG', 'VIDEO']);
  const SENTENCE_END = /[.!?。！？…\n]/;

  function isBlock(el) {
    const display = getComputedStyle(el).display;
    return display !== 'inline' && display !== 'contents';
  }

  function nearestBlock(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== document.body) {
      if (isBlock(el)) return el;
      el = el.parentElement;
    }
    return el || null;
  }

  function sentenceAround(str, offset) {
    let start = 0;
    let end = str.length;
    for (let i = Math.min(offset, str.length) - 1; i >= 0; i--) {
      if (SENTENCE_END.test(str[i])) { start = i + 1; break; }
    }
    for (let i = Math.min(offset, str.length); i < str.length; i++) {
      if (SENTENCE_END.test(str[i])) { end = i + 1; break; }
    }
    return str.slice(start, end).trim();
  }

  // 커서 아래에 실제로 글자가 있는지 확인한다. (빈 여백에서는 번역하지 않음)
  function hasGlyphAt(range, x, y) {
    const probe = document.createRange();
    const node = range.startContainer;
    const offset = range.startOffset;
    const from = Math.max(0, offset - 1);
    const to = Math.min(node.length, offset + 1);
    if (from === to) return false;
    probe.setStart(node, from);
    probe.setEnd(node, to);
    for (const r of probe.getClientRects()) {
      if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 2 && y <= r.bottom + 2) return true;
    }
    return false;
  }

  function textAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el || el === host || el === panelHost) return null;
    if (SKIP_TAGS.has(el.tagName)) return null;
    if (el.isContentEditable) return null;

    const caret = document.caretRangeFromPoint
      ? document.caretRangeFromPoint(x, y)
      : null;
    if (!caret || caret.startContainer.nodeType !== Node.TEXT_NODE) return null;
    if (!hasGlyphAt(caret, x, y)) return null;

    const block = nearestBlock(caret.startContainer);
    if (!block) return null;

    let text = (block.innerText || block.textContent || '').replace(/\s+\n/g, '\n').trim();

    if (!text || text.length > settings.maxChars) {
      // 블록이 너무 길면 커서가 놓인 문장만 사용
      text = sentenceAround(caret.startContainer.nodeValue || '', caret.startOffset);
    }

    text = text.slice(0, HARD_LIMIT).trim();
    if (text.length < MIN_CHARS) return null;
    if (!/[\p{L}\p{N}]/u.test(text)) return null; // 아이콘·기호만 있는 경우 제외

    return text;
  }

  /* ------------------------------------------------------------ 동작 흐름 */

  let timer = null;
  let requestId = 0;
  let currentText = null;
  let lastX = -1;
  let lastY = -1;

  async function run(x, y) {
    const text = textAt(x, y);

    if (!text) { hide(); return; }
    if (text === currentText) return; // 같은 문단 위를 움직이는 중 → 유지

    currentText = text;
    const id = ++requestId;

    render(t('loading'), x, y, { loading: true });

    let res;
    try {
      res = await chrome.runtime.sendMessage({ type: 'translate', text, target: settings.target });
    } catch (err) {
      hide(); // 확장 프로그램이 리로드된 경우 등
      return;
    }

    if (id !== requestId) return; // 그 사이 커서가 다른 곳으로 이동

    if (!res || res.error || !res.text) {
      render(t('error'), x, y, { loading: true });
      return;
    }
    if (res.src && res.src === settings.target) { hide(); return; } // 이미 목표 언어

    render(res.text, x, y, { src: res.src });
  }

  document.addEventListener(
    'mousemove',
    (e) => {
      if (!settings.enabled) return;
      if (Math.abs(e.clientX - lastX) < 3 && Math.abs(e.clientY - lastY) < 3) return;

      lastX = e.clientX;
      lastY = e.clientY;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => run(lastX, lastY), Math.max(0, Number(settings.delay) || 0));
    },
    true
  );

  document.addEventListener('mouseleave', hide, true);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, true);
  window.addEventListener('wheel', hide, { passive: true });

  document.addEventListener(
    'mousedown',
    (e) => {
      // 패널 내부 클릭은 섀도 호스트가 타깃으로 잡힌다.
      if (e.target === panelHost) return;
      hide();
      if (panelOpen) togglePanel(false);
    },
    true
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape') return;
      hide();
      if (panelOpen) togglePanel(false);
    },
    true
  );

  /* ------------------------------------------------------------------ 초기화 */

  buildPanel();

  chrome.storage.sync.get(DEFAULTS, (stored) => {
    if (chrome.runtime.lastError) return;
    settings = { ...DEFAULTS, ...stored };
    updatePanel();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    for (const key of Object.keys(changes)) settings[key] = changes[key].newValue;
    if (!settings.enabled || changes.target) hide(); // 언어가 바뀌면 다음 호버에서 다시 번역
    updatePanel();
  });
})();
