import { z } from 'zod';

/**
 * Zod schema for Theme
 */
export const themeSchema = z.enum(['light', 'dark', 'system']);

/**
 * Zod schema for Language
 */
export const languageSchema = z.enum(['en', 'es', 'fr', 'de']);

/**
 * Zod schema for UserPreferences
 */
export const userPreferencesSchema = z.object({
  theme: themeSchema.default('system'),
  language: languageSchema.default('en'),
  updatedAt: z.date().optional(),
});

/**
 * Type inference from Zod schema
 */
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

/**
 * Validation function for user preferences
 */
export function validatePreferences(data: unknown): UserPreferencesInput {
  return userPreferencesSchema.parse(data);
}

/**
 * Safe validation that returns result with errors
 */
export function safeValidatePreferences(data: unknown) {
  return userPreferencesSchema.safeParse(data);
}

/**
 * Partial preferences schema for updates
 */
export const partialPreferencesSchema = userPreferencesSchema.partial();

/**
 * Validate partial preferences (for updates)
 */
export function validatePartialPreferences(data: unknown) {
  return partialPreferencesSchema.parse(data);
}
