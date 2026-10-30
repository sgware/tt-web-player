# tt-web-player

The Tandem Tales web client: a Vite + React + TypeScript app styled with
Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com).

## Required programs

This project requires Node.JS and Git to be installed in the device that this project is runnning.

## Initialize the project

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm run build          # production build
npm run lint           # oxlint
```

The Connect page expects a Tandem Tales server reachable at the address
configured in [`src/config/settings.ts`](src/config/settings.ts) (default:
`wss://localhost:9006`.

## GitHub workflow build

Every push to `main` runs [`.github/workflows/build.yml`](.github/workflows/build.yml),
which builds the client and publishes only the compiled files (`dist/`) to
this repository's `dist` branch. The `tt-web` Docker image downloads that
branch into its `/play` directory when its built.

## Survey questions

You can change the survey questions by modifying the [`src/config/questions.json`](src/config/questions.json) file.

## Changing configurations

You also can change the configurations related to the tandem tales client. To do that, modify the file [`src/config/settings.ts`](src/config/settings.ts)

Following are the available settings that you can change:

```js

/** IP address / hostname of the Tandem Tales server. */
TT_SERVER_HOST  "localhost"

/** Port number of the Tandem Tales server's secure WebSocket endpoint. */
TT_SERVER_PORT 9006

/** Tandem Tales server version this client was built against. */
TT_SERVER_VERSION "1.0.0"

/** Time (in seconds) a user has to make a choice once it's their turn. */
CHOICE_TIME_SECONDS 180;

```
