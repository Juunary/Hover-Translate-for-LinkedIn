// 콘텐츠 스크립트와 팝업이 함께 쓰는 언어 목록.
// ui: 선택한 언어에 맞춰 보여줄 UI 문구.
var LHT_LANGS = [
  {
    code: 'ko',
    label: '한국어',
    ui: { heading: '번역할 언어', pick: '번역 언어 선택', loading: '번역 중…', error: '번역 실패' }
  },
  {
    code: 'en',
    label: 'English',
    ui: { heading: 'Translate to', pick: 'Choose language', loading: 'Translating…', error: 'Translation failed' }
  },
  {
    code: 'ja',
    label: '日本語',
    ui: { heading: '翻訳する言語', pick: '言語を選択', loading: '翻訳中…', error: '翻訳に失敗しました' }
  },
  {
    code: 'zh-CN',
    label: '中文(简体)',
    ui: { heading: '翻译为', pick: '选择语言', loading: '翻译中…', error: '翻译失败' }
  },
  {
    code: 'zh-TW',
    label: '中文(繁體)',
    ui: { heading: '翻譯為', pick: '選擇語言', loading: '翻譯中…', error: '翻譯失敗' }
  },
  {
    code: 'es',
    label: 'Español',
    ui: { heading: 'Traducir a', pick: 'Elegir idioma', loading: 'Traduciendo…', error: 'Error de traducción' }
  },
  {
    code: 'fr',
    label: 'Français',
    ui: { heading: 'Traduire en', pick: 'Choisir la langue', loading: 'Traduction…', error: 'Échec de la traduction' }
  },
  {
    code: 'de',
    label: 'Deutsch',
    ui: { heading: 'Übersetzen nach', pick: 'Sprache wählen', loading: 'Übersetzen…', error: 'Übersetzung fehlgeschlagen' }
  },
  {
    code: 'it',
    label: 'Italiano',
    ui: { heading: 'Traduci in', pick: 'Scegli lingua', loading: 'Traduzione…', error: 'Traduzione non riuscita' }
  },
  {
    code: 'pt',
    label: 'Português',
    ui: { heading: 'Traduzir para', pick: 'Escolher idioma', loading: 'Traduzindo…', error: 'Falha na tradução' }
  },
  {
    code: 'ru',
    label: 'Русский',
    ui: { heading: 'Перевести на', pick: 'Выбрать язык', loading: 'Перевод…', error: 'Ошибка перевода' }
  },
  {
    code: 'ar',
    label: 'العربية',
    rtl: true,
    ui: { heading: 'الترجمة إلى', pick: 'اختر اللغة', loading: '…جارٍ الترجمة', error: 'فشلت الترجمة' }
  },
  {
    code: 'he',
    label: 'עברית',
    rtl: true,
    ui: { heading: 'תרגם ל', pick: 'בחר שפה', loading: '…מתרגם', error: 'התרגום נכשל' }
  },
  {
    code: 'hi',
    label: 'हिन्दी',
    ui: { heading: 'इसमें अनुवाद करें', pick: 'भाषा चुनें', loading: 'अनुवाद हो रहा है…', error: 'अनुवाद विफल' }
  },
  {
    code: 'th',
    label: 'ไทย',
    ui: { heading: 'แปลเป็น', pick: 'เลือกภาษา', loading: 'กำลังแปล…', error: 'แปลไม่สำเร็จ' }
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    ui: { heading: 'Dịch sang', pick: 'Chọn ngôn ngữ', loading: 'Đang dịch…', error: 'Dịch thất bại' }
  },
  {
    code: 'id',
    label: 'Indonesia',
    ui: { heading: 'Terjemahkan ke', pick: 'Pilih bahasa', loading: 'Menerjemahkan…', error: 'Terjemahan gagal' }
  }
];

if (typeof window !== 'undefined') window.LHT_LANGS = LHT_LANGS;
