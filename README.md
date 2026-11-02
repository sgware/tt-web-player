# Tandem Tales Web Player

A web client for playing [Tadem Tales](https://sgware.github.io/tt) made with
Vite + React + TypeScript app styled with Tailwind CSS v4 and
[shadcn/ui](https://ui.shadcn.com).

## Requirements

This project requires Node.JS and Git to be installed in the device that this project is runnning.

## Build from Source

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm run build          # production build
npm run lint           # oxlint
```

The Connect page expects a Tandem Tales server reachable at the address
configured in [`src/config/settings.ts`](src/config/settings.ts) (default:
`wss://localhost:9006`.

## GitHub Workflow Build

Every push to `main` runs [`.github/workflows/build.yml`](.github/workflows/build.yml),
which builds the client and publishes only the compiled files (`dist/`) to
this repository's `dist` branch. The `tt-web` Docker image downloads that
branch into its `/play` directory when its built.

## Survey Questions

You can change the survey questions by modifying the [`src/config/questions.json`](src/config/questions.json) file.

## Changing Configurations

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

## License

The Tandem Tales Web Client was developed by Lasantha Senanayake, graduate
research assistant in the Computer Science Department at the University of
Kentucky. It is part of the larger Tandem Tales set of projects overseen by
Stephen G. Ware, Associate Professor of Computer Science at the same
university. Development was sponsored in part by a grant from the US National
Science Foundation, #2145153.

Tandem Tales is released under the GNU General Public License version 3.0 (GPL
3). This means you are free to share and modify this software, even for
commercial purposes, as long as you give credit to the original creators and you
also release your modifications under the GPL 3 license. See the license file
for details. The University of Kentucky retains all rights not specifically
granted.

To license Tandem Tales for a project not compatible with the terms of the GPL
license, contact the University of Kentucky Office of Technology
Commercialization at <otcinfo@uky.edu>.

## Version History

- Version 1.0.0: First major release.