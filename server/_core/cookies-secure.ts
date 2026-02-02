/**
 * Configuration sécurisée des cookies
 *
 * Ce fichier définit les options de cookies sécurisées
 * conformément aux meilleures pratiques OWASP
 */

import type { CookieOptions } from 'express';

/**
 * Durées de validité des cookies
 */
export const COOKIE_EXPIRY = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Options de cookie sécurisées pour la session
 */
export const getSecureCookieOptions = (): CookieOptions => ({
  httpOnly: true, // JavaScript ne peut pas lire le cookie (protection XSS)
  secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en production
  sameSite: 'lax', // Protection CSRF
  maxAge: COOKIE_EXPIRY.SEVEN_DAYS,
  path: '/',
  domain: process.env.COOKIE_DOMAIN, // .andaloussicoaching.com pour les sous-domaines
});

/**
 * Options de cookie pour le token CSRF
 */
export const getCSRFCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: COOKIE_EXPIRY.ONE_DAY,
  path: '/',
});

/**
 * Options de cookie pour les préférences (non-sensible)
 */
export const getPreferencesCookieOptions = (): CookieOptions => ({
  httpOnly: false, // JavaScript peut lire (besoin pour le bandeau cookies)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: COOKIE_EXPIRY.THIRTY_DAYS,
  path: '/',
});
