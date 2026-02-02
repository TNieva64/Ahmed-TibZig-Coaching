import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((proto: string) => proto.trim().toLowerCase() === "https");
}

/**
 * Retourne les options sécurisées pour les cookies de session
 *
 * SÉCURITÉ:
 * - httpOnly: true - Empêche l'accès aux cookies via JavaScript (prévient les attaques XSS)
 * - secure: true (en production) - Le cookie n'est transmis que sur HTTPS (prévint les interceptions)
 * - sameSite: 'lax' - Protection CSRF: cookies envoyés uniquement sur les requêtes top-level navigation
 *   'lax' est recommandé au lieu de 'none' pour équilibrer sécurité et UX
 *
 * Pourquoi 'lax' au lieu de 'none' ?
 * - 'none' nécessite 'secure: true' et permet les cookies cross-site (vulnérable au CSRF)
 * - 'lax' bloque les cookies cross-site sauf pour les navigations top-level (meilleure protection CSRF)
 * - 'strict' serait trop restrictif pour l'UX (bloquerait les liens externes)
 */
export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    domain: undefined,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecureRequest(req),
  };
}
