# Daymark Task Manager

Daymark is a small task manager for organizing coursework, personal errands, and campus life. It uses plain browser JavaScript, HTML, and CSS. There are no frameworks, packages, or build steps.

## Open the app

Open `index.html` in a browser. Tasks are stored in that browser with `localStorage` and remain there after refreshing the page.

## Use the app

- Add a task with the quick-add field or the **New task** form.
- Set a project, priority, due date, and optional note. Select a task title to edit it.
- Switch between Inbox, Today, Upcoming, Completed, and project views.
- Search, filter by priority, sort tasks, mark them complete, or delete them from the task menu.
- Set a daily spending limit in Indian rupees (INR), browse dates, and record or remove expenses in the Daily budget panel.
- Daily budgets and expenses are stored separately from tasks in this browser.

## Project files

- `index.html` is the page shell.
- `app.js` contains the task and budget data, rendering, and event handling.
- `styles.css` contains the visual theme and responsive layout.