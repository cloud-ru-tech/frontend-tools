import i18next, { InitOptions, ResourceLanguage, TFunction, ThirdPartyModule } from 'i18next';
import Backend from 'i18next-http-backend';

import { Languages, LOCALSTORAGE_LANGUAGE_KEY } from './constants';
import { CUSTOM_NAVIGATOR_DETECTOR_NAME, languageDetector } from './detectors';

type InterpolationVariables = Record<string, string>;

export type AdditionalResources = Record<Exclude<Languages, Languages.CIMode>, ResourceLanguage>;

export type I18nConfigProps = {
  initReactI18next: ThirdPartyModule;
  backendLoadPath?: string;
  additionalResources?: AdditionalResources;
  interpolationVariables?: InterpolationVariables;
};

declare module 'i18next' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface CustomTypeOptions {
    returnNull: false;
  }
}

const getInitConfig = ({
  backendLoadPath,
  additionalResources,
  interpolationVariables,
}: {
  backendLoadPath?: string;
  additionalResources?: AdditionalResources;
  interpolationVariables?: InterpolationVariables;
}): InitOptions => ({
  react: {
    useSuspense: false,
  },
  backend: backendLoadPath
    ? {
        loadPath: backendLoadPath,
      }
    : undefined,
  returnNull: false,
  supportedLngs: Object.values(Languages),
  fallbackLng: Languages.Ru,
  debug: false,
  detection: {
    order: ['querystring', 'cookie', CUSTOM_NAVIGATOR_DETECTOR_NAME],
    caches: ['cookie'],
    lookupQuerystring: 'lang',
    lookupCookie: 'lang',
    lookupLocalStorage: LOCALSTORAGE_LANGUAGE_KEY,
  },
  interpolation: {
    escapeValue: false,
    defaultVariables: {
      nbsp: '\u00A0',
      mdash: '\u2014',
      ...(interpolationVariables || {}),
    },
  },
  partialBundledLanguages: true,
  resources: {
    cimode: {
      translation: {},
    },
    ...(additionalResources || {}),
  },
});

export const i18nConfig = ({ initReactI18next, ...props }: I18nConfigProps): Promise<TFunction> => {
  if (props.backendLoadPath) {
    const backendLoadPath = `${props.backendLoadPath}${process.env.COMMIT ? `?hash=${process.env.COMMIT}` : ''}`;

    return i18next
      .use(Backend)
      .use(languageDetector)
      .use(initReactI18next)
      .init(getInitConfig({ ...props, backendLoadPath }));
  }

  return i18next.use(languageDetector).use(initReactI18next).init(getInitConfig(props));
};
