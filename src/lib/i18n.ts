import { useSyncExternalStore } from 'react';
import { Platform, Text, TextInput } from 'react-native';

/*
 * ═══ TIL: O'zbekcha (lotin) · Ўзбекча (kirill) · Русский ═══
 *
 * Til Lokma Go'dan keladi (src/lib/lokma.tsx → setLang). Matnlar kodda
 * o'zbekcha (lotin) yoziladi — shu manba til.
 *   • uzc — algoritmik transliteratsiya (o‘/g‘/sh/ch/ya/yo/yu/ъ qoidalari)
 *     — har qanday matn, jumladan serverdan kelganlar ham;
 *   • ru  — lug'at (RU) + andozalar (PATTERNS) + so'z lug'ati (WORDS);
 *     topilmagan so'z o'zgarishsiz qoladi (nomlar: "Navro'z Saroyi").
 *
 * Vebda <Text> va <TextInput placeholder> avtomatik tarjima qilinadi
 * (installAutoTranslate) — har bir komponentni qo'lda o'zgartirish shart emas
 * va til almashganda sahifa qayta yuklanmasdan darhol yangilanadi.
 */
export type Lang = 'uz' | 'uzc' | 'ru';

let current: Lang = 'uz';
const listeners = new Set<() => void>();
export const getLang = () => current;
export function setLang(l: string | undefined) {
  const next: Lang = l === 'ru' || l === 'uzc' ? l : 'uz';
  if (next === current) return;
  current = next;
  listeners.forEach((fn) => fn());
}
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
/** Til o'zgarganda komponentni qayta chizadi */
export const useLang = () => useSyncExternalStore(subscribe, getLang, getLang);

