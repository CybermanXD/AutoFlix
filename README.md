# AutoFlix

AutoFlix is a lightweight, Netflix-style web app for discovering movies and TV series, exploring details, and watching embedded streams with season/episode navigation.

## Live Demo

https://autoflix-vr4s.onrender.com/

## Features

- Search movies and TV series via OMDb.
- Detail view with poster, synopsis, cast, ratings, and metadata.
- TV series episode list with season selection.
- Watch view with multi-server embed switching.
- Previous/Next episode navigation and episode selectors.
- Responsive layout with a clean, dark UI.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- OMDb API
- Render (hosting)

## Project Structure

- index.html — UI and layout
- script.js — app logic (search, details, episode handling, embeds)
- deploy.txt — deployment steps (Render)
- Dockerfile — optional Docker web-service hosting

## Local Setup

1. Clone the repository.
2. Open index.html in your browser (or use a local dev server).

If you want a simple local server:

```bash
python -m http.server 5500
```

Then open: http://localhost:5500

## Deployment

This project can be deployed as a Render Static Site or a Docker Web Service. See deploy.txt for step-by-step instructions.

## Notes

- The app uses the public OMDb API for search and series data.
- Embed sources are provided for convenience and can be adjusted in script.js.

## License

MIT
