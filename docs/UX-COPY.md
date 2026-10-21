# DawaDekho — UX Copy (English + हिंदी)

**Voice:** a helpful neighbour who works at a pharmacy. Plain, warm, short. Never salesy, never alarming.

**Rules**
- Max ~12 words per sentence. One idea per line.
- Use "you" / "आप". Hindi is conversational Hindustani, not Sanskritised.
- Numbers: always `₹` plus Indian grouping (₹1,240). Percent rounded to a whole number.
- Never say "cure", "best", "guaranteed", "same as" or "safe to switch".
- Each error says **what happened** and **what to do next**.
- Keys below map to `i18n.js` (`en` / `hi`).

---

## 1. Global

| Key | English | हिंदी |
|---|---|---|
| `app.name` | DawaDekho | दवा देखो |
| `app.tagline` | See the medicine. See the price. Before you pay. | दवा देखो, दाम देखो — पैसे देने से पहले। |
| `lang.toggle.aria` | Change language | भाषा बदलें |
| `offline.banner` | You're offline. Typed search still works. | इंटरनेट नहीं है। नाम लिखकर खोज अब भी चलेगी। |

## 2. Home

| Key | English | हिंदी |
|---|---|---|
| `home.title` | Is there a cheaper version of your medicine? | क्या आपकी दवा सस्ते में मिल सकती है? |
| `home.lead` | Find the Jan Aushadhi generic with the same salt and strength. | उसी सॉल्ट और ताकत वाली जन औषधि दवा खोजें। |
| `home.step1` | 1. Photo or name | 1. फ़ोटो या नाम |
| `home.step2` | 2. Check the details | 2. जानकारी जाँचें |
| `home.step3` | 3. See how much you save | 3. देखें कितनी बचत होगी |
| `home.cta.photo` | Photo of strip | पत्ते की फ़ोटो लें |
| `home.cta.type` | Type medicine name | दवा का नाम लिखें |
| `home.examples` | Try: | आज़माएँ: |
| `home.privacy` | No login. Photos are not saved. | लॉगिन नहीं चाहिए। फ़ोटो सेव नहीं होती। |

## 3. Search

| Key | English | हिंदी |
|---|---|---|
| `search.label` | Medicine name | दवा का नाम |
| `search.placeholder` | e.g. Dolo 650 | जैसे Dolo 650 |
| `search.hint` | Spelling mistakes are okay. | स्पेलिंग गलत हो तो भी चलेगा। |
| `search.clear.aria` | Clear search | खोज साफ़ करें |
| `search.results.aria` | {n} matches | {n} नतीजे |

## 4. Photo flow

| Key | English | हिंदी |
|---|---|---|
| `photo.tip` | Show the printed side. Keep it flat and well lit. | छपा हुआ हिस्सा दिखाएँ। पत्ता सीधा और रोशनी में रखें। |
| `photo.reading` | Reading the strip… | पत्ता पढ़ा जा रहा है… |
| `photo.needsNet` | Photo reading needs internet. | फ़ोटो पढ़ने के लिए इंटरनेट चाहिए। |
| `confirm.title` | Is this right? | क्या यह सही है? |
| `confirm.lead` | Fix anything that looks wrong. | कुछ गलत लगे तो ठीक कर दें। |
| `confirm.brand` | Brand name | ब्रांड का नाम |
| `confirm.salt` | Salt (medicine inside) | सॉल्ट (अंदर की दवा) |
| `confirm.strength` | Strength | ताकत |
| `confirm.mrp` | MRP printed on strip | पत्ते पर छपा MRP |
| `confirm.cta` | Show cheaper option | सस्ता विकल्प दिखाएँ |
| `confirm.retake` | Take photo again | फिर से फ़ोटो लें |

## 5. Result

