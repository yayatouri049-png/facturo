// FacturaFlow - Amount to words (montant en toutes lettres) - FR / EN / AR
// Handles Algerian legal invoice wording with currency + centimes/cents.

// ---- Currency word metadata ----
const CURRENCY_WORDS = {
  DZD: {
    fr: { main: "dinars algériens", mainSing: "dinar algérien", sub: "centimes", subSing: "centime" },
    en: { main: "Algerian dinars", mainSing: "Algerian dinar", sub: "centimes", subSing: "centime" },
    ar: { main: "دينار جزائري", sub: "سنتيم" },
  },
  EUR: {
    fr: { main: "euros", mainSing: "euro", sub: "centimes", subSing: "centime" },
    en: { main: "euros", mainSing: "euro", sub: "cents", subSing: "cent" },
    ar: { main: "يورو", sub: "سنت" },
  },
  USD: {
    fr: { main: "dollars américains", mainSing: "dollar américain", sub: "cents", subSing: "cent" },
    en: { main: "US dollars", mainSing: "US dollar", sub: "cents", subSing: "cent" },
    ar: { main: "دولار أمريكي", sub: "سنت" },
  },
};

// =====================================================================
// FRENCH
// =====================================================================
const FR_UNITS = [
  "zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf",
  "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize",
  "dix-sept", "dix-huit", "dix-neuf",
];

