/**
 * Configuration Sentry — Error Tracking
 *
 * Capture et signale les erreurs en production
 */

import * as Sentry from '@sentry/react';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN || '',
    environment: process.env.NODE_ENV,
    release: process.env.VITE_RELEASE_VERSION || '1.0.0',
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Tracing
    tracesSampleRate: 0.1, // 10% des transactions en prod
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% des sessions normales
    replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreurs
    
    // Filtres
    beforeSend(event, hint) {
      // Filtrer les erreurs non critiques
      if (event.exception) {
        const error = hint.originalException;
        
        // Ignorer les erreurs de réseau (client déconnecté, etc.)
        if (error instanceof Error && error.message.includes('fetch')) {
          return null;
        }
      }
      
      return event;
    },
    
    // BeforeSendTransaction pour filtrer les transactions
    beforeSendTransaction(event) {
      // Ignorer les transactions de santé (health checks)
      if (event.transaction === '/health') {
        return null;
      }
      
      return event;
    },
    
    // Contexte utilisateur
    initialScope: {
      tags: {
        component: 'frontend',
      },
    },
  });
}

export * from '@sentry/react';
