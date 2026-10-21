/**
 * i18n.js — every user-facing string, English + Hindi (window.DawaI18N).
 * Keys mirror UX-COPY.md. Placeholders use {name}. The choice is remembered
 * on the device and drives <html lang>.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DawaI18N = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var STRINGS = {
    en: {
      "app.name": "DawaDekho",
      "app.tagline": "See the medicine. See the price. Before you pay.",
      "lang.toggle.aria": "Change language",
      "offline.banner": "You're offline. Typed search still works.",

      "home.title": "Is there a cheaper version of your medicine?",
      "home.lead": "Find the Jan Aushadhi generic with the same salt and strength.",
      "home.step1": "Photo or name",
      "home.step2": "Check the details",
      "home.step3": "See how much you save",
      "home.cta.photo": "Photo of strip",
      "home.cta.type": "Type medicine name",
      "home.examples": "Try:",
      "home.privacy": "No login. Photos are not saved.",

      "search.label": "Medicine name",
      "search.placeholder": "e.g. Dolo 650",
      "search.hint": "Spelling mistakes are okay.",
      "search.clear.aria": "Clear search",
      "search.back": "Back",

      "photo.tip": "Show the printed side. Keep it flat and well lit.",
      "photo.reading": "Reading the strip…",
      "photo.needsNet": "Photo reading needs internet.",
      "photo.choose": "Choose a photo",
      "confirm.title": "Is this right?",
      "confirm.lead": "Fix anything that looks wrong.",
      "confirm.brand": "Brand name",
      "confirm.salt": "Salt (medicine inside)",
      "confirm.strength": "Strength",
      "confirm.mrp": "MRP printed on strip",
      "confirm.cta": "Show cheaper option",
      "confirm.retake": "Take photo again",

      "result.branded": "Branded MRP",
      "result.generic": "Jan Aushadhi price",
      "result.save": "You save {amount} ({pct}%)",
      "result.save.sr": "You save {rupees} rupees, {pct} percent",
      "result.approx": "Approx — check MRP on your strip",
      "result.pack": "Pack: {unit}",
      "result.code": "Drug code {code}",
      "result.sameAs": "Same salt and strength as {brand}",
      "result.altStrength": "Nearest match — strength differs, check your strip",
      "result.alternatives": "Other options",
      "result.kendra": "Find nearest Jan Aushadhi Kendra",
      "result.app": "Get the official Janaushadhi Sugam app",
      "result.disclaimer": "Information only. Confirm with your doctor or pharmacist before switching.",
      "result.another": "Check another medicine",
      "result.source": "Prices from the official Jan Aushadhi list ({date}).",

      "nomatch.title": "Not in our list yet",
      "nomatch.body": "We won't guess. Ask your pharmacist for the generic.",
      "nomatch.retry": "Try another spelling",
      "err.unreadable": "We couldn't read the strip clearly. Try a sharper photo, or type the name.",
      "err.busy": "Photo reading is busy right now. Type the name instead.",
      "err.timeout": "That took too long. Type the name instead.",
      "err.tooBig": "Photo is too large. Try again.",
      "err.generic": "Something went wrong. Please try again.",
      "err.handwriting": "We read printed strips and boxes, not handwriting.",

      "share.whatsapp": "Send on WhatsApp",
      "share.text": "{brand} costs {branded}. Jan Aushadhi {generic} costs {price}. Check with your pharmacist. — via DawaDekho",
      "speak.button": "Read aloud",

      "a11y.skip": "Skip to main content",
      "a11y.camera": "Open camera to photograph medicine strip",
      "a11y.loading": "Loading, please wait",
      "a11y.resultReady": "Result ready",
    },
    hi: {
      "app.name": "दवा देखो",
      "app.tagline": "दवा देखो, दाम देखो — पैसे देने से पहले।",
      "lang.toggle.aria": "भाषा बदलें",
      "offline.banner": "इंटरनेट नहीं है। नाम लिखकर खोज अब भी चलेगी।",

      "home.title": "क्या आपकी दवा सस्ते में मिल सकती है?",
      "home.lead": "उसी सॉल्ट और ताकत वाली जन औषधि दवा खोजें।",
      "home.step1": "१. फ़ोटो या नाम",
      "home.step2": "२. जानकारी जाँचें",
      "home.step3": "३. देखें कितनी बचत होगी",
      "home.cta.photo": "पत्ते की फ़ोटो लें",
      "home.cta.type": "दवा का नाम लिखें",
      "home.examples": "आज़माएँ:",
      "home.privacy": "लॉगिन नहीं चाहिए। फ़ोटो सेव नहीं होती।",

      "search.label": "दवा का नाम",
      "search.placeholder": "जैसे Dolo 650",
      "search.hint": "स्पेलिंग गलत हो तो भी चलेगा।",
      "search.clear.aria": "खोज साफ़ करें",
      "search.back": "वापस",

      "photo.tip": "छपा हुआ हिस्सा दिखाएँ। पत्ता सीधा और रोशनी में रखें।",
      "photo.reading": "पत्ता पढ़ा जा रहा है…",
      "photo.needsNet": "फ़ोटो पढ़ने के लिए इंटरनेट चाहिए।",
      "photo.choose": "फ़ोटो चुनें",
      "confirm.title": "क्या यह सही है?",
      "confirm.lead": "कुछ गलत लगे तो ठीक कर दें।",
      "confirm.brand": "ब्रांड का नाम",
      "confirm.salt": "सॉल्ट (अंदर की दवा)",
      "confirm.strength": "ताकत",
      "confirm.mrp": "पत्ते पर छपा MRP",
      "confirm.cta": "सस्ता विकल्प दिखाएँ",
      "confirm.retake": "फिर से फ़ोटो लें",

      "result.branded": "ब्रांडेड MRP",
      "result.generic": "जन औषधि दाम",
      "result.save": "आपकी बचत {amount} ({pct}%)",
      "result.save.sr": "आपकी बचत {rupees} रुपये, {pct} प्रतिशत",
      "result.approx": "अनुमानित — अपने पत्ते पर MRP देखें",
      "result.pack": "पैक: {unit}",
      "result.code": "ड्रग कोड {code}",
      "result.sameAs": "{brand} जैसा ही सॉल्ट और ताकत",
      "result.altStrength": "नज़दीकी मिलान — ताकत अलग है, अपना पत्ता देखें",
      "result.alternatives": "दूसरे विकल्प",
      "result.kendra": "नज़दीकी जन औषधि केंद्र खोजें",
      "result.app": "सरकारी जनऔषधि सुगम ऐप लें",
      "result.disclaimer": "सिर्फ़ जानकारी के लिए। दवा बदलने से पहले डॉक्टर या फ़ार्मासिस्ट से पूछें।",
      "result.another": "दूसरी दवा देखें",
      "result.source": "दाम सरकारी जन औषधि सूची से ({date})।",

      "nomatch.title": "यह दवा अभी हमारी सूची में नहीं है",
      "nomatch.body": "हम अंदाज़ा नहीं लगाते। फ़ार्मासिस्ट से जेनेरिक दवा पूछें।",
      "nomatch.retry": "दूसरी स्पेलिंग आज़माएँ",
      "err.unreadable": "पत्ता साफ़ नहीं पढ़ा गया। साफ़ फ़ोटो लें या नाम लिखें।",
      "err.busy": "अभी फ़ोटो पढ़ना व्यस्त है। नाम लिखकर खोजें।",
      "err.timeout": "बहुत देर लगी। नाम लिखकर खोजें।",
      "err.tooBig": "फ़ोटो बहुत बड़ी है। फिर कोशिश करें।",
      "err.generic": "कुछ गड़बड़ हुई। फिर कोशिश करें।",
      "err.handwriting": "हम छपे पत्ते और डिब्बे पढ़ते हैं, हाथ की लिखावट नहीं।",

      "share.whatsapp": "व्हाट्सऐप पर भेजें",
      "share.text": "{brand} का दाम {branded}। जन औषधि {generic} का दाम {price}। फ़ार्मासिस्ट से पूछें। — DawaDekho",
      "speak.button": "सुनें",

      "a11y.skip": "मुख्य भाग पर जाएँ",
      "a11y.camera": "दवा के पत्ते की फ़ोटो के लिए कैमरा खोलें",
      "a11y.loading": "लोड हो रहा है, कृपया रुकें",
      "a11y.resultReady": "नतीजा तैयार है",
    },
  };

  function t(lang, key, vars) {
    var table = STRINGS[lang] || STRINGS.en;
    var s = table[key];
    if (s == null) s = STRINGS.en[key] != null ? STRINGS.en[key] : key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, name) {
        return vars[name] != null ? vars[name] : m;
      });
    }
    return s;
  }

  return { strings: STRINGS, t: t, langs: ["en", "hi"] };
});
