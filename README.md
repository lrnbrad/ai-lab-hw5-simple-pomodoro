# Simple Pomodoro

A calm, browser-based study timer built with Vue, Vite, and Tailwind CSS. It runs entirely in the browser and can be hosted as a static site on GitHub Pages.

When a long list of tasks and constant interruptions make it hard to begin, a Pomodoro timer offers a small next step: focus on one task for a set interval, then take a deliberate break. The technique was developed by Francesco Cirillo and named after the tomato-shaped timer he used as a student. Learn more at [the official Pomodoro Technique site](https://www.pomodorotechnique.com/).

## Features

- Start, pause, reset, or skip a timer phase. Work and breaks advance automatically.
- Begin with 25 minutes of work, a 5-minute short break, and a 15-minute long break after four completed work sessions.
- Change all three durations and choose a long break after 1–8 work sessions. Changing a duration restarts the current phase at its new length.
- Add, edit, select, complete, and delete tasks. Give each task an estimated number of Pomodoros; completed work sessions count toward the selected task.
- See progress through the current cycle, progress on the selected task, and the number of work sessions completed today.
- Choose light or dark mode and optionally enable a short completion sound. The interface uses different colors for work, short breaks, and long breaks.
- Read brief instructions and an explanation of the technique below the timer.

Settings, tasks, progress, and timer state are saved in this browser using `localStorage`. If a running timer is reopened, it continues from the exact saved countdown; time spent away from the page is not subtracted. Data does not sync between devices or browsers.

## Use the app

1. Add a task, set its estimated number of focus sessions, and select it.
2. Press **Start** to focus. Use **Pause**, **Reset**, or **Skip** when needed. Only a completed work timer counts toward your task and daily total.
3. Follow the automatic short and long breaks. Use **Settings** to change the durations and cycle length, or opt in to a completion sound.
4. Switch between light and dark mode with the button above the timer.

## Run locally

Use Node.js 22.12 or newer and npm:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build and preview the production site:

```sh
npm run build
npm run preview
```

The production preview uses the repository subpath, so open the preview URL with `/ai-lab-hw5-simple-pomodoro/` at the end. Run browser checks with `npm run test:e2e`; run the built-site subpath check with `npm run test:e2e:pages`. Playwright needs a Chromium browser installed.

## Publish on GitHub Pages

This repository sets Vite's `base` to `/ai-lab-hw5-simple-pomodoro/`. The [deployment workflow](.github/workflows/deploy-pages.yml) builds the app and uploads `dist` when changes reach `main`.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. Merge the feature branch into `main`, then check the **Actions** tab for the deployment result. The site will be available at `https://lrnbrad.github.io/ai-lab-hw5-simple-pomodoro/` after a successful deployment.

The app needs no server, account, or database. Clearing this site's browser data removes saved tasks, settings, and progress.
