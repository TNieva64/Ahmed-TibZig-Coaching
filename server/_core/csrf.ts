/**
 * Middleware de protection CSRF
 *
 * Ce middleware génère et valide les tokens CSRF
 * pour protéger contre les attaques Cross-Site Request Forgery
 */

import { randomBytes } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Générer un token CSRF sécurisé
 */
export const generateCSRFToken = (): string => {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('base64');
};

/**
 * Middleware pour générer et stocker le token CSRF
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Ignorer les requêtes GET, HEAD, OPTIONS (lecture seule)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Pour les requêtes POST/PUT/DELETE, vérifier le token
  const tokenCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const tokenHeader = req.headers?.[CSRF_HEADER_NAME];

  if (!tokenCookie || !tokenHeader || tokenCookie !== tokenHeader) {
    return res.status(403).json({
      error: 'Token CSRF invalide ou manquant',
      message: 'Votre session a expiré, veuillez rafraîchir la page'
    });
  }

  // Régénérer le token après chaque utilisation (double submit cookie pattern)
  const newToken = generateCSRFToken();
  res.cookie(CSRF_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  });

  // Ajouter le nouveau token dans les headers pour que le client puisse le récupérer
  res.setHeader('X-CSRF-Token', newToken);

  next();
};

/**
 * Middleware pour générer et exposer le token CSRF
 * Utilisé pour l'endpoint /api/csrf-token
 */
export const getCSRFTokenEndpoint = (req: Request, res: Response) => {
  const token = generateCSRFToken();
  
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ token });
};
