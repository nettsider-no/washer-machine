export const LOCALES = ["no", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string | undefined): v is Locale {
  return !!v && LOCALES.includes(v as Locale);
}

/** Parse Accept-Language; default Norwegian for local business. */
export function localeFromAcceptLanguage(
  accept: string | null | undefined
): Locale {
  if (!accept) return "no";
  const tags = accept.split(",").map((part) => {
    const [tag] = part.trim().split(";");
    return tag.trim().toLowerCase();
  });
  for (const tag of tags) {
    const base = tag.split("-")[0];
    if (base === "ru") return "ru";
    if (base === "en") return "en";
    if (base === "no" || base === "nb" || base === "nn") return "no";
  }
  return "no";
}

export function resolveInitialLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string | null | undefined
): Locale {
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return localeFromAcceptLanguage(acceptLanguage);
}

export type Messages = {
  metaTitle: string;
  metaDescription: string;
  navServices: string;
  navContact: string;
  navRequest: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  servicesTitle: string;
  servicesIntro: string;
  services: { title: string; text: string }[];
  areaTitle: string;
  areaLead: string;
  areaBullets: string[];
  areaMapCaption: string;
  areaPrimaryLabel: string;
  areaSecondaryLabel: string;
  requestTitle: string;
  requestLead: string;
  requestFormTitle: string;
  requestFormHint: string;
  reqName: string;
  reqPhone: string;
  reqAddress: string;
  reqBrand: string;
  reqBrandOther: string;
  reqBrandUnknown: string;
  reqBrandPlaceholder: string;
  reqModel: string;
  reqIssue: string;
  reqIssuePlaceholder: string;
  reqIssueHintsLabel: string;
  reqIssueHints: string[];
  reqErrorCode: string;
  reqMedia: string;
  reqMediaHint: string;
  reqTime: string;
  reqTimePlaceholder: string;
  reqTimeToday: string;
  reqTimeTomorrow: string;
  reqTimeSoon: string;
  /** Когда в админке заданы слоты — выбор даты/часа (Норвегия). */
  reqVisitSlot: string;
  reqVisitSlotPlaceholder: string;
  reqTimezoneNote: string;
  /** Слот только что заняли или недоступен. */
  reqSlotTaken: string;
  reqSlotPickDate: string;
  reqSlotPickTime: string;
  reqSubmit: string;
  reqSending: string;
  reqSuccessTitle: string;
  reqSuccessText: string;
  reqSendAnother: string;
  reqValidationRequired: string;
  reqValidationPhone: string;
  reqValidationMedia: string;
  reqError: string;
  contactTitle: string;
  contactLead: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formCity: string;
  formMessage: string;
  formSubmit: string;
  formSending: string;
  formSuccess: string;
  formError: string;
  formRequired: string;
  footerArea: string;
};