/* ───────────── Normallashtirish ───────────── */
// o‘ ʻ ’ ʼ ` → ' (kalit va matn bir xil ko'rinishga keltiriladi)
const norm = (s: string) => s.replace(/[‘’ʻʼ`´]/g, "'");

/* ───────────── Lotin → Kirill ───────────── */
const VOW = 'aeiouoAEIOU';
const CYR: Record<string, string> = {
  a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о',
  p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', x: 'х', y: 'й', z: 'з', e: 'е', c: 'ц',
};
function keepCase(src: string, out: string, nextSrc = '') {
  if (src === src.toLowerCase()) return out;
  // "SH" (hammasi katta) → "Ш"; "Sh" → "Ш"; ikki harfli chiqish: "Нг" / "НГ"
  const allCaps = /[A-Z]/.test(nextSrc) && nextSrc === nextSrc.toUpperCase();
  return allCaps ? out.toUpperCase() : out[0].toUpperCase() + out.slice(1);
}
export function toCyr(input: string): string {
  const s = norm(input);
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    const low = ch.toLowerCase();
    const next = (s[i + 1] || '').toLowerCase();
    const prev = (s[i - 1] || '').toLowerCase();
    const wordStart = !/[a-z']/i.test(prev) || i === 0;
    const isLetter = /[a-z]/i.test(ch);
    if (!isLetter) {
      // ' : o'/g' ishlangan (pastda); so'z ichida unlidan keyin — ъ
      if (ch === "'") out += /[aeiou]/i.test(prev) && /[a-z]/i.test(next) ? 'ъ' : '';
      else out += ch;
      continue;
    }
    const two = low + next;
    const after = s[i + 2] || '';
    const nx = s[i + 1] || '';
    if (two === "o'") { out += keepCase(ch, 'ў', nx); i += 1; continue; }
    if (two === "g'") { out += keepCase(ch, 'ғ', nx); i += 1; continue; }
    if (two === 'sh') { out += keepCase(ch, 'ш', nx); i += 1; continue; }
    if (two === 'ch') { out += keepCase(ch, 'ч', nx); i += 1; continue; }
    // qo'ng'iroq: "ng'" — n alohida, g' → ғ
    if (two === 'ng' && after === "'") { out += keepCase(ch, 'н', nx); continue; }
    if (two === 'ng') { out += keepCase(ch, 'нг', nx); i += 1; continue; }
    // yo'l → йўл (yo + apostrof: y alohida)
    if (two === 'yo' && after !== "'") { out += keepCase(ch, 'ё', nx); i += 1; continue; }
    if (two === 'ya') { out += keepCase(ch, 'я', nx); i += 1; continue; }
    if (two === 'yu') { out += keepCase(ch, 'ю', nx); i += 1; continue; }
    if (low === 'e') { out += keepCase(ch, wordStart || VOW.includes(prev) ? 'э' : 'е', nx); continue; }
    out += keepCase(ch, CYR[low] ?? ch, nx);
  }
  return out;
}

/* ───────────── Ruscha lug'at ───────────── */
const RU: Record<string, string> = {
  // Menyu, sarlavhalar
  "To'yxonalar": 'Залы', 'Xarita': 'Карта', 'Saralangan': 'Избранное', 'Profil': 'Профиль',
  "Saralanganlar": 'Избранное', 'Bron': 'Бронь', 'Bronlar': 'Брони',
  // Bosh sahifa
  "3 kun ichida bo'sh": 'Свободно в ближайшие 3 дня',
  'Hammasi': 'Все', "Bugun bo'sh": 'Свободно сегодня', "150 ming gacha": 'До 150 тыс.', "500+ mehmon": '500+ гостей', 'Parking': 'Парковка',
  'Eng yaqini birinchi': 'Сначала ближайшие', 'Arzonidan': 'Сначала дешёвые', 'Qimmatidan': 'Сначала дорогие', "Reyting bo'yicha": 'По рейтингу',
  "To'yxona nomi yoki tuman": 'Название зала или район', "To'yxona qidirish": 'Поиск зала', 'Qidirish': 'Поиск',
  'Hududni tanlash': 'Выбрать регион', 'Mening manzilim': 'Мой адрес', 'Tanlangan hudud': 'Выбранный регион',
  "Barcha to'yxonalar": 'Все залы', 'Joylashuv': 'Местоположение', 'Joylashuv aniqlanmoqda…': 'Определяем местоположение…', 'Joylashuv aniqlanmadi': 'Местоположение не определено',
  'Filtr va saralash': 'Фильтр и сортировка', 'Filtrni tozalash': 'Сбросить фильтр', "Bu filtr bo'yicha to'yxona topilmadi": 'По этому фильтру залы не найдены',
  'Bekor': 'Отмена', 'Radiusni 50 km qilish': 'Увеличить радиус до 50 км',
  // Hudud oynasi
  "Qayerdagi to'yxonalar?": 'Залы в каком регионе?', 'Mening manzillarim': 'Мои адреса', 'Joriy joylashuv': 'Текущее местоположение',
  'Telefon GPS orqali': 'По GPS телефона', "Butun O'zbekiston": 'Весь Узбекистан', "Barcha to'yxonalar ": 'Все залы',
  "Boshqa hudud (masalan, tug'ilgan joyingiz)": 'Другой регион (например, ваш родной город)', 'barcha hududlar': 'все регионы',
  "butun O'zbekiston bo'yicha": 'по всему Узбекистану',
  // Filtr
  'Filtr': 'Фильтр', 'Tadbir turi': 'Тип мероприятия', 'Radius': 'Радиус', 'Saralash': 'Сортировка', "Ko'rsatish": 'Показать', 'Eng yaqin': 'Ближайшие',
  'Nahorgi osh': 'Утренний плов', "Nikoh to'yi": 'Никох (свадьба)', "Kunduzgi to'y": 'Дневная свадьба', "Kechki to'y": 'Вечерняя свадьба',
  'Kunduzgi': 'Дневной', 'Kechki': 'Вечерний', 'Kunduzgi / Vecher': 'Дневной / Вечерний', 'Maxsus tadbir': 'Особое мероприятие', 'Tadbir': 'Мероприятие',
  // Karta
  "so'm / kishi": 'сум / чел.', "so'm dan": 'сум и выше', 'Ochish': 'Открыть',
  "Saralanganlardan olib tashlash": 'Убрать из избранного', "Saralanganlarga qo'shish": 'Добавить в избранное',
  // Sahifa
  "Bo'sh kun va seansni tanlang": 'Выберите свободный день и сеанс', 'Bron qilish': 'Забронировать', 'Qulayliklar': 'Удобства',
  "Bo'sh": 'Свободно', 'Band qilinmoqda': 'Бронируется', "Bo'sh kunlar": 'Свободные дни', "Hammasi bo'sh": 'Всё свободно',
  'Qisman band': 'Частично занято', "To'liq band": 'Полностью занято', "o'tgan": "прошедший", "hammasi bo'sh": 'всё свободно', "to'liq band": 'полностью занято',
  'Oldingi oy': 'Предыдущий месяц', 'Keyingi oy': 'Следующий месяц', 'Oldingi surat': 'Предыдущее фото', 'Keyingi surat': 'Следующее фото',
  'nuqtalar: nahor · kunduz · kechki': 'точки: утро · день · вечер',
  'Menyu va narx': 'Меню и цена', 'Mehmonlar': 'Гости', "Ko'paytirish": 'Увеличить', 'Hisob': 'Расчёт', 'Jami': 'Итого',
  'Avansni': 'Аванс', "ixtiyoriy · 1 tasini tanlang": 'по желанию · выберите 1', '✓ Tanlandi': '✓ Выбрано',
  // Bron
  "Bronni tasdiqlang": 'Подтвердите бронь', 'Ism': 'Имя', 'Telefon': 'Телефон', "Telefon raqamni to'liq kiriting": 'Введите номер телефона полностью',
  "Avansni to'lash": 'Оплатить аванс', 'Bron qabul qilindi': 'Бронь принята',
  // Holatlar
  'Yuklanmoqda…': 'Загрузка…', 'Qayta urinish': 'Повторить', "Ma'lumotni yuklab bo'lmadi": 'Не удалось загрузить данные',
  'Sahifa topilmadi': 'Страница не найдена', 'Bosh sahifaga qaytish': 'На главную', 'Joylashuvimga qaytish': 'К моему местоположению',
  "Xaritada ochish ↗": 'Открыть на карте ↗',
  "Hali saralangan to'yxona yo'q": 'Пока нет избранных залов', "Kartadagi ♡ belgisini bosib saqlab qo'ying": 'Нажмите ♡ на карточке, чтобы сохранить',
  // Bosh sahifa (yangi dizayn)
  'ORZULARINGIZDAGI': 'ВАША МЕЧТА', "To'yingiz uchun\neng yaxshi joy": 'Лучшее место\nдля вашей свадьбы',
  "Biz bilan har bir lahza\nunutilmas bo'ladi ✨": 'С нами каждый миг\nстанет незабываемым ✨', "To'yxonalarni ko'rish": 'Смотреть залы',
  'Katta va kichik zallar': 'Большие и малые залы', 'Banket zallari': 'Банкетные залы',
  'Bayram va tadbirlar uchun': 'Для праздников и мероприятий', 'Tantanalar': 'Торжества', 'Nikoh, sunnat, korporativ': 'Никох, суннат, корпоратив',
  'Sevimlilar': 'Избранное', 'Saqlangan joylar': 'Сохранённые места', "To'yxonalar, shahar, tuman...": 'Залы, город, район...',
  'Barcha': 'Все', 'Barchasi': 'Все', "Mashhur to'yxonalar": 'Популярные залы', 'Top tanlov': 'Топ выбор',
  'Eng yaxshi birinchi': 'Сначала лучшие', 'dan boshlab': 'от', 'Yaqin kunlarda band': 'Ближайшие дни заняты', 'Tezkor': 'Быстрые',
  // Lokma tugmalari
  'Lokma Go': 'Lokma Go', 'Lokma Market': 'Lokma Market', 'Restoran va taomlar': 'Рестораны и блюда', "Oziq-ovqat do'konlari": 'Продуктовые магазины',
  // Profil
  'Manzil': 'Адрес', "Do'stlarni taklif qiling": 'Пригласите друзей', 'Til': 'Язык', 'Bronlarim': 'Мои брони', "To'yxona bronlari tarixi": 'История броней залов',
  'Saralangan to‘yxonalar': 'Избранные залы', "Saqlangan to'yxonalar": 'Сохранённые залы', 'Sozlamalar': 'Настройки', 'Mening manzillarim ': 'Мои адреса',
  "Qo'shish": 'Добавить', 'Saqlash': 'Сохранить', 'Taklif qilingan': 'Приглашено', 'Ballar': 'Баллы', "Do'stlarga yuborish": 'Отправить друзьям', 'Nusxalash': 'Копировать',
  'Ism familiya': 'Имя и фамилия', 'Familiya': 'Фамилия', 'Telefon raqam': 'Номер телефона', "Telefon kiriting": 'Укажите телефон',
  "Manzil nomi": 'Название адреса', "To'liq manzil": 'Полный адрес', 'Uy': 'Дом', 'Ish': 'Работа', 'Boshqa': 'Другое',
  "Asosiy qilish": 'Сделать основным', 'Asosiy': 'Основной', "O'chirish": 'Удалить', "Hali manzil yo'q": 'Адресов пока нет',
  "Hali bron yo'q": 'Броней пока нет', "To'yxona tanlang va birinchi bronni qiling": 'Выберите зал и сделайте первую бронь',
  'Bronni bekor qilish': 'Отменить бронь', "Bron bekor qilindi": 'Бронь отменена', 'Kutilmoqda': 'Ожидает', 'Tasdiqlangan': 'Подтверждена', 'Bekor qilingan': 'Отменена', "O'tgan": 'Прошедшая',
  "Bronlarni ko'rish uchun profilda telefon raqamingizni kiriting": 'Чтобы увидеть брони, укажите номер телефона в профиле',
  'Lokma Go orqali oching': 'Откройте через Lokma Go', 'Mehmon': 'Гость', 'Avans': 'Аванс', 'Menyu': 'Меню', 'Zal': 'Зал', 'Sana': 'Дата', 'Seans': 'Сеанс',
  'Taklif': 'Приглашение', 'Havola nusxalandi': 'Ссылка скопирована', 'Telefon raqamingizni profilda kiriting': 'Укажите номер телефона в профиле',
  "Har bir do'stingiz kanalga obuna bo'lib qo'shilsa — ikkalangizga ham ball beriladi. Ballar hozircha to'planadi, keyinchalik pul qiymati e'lon qilinadi.":
    'Когда ваш друг подпишется на канал, баллы получите вы оба. Пока баллы копятся, их денежная стоимость будет объявлена позже.',
  "Profil Lokma Go orqali ochiladi": 'Профиль открывается через Lokma Go', "Ismni kiriting": 'Введите имя', "Manzilni to'liq kiriting": 'Введите адрес полностью',
  "Bronlar Lokma profilingizdagi telefon raqami bo'yicha ko'rsatiladi": 'Брони показываются по номеру телефона из вашего профиля Lokma',
  'Telefon raqami kerak': 'Нужен номер телефона',
  "Profilga o'tish": 'Перейти в профиль', 'Javob kelmadi, qayta urinib ko‘ring': 'Нет ответа, повторите попытку',
  Du: 'Пн', Se: 'Вт', Ch: 'Ср', Pa: 'Чт', Ju: 'Пт', Sh: 'Сб', Ya: 'Вс',
  'Orqaga': 'Назад', 'Yopish': 'Закрыть', 'Tozalash': 'Очистить', 'Qo‘shilmoqda…': 'Добавляется…', 'Saqlanmoqda…': 'Сохраняется…',
};

/* So'z lug'ati — dinamik matnlar uchun (RU) */
const WORDS: Record<string, string> = {
  bugun: 'сегодня', ertaga: 'завтра', kecha: 'вчера', nahor: 'утро', kunduz: 'день', kechki: 'вечер', kunduzgi: 'дневной', nahorgi: 'утренний', osh: 'плов',
  "bo'sh": 'свободно', band: 'занято', "so'm": 'сум', km: 'км', kishi: 'чел.', mehmon: 'гостей', dan: 'и выше', gacha: 'до', ming: 'тыс.',
  dushanba: 'понедельник', seshanba: 'вторник', chorshanba: 'среда', payshanba: 'четверг', juma: 'пятница', shanba: 'суббота', yakshanba: 'воскресенье',
  surat: 'фото', rasmlar: 'фото', zal: 'зал', katta: 'большой', kichik: 'малый', tumani: 'район', "ko'chasi": 'улица', tuman: 'район', shahri: 'город', shahar: 'город',
  konditsioner: 'Кондиционер', sahna: 'Сцена', 'jonli musiqa': 'Живая музыка', parking: 'Парковка', avtoturargoh: 'Автопарковка', "wi-fi": 'Wi-Fi', premium: 'Премиум', standart: 'Стандарт', vip: 'VIP',
  oy: 'мес.', yil: 'г.', kun: 'дн.', 'kun ichida': 'дн.', atrofingizda: 'вокруг вас', atrofi: 'вокруг',
};

const MONTHS_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const MONTHS_RU_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_RU_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const SHORT_WD_UZ = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
const SHORT_WD_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10; const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

/* Andozalar (dinamik, raqamli matnlar) */
const mIdx = (name: string) => MONTHS_UZ.indexOf(name.toLowerCase());
const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\+([\d\s]+) ball$/, (m) => `+${m[1]} баллов`],
  [/^Menyu: (.+)$/, (m) => `Меню: ${trWords(m[1])}`],
  [/^Sabab: (.+)$/, (m) => `Причина: ${m[1]}`],
  [/^(.+) \| (.+)$/, (m) => `${trWords(m[1])} | ${m[2]}`],
  [/^(\d+) ta to'yxona$/, (m) => `${m[1]} ${plural(+m[1], 'зал', 'зала', 'залов')}`],
  [/^(\d+) km atrofingizda$/, (m) => `в радиусе ${m[1]} км`],
  [/^(\d+) km atrofi$/, (m) => `${m[1]} км вокруг`],
  [/^(\d+) km radiusda$/, (m) => `в радиусе ${m[1]} км`],
  [/^Bo'sh: (.+), (.+)$/, (m) => `Свободно: ${trWords(m[1])}, ${trWords(m[2])}`],
  [/^Bugun · (.+)$/, (m) => `Сегодня · ${trWords(m[1])}`],
  [/^([\d.,]+) km · ([\d\s.,]+) so'm dan$/, (m) => `${m[1]} км · от ${m[2]} сум`],
  [/^([\d.,]+) km · ([\d\s.,]+) so'm$/, (m) => `${m[1]} км · ${m[2]} сум`],
  [/^([\d\s.,]+) so'm$/, (m) => `${m[1]} сум`],
  [/^([\d\s.,]+) so'm \/ kishi$/, (m) => `${m[1]} сум / чел.`],
  [/^(\d+)-(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr), (\S+)$/i, (m) => `${m[1]} ${MONTHS_RU_GEN[mIdx(m[2])]}, ${trWords(m[3])}`],
  [/^(\d+)-(yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr)$/i, (m) => `${m[1]} ${MONTHS_RU_GEN[mIdx(m[2])]}`],
  [/^(\d+)\s?[–-]\s?(\d+) (yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|oktabr|noyabr|dekabr)$/i, (m) => `${m[1]}–${m[2]} ${MONTHS_RU_GEN[mIdx(m[3])]}`],
  [/^(Yanvar|Fevral|Mart|Aprel|May|Iyun|Iyul|Avgust|Sentabr|Oktabr|Noyabr|Dekabr)( \d{4})?$/i, (m) => `${MONTHS_RU_NOM[mIdx(m[1])]}${m[2] ?? ''}`],
  [/^(\d+)-(\d+) mehmon$/, (m) => `${m[1]}–${m[2]} гостей`],
  [/^(\d+) zal$/, (m) => `${m[1]} ${plural(+m[1], 'зал', 'зала', 'залов')}`],
  [/^(\d+) surat$/, (m) => `${m[1]} фото`],
  [/^(\d+) kishi$/, (m) => `${m[1]} чел.`],
  [/^(\d+) mehmon$/, (m) => `${m[1]} ${plural(+m[1], 'гость', 'гостя', 'гостей')}`],
  [/^(\d+) oy$/, (m) => `${m[1]} мес.`],
];

function matchCase(src: string, out: string) {
  return src[0] && src[0] !== src[0].toLowerCase() && out ? out[0].toUpperCase() + out.slice(1) : out;
}

function trWords(s: string): string {
  const n = norm(s);
  if (RU[n]) return RU[n];
  // Manba kichik harf bilan bo'lsa (jumla ichida) — natija ham kichik harf bilan
  const capKey = n.charAt(0).toUpperCase() + n.slice(1);
  if (RU[capKey]) return n[0] === n[0].toLowerCase() ? RU[capKey].charAt(0).toLowerCase() + RU[capKey].slice(1) : RU[capKey];
  // so'z bo'yicha: eng uzun iboralar avval
  const lower = n.toLowerCase();
  if (WORDS[lower]) return matchCase(n, WORDS[lower]);
  return n.replace(/[A-Za-z'’]+/g, (w) => {
    const k = w.toLowerCase();
    return WORDS[k] ? matchCase(w, WORDS[k]) : w;
  });
}

const cacheRu = new Map<string, string>();
const cacheCyr = new Map<string, string>();

function toRu(s: string): string {
  const hit = cacheRu.get(s);
  if (hit !== undefined) return hit;
  const n = norm(s);
  const trimmed = n.trim();
  let out: string;
  if (RU[trimmed]) out = RU[trimmed];
  else {
    const m = PATTERNS.map(([re, fn]) => { const r = trimmed.match(re); return r ? fn(r) : null; }).find(Boolean);
    // "8–10 oktabr · 20 km atrofingizda" kabi ' · ' bilan bog'langan bo'laklar — har biri alohida
    out = m ?? (trimmed.includes(' · ') ? trimmed.split(' · ').map(toRu).join(' · ') : trWords(trimmed));
  }
  // atrofdagi bo'shliqlar saqlanadi (matn bo'laklari: " | ", ", ")
  const lead = n.match(/^\s*/)?.[0] ?? '';
  const tail = n.match(/\s*$/)?.[0] ?? '';
  out = lead + out + tail;
  if (cacheRu.size > 3000) cacheRu.clear();
  cacheRu.set(s, out);
  return out;
}

function toUzc(s: string): string {
  const hit = cacheCyr.get(s);
  if (hit !== undefined) return hit;
  const out = toCyr(s);
  if (cacheCyr.size > 3000) cacheCyr.clear();
  cacheCyr.set(s, out);
  return out;
}

/** Matnni joriy tilga o'tkazadi (o'zbekcha lotin manba) */
/** Tarjima qilinmasligi kerak matn (til nomlari): oxiriga ko'rinmas belgi qo'shiladi */
export const NO_TR = '\u2060';
export function tr(s: string | undefined | null): string {
  if (!s) return s ?? '';
  if (current === 'uz' || s.endsWith(NO_TR)) return s;
  // Faqat raqam/belgilardan iborat matn — o'zgarmaydi
  if (!/[A-Za-z]/.test(s)) return s;
  return current === 'ru' ? toRu(s) : toUzc(s);
}

/** Kunlar va oy nomlari ro'yxati (kalendar) — joriy tilda */
export const trWeekdayShort = (i: number) => (current === 'ru' ? SHORT_WD_RU[i] : tr(SHORT_WD_UZ[i]));

/* ───────────── <Text> va <TextInput> ni avtomatik tarjima qilish ───────────── */
type AnyChildren = unknown;
function translateChildren(children: AnyChildren): AnyChildren {
  if (typeof children === 'string') return tr(children);
  if (Array.isArray(children)) {
    // Faqat matn/raqamlardan iborat bo'lsa — butun jumlani birga tarjima qilamiz (andozalar ishlashi uchun)
    if (children.length > 1 && children.every((c) => typeof c === 'string' || typeof c === 'number')) {
      return tr(children.join(''));
    }
    return children.map((c) => (typeof c === 'string' ? tr(c) : c));
  }
  return children;
}

let installed = false;
export function installAutoTranslate() {
  if (installed || Platform.OS !== 'web') return;
  installed = true;
  const T = Text as unknown as { render?: (p: Record<string, unknown>, r: unknown) => unknown };
  const origText = T.render;
  if (origText) {
    T.render = function patchedText(props: Record<string, unknown>, ref: unknown) {
      useLang(); // til o'zgarganda qayta chizish
      if (current === 'uz') return origText.call(this, props, ref);
      const next = { ...props, children: translateChildren(props.children) } as Record<string, unknown>;
      if (typeof props['aria-label'] === 'string') next['aria-label'] = tr(props['aria-label'] as string);
      if (typeof props.accessibilityLabel === 'string') next.accessibilityLabel = tr(props.accessibilityLabel as string);
      return origText.call(this, next, ref);
    };
  }
  const I = TextInput as unknown as { render?: (p: Record<string, unknown>, r: unknown) => unknown };
  const origInput = I.render;
  if (origInput) {
    I.render = function patchedInput(props: Record<string, unknown>, ref: unknown) {
      useLang();
      if (current === 'uz') return origInput.call(this, props, ref);
      const next = { ...props } as Record<string, unknown>;
      if (typeof props.placeholder === 'string') next.placeholder = tr(props.placeholder as string);
      return origInput.call(this, next, ref);
    };
  }
}
