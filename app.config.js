/**
 * Dynamic Expo config. Expo reads app.json first and passes it here as `config`;
 * we inject the Supabase keys from .env (gitignored) into expo.extra so secrets
 * stay OUT of source control. With no .env present, extra stays empty and the
 * app runs fully offline — sync is purely additive. Only the public anon /
 * publishable key ever belongs here; the service-role key is server-only. For
 * EAS cloud builds, set the same two values as EAS secrets.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    supabaseUrl: process.env.SUPABASE_URL ?? config.extra?.supabaseUrl ?? '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? config.extra?.supabaseAnonKey ?? '',
  },
});