export const messages: Record<Locale, Messages> = {
  no: {
    metaTitle: "Vaskemaskin-reparasjon i Norge",
    metaDescription:
      "Profesjonell reparasjon og service av vaskemaskiner. Hurtig respons, erfaring, hele Norge.",
    navServices: "Tjenester",
    navContact: "Kontakt",
    navRequest: "Bestill",
    heroTitle: "VASKEREPARASJON",
    heroSubtitle:
      "Diagnose, reparasjon og vedlikehold av vaskemaskiner hjemme hos deg eller på verksted. Pålitelig service i hele Norge.",
    heroCta: "Send forespørsel",
    servicesTitle: "Hva vi gjør",
    servicesIntro:
      "Vi hjelper når maskinen ikke sentrifugerer, lekker, ikke starter eller viser feilkode. Tydelige priser og ærlig vurdering før vi starter arbeid.",
    services: [
      {
        title: "Diagnose og feilsøking",
        text: "Rask kartlegging av årsak: motor, pumpe, varmeelement, elektronikk, lager og tetninger.",
      },
      {
        title: "Reparasjon og reservedeler",
        text: "Bytte av slitedeler med kvalitetskomponenter. Vi anbefaler reparasjon når det lønner seg.",
      },
      {
        title: "Service og forebygging",
        text: "Rengjøring av filter og slange, kontroll av oppløsningsmiddel og enkel vedlikehold for lengre levetid.",
      },
      {
        title: "Installasjon og tilkobling",
        text: "Korrekt tilkobling til vann og avløp, nivellering og testkjøring etter montering.",
      },
    ],
    areaTitle: "Dekningsområde",
    areaLead:
      "Vi jobber primært i Oslo og nærliggende områder. Hvis du er litt utenfor sonen, send en forespørsel — ofte kan vi likevel finne en løsning.",
    areaBullets: [
      "Oslo og regionen rundt (utrykning etter avtale).",
      "Typisk responstid: samme dag eller neste virkedag, avhengig av kapasitet.",
      "Vi avtaler tidspunkt på forhånd. Du får et bekreftet tidsvindu.",
      "Transportsone kan påvirke pris — vi sier alltid ifra før vi starter.",
    ],
    areaMapCaption: "Serviceområde (forenklet kart)",
    areaPrimaryLabel: "Oslo + region",
    areaSecondaryLabel: "Utenfor sonen: spør",
    requestTitle: "Bestill reparasjon",
    requestLead:
      "Fyll ut skjemaet — vi sender detaljene direkte til mesteren. Jo mer presist, jo raskere og enklere blir det å hjelpe.",
    requestFormTitle: "Book repair of your washing machine",
    requestFormHint:
      "Feltene med * er obligatoriske. Legg ved bilder/video hvis mulig — det hjelper med diagnose.",
    reqName: "Navn",
    reqPhone: "Telefon",
    reqAddress: "Full adresse (valgfritt)",
    reqBrand: "Merke",
    reqBrandOther: "Annet",
    reqBrandUnknown: "Jeg vet ikke",
    reqBrandPlaceholder: "Velg merke",
    reqModel: "Modell (valgfritt)",
    reqIssue: "Hva er problemet?",
    reqIssuePlaceholder: "Beskriv symptomer, når det startet, hva som ble prøvd…",
    reqIssueHintsLabel: "Hurtigvalg",
    reqIssueHints: [
      "Tømmer ikke",
      "Varmer ikke",
      "Bråker mye",
      "Starter ikke",
      "Lekker",
      "Feilkode",
      "Vibrerer / hopper",
      "Lukter brent",
    ],
    reqErrorCode: "Feilkode (valgfritt)",
    reqMedia: "Foto / video (opptil 3)",
    reqMediaHint: "JPG/PNG/WebP eller video. Maks 3 filer.",
    reqTime: "Ønsket tidspunkt",
    reqTimePlaceholder: "Velg",
    reqTimeToday: "I dag",
    reqTimeTomorrow: "I morgen",
    reqTimeSoon: "I løpet av de nærmeste dagene",
    reqVisitSlot: "Ønsket tidspunkt for besøk",
    reqVisitSlotPlaceholder: "Velg dato og klokkeslett",
    reqTimezoneNote: "Tider vises i norsk tid (Europe/Oslo).",
    reqSlotTaken:
      "Dette tidspunktet er nettopp tatt. Velg et annet tidspunkt — listen oppdateres.",
    reqSlotPickDate: "1. Velg dag",
    reqSlotPickTime: "2. Velg klokkeslett",
    reqSubmit: "Send bestilling",
    reqSending: "Sender…",
    reqSuccessTitle: "Bestillingen er sendt!",
    reqSuccessText: "Mesteren kontakter deg så snart som mulig.",
    reqSendAnother: "Send en ny bestilling",
    reqValidationRequired: "Vennligst fyll ut obligatoriske felt.",
    reqValidationPhone: "Skriv inn et gyldig telefonnummer.",
    reqValidationMedia: "Du kan laste opp maks 3 filer.",
    reqError: "Kunne ikke sende. Prøv igjen senere eller ring oss.",
    contactTitle: "Kontakt",
    contactLead:
      "Fyll ut skjemaet — vi svarer så snart vi kan. Du kan også ringe eller skrive i messenger du finner i bunnteksten.",
    formName: "Navn",
    formPhone: "Telefon",
    formEmail: "E-post (valgfritt)",
    formCity: "Sted / postnummer",
    formMessage: "Beskriv problemet eller modell",
    formSubmit: "Send til Telegram",
    formSending: "Sender…",
    formSuccess: "Takk! Vi har mottatt forespørselen.",
    formError: "Noe gikk galt. Prøv igjen senere eller ring oss.",
    formRequired: "Fyll inn obligatoriske felt.",
    footerArea: "Norge",
  },
  ru: {
    metaTitle: "Ремонт стиральных машин в Норвегии",
    metaDescription:
      "Профессиональный ремонт и обслуживание стиральных машин. Быстрый выезд, опыт, работа по всей Норвегии.",
    navServices: "Услуги",
    navContact: "Контакты",
    navRequest: "Заявка",
    heroTitle: "РЕМОНТ СТИРАЛЬНЫХ МАШИН",
    heroSubtitle:
      "Диагностика, ремонт и обслуживание у вас дома или в мастерской. Надёжный сервис по всей Норвегии.",
    heroCta: "Оставить заявку",
    servicesTitle: "Услуги",
    servicesIntro:
      "Поможем, если машина не отжимает, течёт, не включается или показывает ошибку. Честная оценка и понятные условия до начала работ.",
    services: [
      {
        title: "Диагностика",
        text: "Быстро выясняем причину: мотор, помпа, ТЭН, электроника, подшипники, манжеты.",
      },
      {
        title: "Ремонт и запчасти",
        text: "Замена изношенных узлов качественными деталями. Рекомендуем ремонт, когда это экономически оправдано.",
      },
      {
        title: "Обслуживание",
        text: "Чистка фильтра и сливного тракта, профилактика для продления срока службы техники.",
      },
      {
        title: "Подключение и установка",
        text: "Правильное подключение к воде и канализации, выравнивание, пробный запуск.",
      },
    ],
    areaTitle: "Зона обслуживания",
    areaLead:
      "Основная зона — Осло и ближайший регион. Если вы немного дальше, всё равно оставьте заявку: часто можно договориться.",
    areaBullets: [
      "Осло и регион рядом (выезд по согласованию).",
      "Обычно отвечаем в тот же день или на следующий рабочий — по загрузке.",
      "Время визита подтверждаем заранее, приезжаем в согласованное окно.",
      "Дальность может влиять на стоимость — всегда предупреждаем до начала работ.",
    ],
    areaMapCaption: "Зона выезда (схематичная карта)",
    areaPrimaryLabel: "Осло + регион",
    areaSecondaryLabel: "Вне зоны: уточнить",
    requestTitle: "Запись на ремонт",
    requestLead:
      "Заполните форму — данные уйдут мастеру сразу в Telegram. Чем точнее описание, тем быстрее диагностика и выезд.",
    requestFormTitle: "Записаться на ремонт стиральной машины",
    requestFormHint:
      "Поля со * обязательны. По возможности прикрепите фото/видео — это сильно помогает.",
    reqName: "Имя",
    reqPhone: "Телефон",
    reqAddress: "Полный адрес (необязательно)",
    reqBrand: "Марка стиралки",
    reqBrandOther: "Другая",
    reqBrandUnknown: "Не знаю",
    reqBrandPlaceholder: "Выберите марку",
    reqModel: "Модель (необязательно)",
    reqIssue: "Что случилось с машиной?",
    reqIssuePlaceholder:
      "Опишите симптомы, когда началось, что уже пробовали сделать…",
    reqIssueHintsLabel: "Подсказки",
    reqIssueHints: [
      "Не сливает",
      "Не греет",
      "Сильно гудит",
      "Не включается",
      "Течёт",
      "Выдаёт ошибку",
      "Сильно вибрирует",
      "Пахнет гарью",
    ],
    reqErrorCode: "Код ошибки (если есть)",
    reqMedia: "Фото / видео (до 3)",
    reqMediaHint: "JPG/PNG/WebP или видео. Максимум 3 файла.",
    reqTime: "Удобное время выезда",
    reqTimePlaceholder: "Выберите",
    reqTimeToday: "Сегодня",
    reqTimeTomorrow: "Завтра",
    reqTimeSoon: "В ближайшие дни",
    reqVisitSlot: "Удобное время визита",
    reqVisitSlotPlaceholder: "Выберите дату и время",
    reqTimezoneNote: "Время указано по Норвегии (Europe/Oslo).",
    reqSlotTaken:
      "Это время только что заняли. Выберите другой слот — список обновляется автоматически.",
    reqSlotPickDate: "1. Выберите дату",
    reqSlotPickTime: "2. Выберите время",
    reqSubmit: "Отправить заявку",
    reqSending: "Отправляем…",
    reqSuccessTitle: "Заявка отправлена!",
    reqSuccessText: "Мастер свяжется с вами в ближайшее время.",
    reqSendAnother: "Отправить ещё одну",
    reqValidationRequired: "Заполните обязательные поля.",
    reqValidationPhone: "Введите корректный номер телефона.",
    reqValidationMedia: "Можно прикрепить максимум 3 файла.",
    reqError: "Не удалось отправить. Попробуйте позже или позвоните нам.",
    contactTitle: "Заявка",
    contactLead:
      "Заполните форму — ответим как можно скорее. Телефон и мессенджеры можно указать внизу страницы.",
    formName: "Имя",
    formPhone: "Телефон",
    formEmail: "Email (необязательно)",
    formCity: "Город / индекс",
    formMessage: "Опишите проблему или модель",
    formSubmit: "Отправить в Telegram",
    formSending: "Отправка…",
    formSuccess: "Спасибо! Заявка отправлена.",
    formError: "Ошибка отправки. Попробуйте позже или позвоните.",
    formRequired: "Заполните обязательные поля.",
    footerArea: "Норвегия",
  },
  en: {
    metaTitle: "Washing machine repair in Norway",
    metaDescription:
      "Professional washing machine repair and maintenance. Fast response, experienced technician, serving Norway.",
    navServices: "Services",
    navContact: "Contact",
    navRequest: "Book",
    heroTitle: "WASHING MACHINE REPAIR",
    heroSubtitle:
      "Diagnostics, repair, and maintenance at your home or in the workshop. Reliable service across Norway.",
    heroCta: "Request a callback",
    servicesTitle: "What we do",
    servicesIntro:
      "We help when your washer won’t spin, leaks, won’t start, or shows an error code. Clear pricing and an honest assessment before any work begins.",
    services: [
      {
        title: "Diagnostics",
        text: "We quickly find the cause: motor, pump, heating element, electronics, bearings, and seals.",
      },
      {
        title: "Repairs & parts",
        text: "Replacement of worn components with quality parts. We recommend repair when it makes sense.",
      },
      {
        title: "Servicing",
        text: "Filter and hose checks, basic care to extend the life of your appliance.",
      },
      {
        title: "Installation",
        text: "Correct water and drain hookup, levelling, and a test run after setup.",
      },
    ],
    areaTitle: "Service area",
    areaLead:
      "We mainly serve Oslo and nearby areas. If you’re slightly outside the zone, send a request — we can often make it work.",
    areaBullets: [
      "Oslo and surrounding region (visit by appointment).",
      "Typical response: same day or next business day, depending on workload.",
      "We confirm a time window in advance — no surprise visits.",
      "Travel distance can affect the price — we always confirm before any work starts.",
    ],
    areaMapCaption: "Service coverage (simplified map)",
    areaPrimaryLabel: "Oslo + region",
    areaSecondaryLabel: "Outside zone: ask",
    requestTitle: "Book a repair",
    requestLead:
      "Fill in the form — details go straight to the technician in Telegram. The clearer the request, the faster the diagnosis and visit.",
    requestFormTitle: "Book a washing machine repair",
    requestFormHint:
      "Fields marked with * are required. Attach photos/videos if you can — it helps a lot.",
    reqName: "Name",
    reqPhone: "Phone",
    reqAddress: "Full address (optional)",
    reqBrand: "Washer brand",
    reqBrandOther: "Other",
    reqBrandUnknown: "I don’t know",
    reqBrandPlaceholder: "Select a brand",
    reqModel: "Model (optional)",
    reqIssue: "What happened?",
    reqIssuePlaceholder:
      "Describe symptoms, when it started, what you’ve tried…",
    reqIssueHintsLabel: "Quick hints",
    reqIssueHints: [
      "Doesn’t drain",
      "Doesn’t heat",
      "Very loud",
      "Won’t turn on",
      "Leaking",
      "Shows an error",
      "Strong vibration",
      "Burning smell",
    ],
    reqErrorCode: "Error code (if any)",
    reqMedia: "Photos / video (up to 3)",
    reqMediaHint: "JPG/PNG/WebP or video. Max 3 files.",
    reqTime: "Preferred time",
    reqTimePlaceholder: "Select",
    reqTimeToday: "Today",
    reqTimeTomorrow: "Tomorrow",
    reqTimeSoon: "In the next few days",
    reqVisitSlot: "Preferred visit time",
    reqVisitSlotPlaceholder: "Pick date and time",
    reqTimezoneNote: "Times are shown in Norway (Europe/Oslo).",
    reqSlotTaken:
      "That time was just taken. Please pick another slot — the list refreshes automatically.",
    reqSlotPickDate: "1. Pick a date",
    reqSlotPickTime: "2. Pick a time",
    reqSubmit: "Send request",
    reqSending: "Sending…",
    reqSuccessTitle: "Request sent!",
    reqSuccessText: "The technician will contact you shortly.",
    reqSendAnother: "Send another request",
    reqValidationRequired: "Please fill in the required fields.",
    reqValidationPhone: "Please enter a valid phone number.",
    reqValidationMedia: "You can attach up to 3 files.",
    reqError: "Couldn’t send. Try again later or call us.",
    contactTitle: "Contact",
    contactLead:
      "Send the form — we’ll get back to you as soon as we can. Phone and messengers can be added in the footer.",
    formName: "Name",
    formPhone: "Phone",
    formEmail: "Email (optional)",
    formCity: "City / postal code",
    formMessage: "Describe the issue or model",
    formSubmit: "Send via Telegram",
    formSending: "Sending…",
    formSuccess: "Thank you! Your request was received.",
    formError: "Something went wrong. Please try again later or call us.",
    formRequired: "Please fill in the required fields.",
    footerArea: "Norway",
  },
};
