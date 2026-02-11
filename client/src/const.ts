export { COOKIE_NAME, SEVEN_DAYS_MS, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Si pas de OAuth externe configuré, utiliser le callback direct
  if (!oauthPortalUrl || oauthPortalUrl.includes(window.location.hostname)) {
    // Mode self-hosted : rediriger vers le callback avec un code factice
    return `/api/oauth/callback?state=${encodeURIComponent(state)}&type=signIn`;
  }

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
