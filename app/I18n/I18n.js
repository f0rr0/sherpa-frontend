import I18n from 'react-native-i18n'

// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
I18n.fallbacks = true

// All translations for the app go here:
I18n.translations = {
  en: {
    signIn: 'Connect With Instagram',
  },
  fr: {
    signIn: 'Se connecter',
  }
}

export default I18n
