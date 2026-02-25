import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeSocket } from "../socket";
import { registerStripeRoutes } from "./stripe-routes";
import { BODY_LIMIT, MONITORING_PAYLOAD_THRESHOLD } from "./security";
import {
  apiLimiter,
  authLimiter,
  corsConfig,
  securityHeaders,
  validateContentType,
  requestLogger,
  timeoutMiddleware,
  sanitizeInput,
} from './security-middleware';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

/**
 * Middleware de monitoring pour les payloads volumineux
 *
 * SÉCURITÉ:
 * - Alertent sur les requêtes avec des payloads >5mb
 * - Aide à détecter les abus potentiels ou les anomalies
 * - Journalise les informations contextuelles pour le debugging
 */
function largePayloadMonitoring(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);

  if (contentLength > MONITORING_PAYLOAD_THRESHOLD) {
    const sizeInMB = (contentLength / (1024 * 1024)).toFixed(2);
    console.warn(
      `[SECURITY] Payload volumineux détecté: ${sizeInMB}MB | ` +
      `Méthode: ${req.method} | ` +
      `Route: ${req.path} | ` +
      `IP: ${req.ip} | ` +
      `User-Agent: ${req.headers['user-agent']}`
    );
  }

  next();
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();

  // === SÉCURITÉ: Trust proxy pour rate limiting derrière reverse proxy ===
  // Permet de récupérer l'IP réelle du client derrière Nginx/Cloudflare
  app.set('trust proxy', 1);
  const server = createServer(app);

  // Middleware de monitoring pour les payloads volumineux (avant le body parser)
  app.use(largePayloadMonitoring);

  // Configure body parser avec une limite réduite pour la sécurité
  // SÉCURITÉ: La limite est réduite de 50mb à 10mb pour réduire la surface d'attaque
  app.use(express.json({ limit: BODY_LIMIT }));
  app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));

  // === SÉCURITÉ: Middlewares de protection ===
  app.use(securityHeaders);
  app.use(corsConfig);
  app.use(requestLogger);
  app.use(timeoutMiddleware(30000));
  app.use(sanitizeInput);

  // Rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/trpc/auth', authLimiter);
  app.use('/api/trpc/system.auth', authLimiter);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Stripe payment routes
  registerStripeRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  // Initialize Socket.IO
  initializeSocket(server);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
