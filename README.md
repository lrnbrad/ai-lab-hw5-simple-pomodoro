# Simple Pomodoro

A class project for a calm, browser-based study timer. It is being planned as a Vue + Vite application styled with Tailwind CSS and published as a static site on GitHub Pages.

When a long list of tasks and constant interruptions make it hard to begin, a Pomodoro timer offers a small next step: focus on one task for a set interval, then take a deliberate break. The technique was developed by Francesco Cirillo and named after the tomato-shaped timer he used as a student. Learn more at [the official Pomodoro Technique site](https://www.pomodorotechnique.com/).

## Planned experience

- Start, pause, reset, or skip a timer phase. Work and breaks advance automatically.
- Begin with 25 minutes of work, a 5-minute short break, and a 15-minute long break after four completed work sessions.
- Change all three durations and choose a long break after 1–8 work sessions. Changing a duration restarts the current phase at its new length.
- Add, edit, select, complete, and delete tasks. Give each task an estimated number of Pomodoros; completed work sessions count toward the selected task.
- See progress through the current cycle, progress on the selected task, and the number of work sessions completed today.
- Choose light or dark mode and optionally enable a short completion sound. The interface will use calm colors that distinguish work, short breaks, and long breaks.
- Read brief instructions and an explanation of the technique below the timer.

Settings, tasks, progress, and timer state will be saved in this browser using `localStorage`. If a running timer is reopened, it will continue from the exact saved countdown; time spent away from the page will not be subtracted. Data will not sync between devices.

## Project status

The application has not been implemented yet. The agreed behavior and scope are recorded in [issue #1](https://github.com/lrnbrad/ai-lab-hw5-simple-pomodoro/issues/1). Development and GitHub Pages deployment instructions will be added when the app is built.