function frBelow100(n, noS) {
  if (n < 20) return FR_UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  const tensNames = { 2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante" };
  if (t <= 6) {
    const base = tensNames[t];
    if (u === 0) return base;
    if (u === 1) return base + " et un";
    return base + "-" + FR_UNITS[u];
  }
  if (t === 7) {
    if (u === 0) return "soixante-dix";
    if (u === 1) return "soixante et onze";
    return "soixante-" + FR_UNITS[10 + u];
  }
  if (t === 8) {
    if (u === 0) return noS ? "quatre-vingt" : "quatre-vingts";
    return "quatre-vingt-" + FR_UNITS[u];
  }
  // t === 9
  if (u === 0) return "quatre-vingt-dix";
  return "quatre-vingt-" + FR_UNITS[10 + u];
}

function frBelow1000(n, noS) {
  if (n < 100) return frBelow100(n, noS);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let hundredWord = h === 1 ? "cent" : frBelow100(h, false) + " cent";
  if (rest === 0) {
    if (h > 1 && !noS) hundredWord += "s";
    return hundredWord;
  }
  return hundredWord + " " + frBelow100(rest, noS);
}

function frInteger(n) {
  if (n === 0) return "zéro";
  const scales = [
    { value: 1000000000, sing: "milliard", plur: "milliards", noun: true },
    { value: 1000000, sing: "million", plur: "millions", noun: true },
    { value: 1000, sing: "mille", plur: "mille", noun: false },
  ];
  const words = [];
  let remaining = n;
  for (const scale of scales) {
    const count = Math.floor(remaining / scale.value);
    if (count > 0) {
      if (!scale.noun) {
        // mille : invariable, pas de "un mille"
        if (count === 1) words.push("mille");
        else words.push(frBelow1000(count, true) + " mille");
      } else {
        const name = count > 1 ? scale.plur : scale.sing;
        words.push(frBelow1000(count, false) + " " + name);
      }
      remaining = remaining % scale.value;
    }
  }
  if (remaining > 0) words.push(frBelow1000(remaining, false));
  return words.join(" ");
}

function frAmount(intPart, cents, cw) {
  const parts = [];
  if (intPart > 0) {
    const intWords = frInteger(intPart);
    const mainName = intPart === 1 ? cw.mainSing : cw.main;
    // règle du "de" après million(s)/milliard(s)
    const needsDe = /millions?$|milliards?$/.test(intWords);
    parts.push(intWords + " " + (needsDe ? "de " : "") + mainName);
  } else if (cents === 0) {
    parts.push("zéro " + cw.main);
  }
  if (cents > 0) {
    const centWords = frInteger(cents);
    const subName = cents === 1 ? cw.subSing : cw.sub;
    const connector = intPart > 0 ? "et " : "";
    parts.push(connector + centWords + " " + subName);
  }
  return parts.join(" ");
}

// =====================================================================
// ENGLISH
// =====================================================================
const EN_ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function enBelow100(n) {
  if (n < 20) return EN_ONES[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? EN_TENS[t] : EN_TENS[t] + "-" + EN_ONES[u];
}

function enBelow1000(n) {
  if (n < 100) return enBelow100(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hundredWord = EN_ONES[h] + " hundred";
  return rest === 0 ? hundredWord : hundredWord + " " + enBelow100(rest);
}

function enInteger(n) {
  if (n === 0) return "zero";
  const scales = [
    { value: 1000000000, name: "billion" },
    { value: 1000000, name: "million" },
    { value: 1000, name: "thousand" },
  ];
  const words = [];
  let remaining = n;
  for (const scale of scales) {
    const count = Math.floor(remaining / scale.value);
    if (count > 0) {
      words.push(enBelow1000(count) + " " + scale.name);
      remaining = remaining % scale.value;
    }
  }
  if (remaining > 0) words.push(enBelow1000(remaining));
  return words.join(" ");
}

function enAmount(intPart, cents, cw) {
  const parts = [];
  if (intPart > 0) {
    parts.push(enInteger(intPart) + " " + (intPart === 1 ? cw.mainSing : cw.main));
  } else if (cents === 0) {
    parts.push("zero " + cw.main);
  }
  if (cents > 0) {
    const connector = intPart > 0 ? "and " : "";
    parts.push(connector + enInteger(cents) + " " + (cents === 1 ? cw.subSing : cw.sub));
  }
  return parts.join(" ");
}

// =====================================================================
// ARABIC
// =====================================================================
const AR_ONES = [
  "", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
  "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
  "سبعة عشر", "ثمانية عشر", "تسعة عشر",
];
const AR_TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const AR_HUNDREDS = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

function arBelow1000(n) {
  const parts = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h > 0) parts.push(AR_HUNDREDS[h]);
  if (rest > 0) {
    if (rest < 20) {
      parts.push(AR_ONES[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      if (u > 0) parts.push(AR_ONES[u] + " و" + AR_TENS[t]);
      else parts.push(AR_TENS[t]);
    }
  }
  return parts.join(" و");
}

function arScale(c, sing, dual, plural3to10, pluralBig) {
  if (c === 1) return sing;
  if (c === 2) return dual;
  if (c >= 3 && c <= 10) return arBelow1000(c) + " " + plural3to10;
  return arBelow1000(c) + " " + pluralBig;
}

function arInteger(n) {
  if (n === 0) return "صفر";
  const parts = [];
  const milliard = Math.floor(n / 1000000000);
  n %= 1000000000;
  const million = Math.floor(n / 1000000);
  n %= 1000000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const rest = n;
  if (milliard > 0) parts.push(arScale(milliard, "مليار", "ملياران", "مليارات", "مليار"));
  if (million > 0) parts.push(arScale(million, "مليون", "مليونان", "ملايين", "مليون"));
  if (thousand > 0) parts.push(arScale(thousand, "ألف", "ألفان", "آلاف", "ألف"));
  if (rest > 0) parts.push(arBelow1000(rest));
  return parts.join(" و");
}

function arAmount(intPart, cents, cw) {
  const parts = [];
  if (intPart > 0) {
    parts.push(arInteger(intPart) + " " + cw.main);
  } else if (cents === 0) {
    parts.push("صفر " + cw.main);
  }
  if (cents > 0) {
    const connector = intPart > 0 ? "و" : "";
    parts.push(connector + arInteger(cents) + " " + cw.sub);
  }
  return parts.join(" ");
}

// =====================================================================
// PUBLIC API
// =====================================================================
export function amountToWords(amount, lang, currencyCode) {
  const cwSet = CURRENCY_WORDS[currencyCode] || CURRENCY_WORDS.EUR;
  const cw = cwSet[lang] || cwSet.fr;
  const rounded = Math.round((Number(amount) || 0) * 100);
  const intPart = Math.floor(rounded / 100);
  const cents = rounded % 100;
  if (lang === "en") return enAmount(intPart, cents, cw);
  if (lang === "ar") return arAmount(intPart, cents, cw);
  return frAmount(intPart, cents, cw);
}

// Builds the full localized sentence (prefix + words).
export function amountInWordsSentence(amount, lang, currencyCode, prefix) {
  const words = amountToWords(amount, lang, currencyCode);
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  if (lang === "fr") {
    // "Arrêtée la présente facture à la somme de <words>"
    return `${prefix} ${words}`;
  }
  // EN / AR : "<prefix> <Words>"
  return `${prefix} ${lang === "ar" ? words : capitalized}`;
}
