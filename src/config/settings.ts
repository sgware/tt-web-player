/**
 * Tandem Tales client settings.
 *
 * Per the Tandem Tales Web Client Requirements, these values are meant to be
 * easy to find and change directly in the source code -- they are not
 * configurable from within the running client.
 */

/** IP address / hostname of the Tandem Tales server. */
export const TT_SERVER_HOST = "localhost";

/** Port number of the Tandem Tales server's secure WebSocket endpoint. */
export const TT_SERVER_PORT = 9006;

/** Tandem Tales server version this client was built against. */
export const TT_SERVER_VERSION = "0.9.0";

/** Time (in seconds) a user has to make a choice once it's their turn. */
export const CHOICE_TIME_SECONDS = 180;

/**
 * Builds the WebSocket URL for the Tandem Tales server from the settings
 * above. Port 9006 is always wrapped in TLS by websockify on the server
 * side (see tt-web's start_ws_foreground script), so the client always
 * connects with `wss://`, regardless of how the page itself was loaded.
 */
export function getTandemTalesSocketUrl(): string {
  return `wss://${TT_SERVER_HOST}:${TT_SERVER_PORT}`;
}
