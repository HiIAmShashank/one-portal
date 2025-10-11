import { z } from 'zod';

/**
 * Zod schema for RemoteApp configuration
 */
export const remoteAppSchema = z.object({
  id: z.string().min(1, 'App ID is required'),
  name: z.string().min(1, 'App name is required'),
  remoteEntryUrl: z.string().url('Invalid remote entry URL'),
  moduleName: z.string().min(1, 'Module name is required'),
  scope: z.string().min(1, 'Scope is required'),
  icon: z.string().optional(),
  order: z.number().int().nonnegative().optional().default(0),
  enabled: z.boolean().optional().default(true),
});

/**
 * Zod schema for shell branding configuration
 */
export const brandingSchema = z.object({
  title: z.string().min(1, 'Branding title is required'),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

/**
 * Zod schema for default preferences
 */
export const defaultPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de']).optional(),
});

/**
 * Zod schema for ShellConfiguration
 */
export const shellConfigSchema = z.object({
  apps: z.array(remoteAppSchema).min(1, 'At least one app is required'),
  branding: brandingSchema,
  defaults: defaultPreferencesSchema.optional(),
});

/**
 * Type inference from Zod schema
 */
export type RemoteAppInput = z.infer<typeof remoteAppSchema>;
export type ShellConfigurationInput = z.infer<typeof shellConfigSchema>;

/**
 * Validation function for shell configuration
 */
export function validateShellConfig(data: unknown): ShellConfigurationInput {
  return shellConfigSchema.parse(data);
}

/**
 * Safe validation that returns result with errors
 */
export function safeValidateShellConfig(data: unknown) {
  return shellConfigSchema.safeParse(data);
}
