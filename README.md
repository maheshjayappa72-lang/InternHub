# InternHub — Responsive Internship Board

A beginner-friendly internship listing interface built with plain HTML, CSS, and JavaScript. It uses the supplied fictional internship records and does not require a framework.

## Features

- Loads five fictional internship records from `internships.json`.
- Search by role, skill, ID, domain, work mode, or location.
- Filter by domain and work mode at the same time.
- Loading, empty, error, and retry states.
- Details dialog for each role.
- Accessible application form with labels, validation messages, and focus management.
- Demo duplicate-application check in browser storage.
- Responsive card grid, visible keyboard focus, skip link, live result count, and reduced-motion support.

## Files

- `index.html` — semantic page structure and dialogs.
- `internship2.css` — styling and responsive layouts.
- `web.js` — data loading, filtering, card rendering, details, and demo application behavior.
- `internships.json` — supplied seed data.

## Run locally

Because the page uses `fetch()` to read `internships.json`, run it from a local web server rather than opening `index.html` directly.

1. Open this folder in VS Code.
2. Install/enable the **Live Server** extension if needed.
3. Right-click `index.html` and select **Open with Live Server**.

A simple alternative is to run `python -m http.server 8000` from this folder and open `http://localhost:8000`.

## Responsive and accessibility checks

Recommended manual checks:
- 360px mobile: one card per row, no horizontal page scrolling.
- 768px tablet: two cards per row.
- 1366px desktop: three cards per row.
- Use Tab and Shift+Tab to reach controls; use Enter/Space to activate buttons.
- Try a search with no matches, combine search with both filters, and reset filters.
- Temporarily rename `internships.json` to check the error and retry states, then restore the filename.
- Check that the dialogs close with Escape and that focus returns to the invoking control.

Record actual test results before submitting; do not claim checks you have not performed.

## Demo application limitations

The application form validates the name, email, and optional portfolio URL in the browser and prevents duplicate demo applications in local browser storage. This is **not a production backend**: data is not sent to a company, and client-side validation/storage can be bypassed. A real deployment requiring server-side duplicate rejection, secure logging, authentication, or a paginated API needs a backend service and database.

## Deployment

Upload the files to one public GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, and save. After GitHub Pages finishes deploying, open the published URL and verify the data loads. Keep this README in the same repository so one repository link contains the code and explanation.

## Data

All internship records are fictional sample data supplied for this task.
