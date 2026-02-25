/**
 * Middleware de sécurité - Rate limiting, CORS, Headers
 *
 * Ce fichier ajoute les protections de sécurité essentielles
 * pour une mise en production sûre.
 */

import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting - Protection contre DDoS et brute force
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: 900 // 15 minutes en secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Ne pas limiter en développement
  skip: (req: Request) => process.env.NODE_ENV === 'development',
});

/**
 * Rate limiting plus strict pour les routes sensibles (auth, login)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de login
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard',
    retryAfter: 900
  },
  skip: (req: Request) => process.env.NODE_ENV === 'development',
});

/**
 * Configuration CORS - Contrôler les origines autorisées
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'https://andaloussicoaching.com',
      'https://www.andaloussicoaching.com',
    ];

    // En développement, accepter toutes les origines
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // En production, vérifier l'origine
    if (!origin) {
      callback(null, true); // Requêtes same-origin
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origine non autorisée par CORS'));
    }
  },
  credentials: true, // Permettre les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400, // 24 heures
});

/**
 * Headers de sécurité - Protection XSS, clickjacking, etc.
 * CSP RÉACTIVÉ avec configuration sécurisée
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * Middleware de validation Content-Type
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.url.startsWith('/api/trpc')) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Content-Type doit être application/json',
        received: contentType
      });
    }
  }
  next();
};

/**
 * Middleware de logging des requêtes (en production)
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, url, ip } = req;
      const { statusCode } = res;

      // Logger les requêtes lentes ou en erreur
      if (statusCode >= 400 || duration > 1000) {
        console.log(`[Request] ${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
      }
    });
  }

  next();
};

/**
 * Middleware de timeout - Protection contre les requêtes qui bloquent
 */
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'La requête a expiré',
          timeout: timeoutMs
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    next();
  };
};

/**
 * Middleware de sanitization des inputs
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Supprimer les caractères dangereux potentiels des query params
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }
  next();
};
