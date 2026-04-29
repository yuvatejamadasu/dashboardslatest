/**
 * languageUtil.js
 * Utility to switch i18n language (no Google Translate).
 */
import i18n from '../i18n';

/**
 * Set the application language.
 * @param {'en'|'sw'} langCode
 */
export function setTranslateLanguage(langCode) {
  i18n.changeLanguage(langCode);
  localStorage.setItem('appLanguage', langCode);
}

/**
 * Get the currently active language display name.
 * @returns {'English'|'Kenya'}
 */
export function getActiveLang() {
  const lang = localStorage.getItem('appLanguage') || 'en';
  return lang === 'sw' ? 'Kenya' : 'English';
}
