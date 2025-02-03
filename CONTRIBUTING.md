# Focu Contributing

## Prerequisites

- Node.js 20
- Rust 1.60+
- pnpm 8+

## Setup

Focu is a monorepo built using [Turbo](https://turbo.build/) and [pnpm](https://pnpm.io/installation).

The main desktop app is built with [Tauri](https://tauri.app/), be sure to read Tauri's prerequisites and setup instructions [here](https://v2.tauri.app/start/prerequisites/).

```bash
pnpm install
```

## Running the app

```bash
pnpm dev
```

or if you only want to run the desktop app:

```bash
pnpm dev --filter desktop
```


## Building the app

```bash
pnpm build
```

or if you only want to build the desktop app:

```bash
pnpm build --filter desktop
```

> Note: Apple Notarization errors might occur during the build process.