| Key | English | हिंदी |
|---|---|---|
| `result.branded` | Branded MRP | ब्रांडेड MRP |
| `result.generic` | Jan Aushadhi price | जन औषधि दाम |
| `result.save` | You save {amount} ({pct}%) | आपकी बचत {amount} ({pct}%) |
| `result.save.sr` | You save {rupees} rupees, {pct} percent | आपकी बचत {rupees} रुपये, {pct} प्रतिशत |
| `result.approx` | Approx — check MRP on your strip | अनुमानित — अपने पत्ते पर MRP देखें |
| `result.pack` | Pack: {unit} | पैक: {unit} |
| `result.code` | Drug code {code} | ड्रग कोड {code} |
| `result.sameAs` | Same salt and strength as {brand} | {brand} जैसा ही सॉल्ट और ताकत |
| `result.kendra` | Find nearest Jan Aushadhi Kendra | नज़दीकी जन औषधि केंद्र खोजें |
| `result.app` | Get the official Janaushadhi Sugam app | सरकारी जनऔषधि सुगम ऐप लें |
| `result.disclaimer` | Information only. Confirm with your doctor or pharmacist before switching. | सिर्फ़ जानकारी के लिए। दवा बदलने से पहले डॉक्टर या फ़ार्मासिस्ट से पूछें। |
| `result.another` | Check another medicine | दूसरी दवा देखें |
| `result.source` | Prices from the official Jan Aushadhi list ({date}). | दाम सरकारी जन औषधि सूची से ({date})। |

## 6. Empty, error and edge states

| Key | English | हिंदी |
|---|---|---|
| `nomatch.title` | Not in our list yet | यह दवा अभी हमारी सूची में नहीं है |
| `nomatch.body` | We won't guess. Ask your pharmacist for the generic. | हम अंदाज़ा नहीं लगाते। फ़ार्मासिस्ट से जेनेरिक दवा पूछें। |
| `nomatch.retry` | Try another spelling | दूसरी स्पेलिंग आज़माएँ |
| `err.unreadable` | We couldn't read the strip clearly. Try a sharper photo, or type the name. | पत्ता साफ़ नहीं पढ़ा गया। साफ़ फ़ोटो लें या नाम लिखें। |
| `err.busy` | Photo reading is busy right now. Type the name instead. | अभी फ़ोटो पढ़ना व्यस्त है। नाम लिखकर खोजें। |
| `err.timeout` | That took too long. Type the name instead. | बहुत देर लगी। नाम लिखकर खोजें। |
| `err.tooBig` | Photo is too large. Try again. | फ़ोटो बहुत बड़ी है। फिर कोशिश करें। |
| `err.generic` | Something went wrong. Please try again. | कुछ गड़बड़ हुई। फिर कोशिश करें। |
| `err.handwriting` | We read printed strips and boxes, not handwriting. | हम छपे पत्ते और डिब्बे पढ़ते हैं, हाथ की लिखावट नहीं। |

## 7. Should-have features

| Key | English | हिंदी |
|---|---|---|
| `list.add` | Add to my list | मेरी सूची में जोड़ें |
| `list.total` | Total saving on {n} medicines: {amount} | {n} दवाओं पर कुल बचत: {amount} |
| `share.whatsapp` | Send on WhatsApp | व्हाट्सऐप पर भेजें |
| `share.text` | {brand} costs {branded}. Jan Aushadhi {generic} costs {price}. Check with your pharmacist. — via DawaDekho | {brand} का दाम {branded}। जन औषधि {generic} का दाम {price}। फ़ार्मासिस्ट से पूछें। — DawaDekho |
| `speak.button` | Read aloud | सुनें |

## 8. Accessibility labels

| Key | English | हिंदी |
|---|---|---|
| `a11y.skip` | Skip to main content | मुख्य भाग पर जाएँ |
| `a11y.camera` | Open camera to photograph medicine strip | दवा के पत्ते की फ़ोटो के लिए कैमरा खोलें |
| `a11y.loading` | Loading, please wait | लोड हो रहा है, कृपया रुकें |
| `a11y.resultReady` | Result ready | नतीजा तैयार है |

## 9. Meta (SEO)

| Key | English | हिंदी |
|---|---|---|
| `meta.title` | DawaDekho — Find cheaper Jan Aushadhi generic medicines | दवा देखो — सस्ती जन औषधि जेनेरिक दवा खोजें |
| `meta.description` | Photograph or type your medicine. See the Jan Aushadhi generic with the same salt and strength, and how much you save. Free, no login. | दवा की फ़ोटो लें या नाम लिखें। उसी सॉल्ट और ताकत की जन औषधि दवा और अपनी बचत देखें। मुफ़्त, बिना लॉगिन। |
