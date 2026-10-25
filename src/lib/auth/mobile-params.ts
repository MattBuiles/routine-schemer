/** Formas válidas de lo que manda la app móvil al empezar el login. Sin dependencias de Node: también las usa la página del navegador. */
export const STATE_RE = /^[A-Za-z0-9_-]{8,128}$/;
export const CHALLENGE_RE = /^[A-Za-z0-9_-]{43}$/; // SHA-256 en base64url, sin relleno
