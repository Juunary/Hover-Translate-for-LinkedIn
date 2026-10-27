const DEFAULTS = { enabled: true, selection: true, target: 'ko', delay: 200, maxChars: 600 };

const fields = {
  enabled: document.getElementById('enabled'),
  selection: document.getElementById('selection'),
  target: document.getElementById('target'),
  delay: document.getElementById('delay'),
  maxChars: document.getElementById('maxChars')
};

for (const lang of LHT_LANGS) {
  const option = document.createElement('option');
  option.value = lang.code;
  option.textContent = lang.label;
  fields.target.appendChild(option);
}

chrome.storage.sync.get(DEFAULTS, (stored) => {
  const s = { ...DEFAULTS, ...stored };
  fields.enabled.checked = s.enabled;
  fields.selection.checked = s.selection;
  fields.target.value = s.target;
  fields.delay.value = s.delay;
  fields.maxChars.value = s.maxChars;
});

function save() {
  chrome.storage.sync.set({
    enabled: fields.enabled.checked,
    selection: fields.selection.checked,
    target: fields.target.value,
    delay: Math.min(3000, Math.max(0, Number(fields.delay.value) || DEFAULTS.delay)),
    maxChars: Math.min(1200, Math.max(80, Number(fields.maxChars.value) || DEFAULTS.maxChars))
  });
}

for (const el of Object.values(fields)) {
  el.addEventListener('change', save);
}
