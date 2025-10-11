/**
 * User preferences types for theme and language settings
 * Supports persistence across sessions via localStorage
 */

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de';

export interface UserPreferences {
  /**
   * Selected color theme
   * @default 'system'
   */
  theme: Theme;

  /**
   * Selected interface language
   * @default 'en'
   */
  language: Language;

  /**
   * Timestamp of last preference update
   */
  updatedAt?: Date;
}

/**
 * Language labels for display in UI
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
};

/**
 * Theme labels for display in UI
 */
export const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};
