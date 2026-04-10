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
