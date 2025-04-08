# AutoFlix
AutoFlix - A Simple Webapp


# 🎬 AutoFlix

AutoFlix is a sleek, lightweight movie and TV show streaming frontend that integrates multiple free embed servers and uses the OMDb API to fetch movie metadata. Designed to feel like a simplified webapp, AutoFlix offers clean navigation, dynamic routing, and multiple server support for seamless playback.

 

---



## 🚀 Features

### 🔍 Smart Search
- Search for movies and TV shows using the [OMDb API](http://www.omdbapi.com/)
- Real-time results display with posters, titles, and release years
- Paginated results with contextual headers

### 🎥 Movie & TV Details
- Full detail view: Title, Year, Genre, Plot, Actors, Country, and IMDb rating (linked)
- Dynamic CTA ("Watch Now") with simplified logic for either movies or episodes

### 📺 TV Series Support
- Auto-load available seasons and episodes per series
- Inline episode listing with individual "Watch Now" buttons
- Fully dynamic episode and season browsing

### 📡 Embed Player with Server Switching
- Integrated following Streaming Servers :
  - `vidsrc.cc`
  - `multiembed.mov`
  - `autoembed.cc`
  - `embed.su`
- "Now Watching" banner with title & episode info
- Dropdown to switch between servers without reloading the view
- Custom embed URLs for each platform (autoplay & quality support included)

### 🔄 SPA Routing
- Hash-based routing system (`#detailView`, `#embedViewerView`, etc.)
- Supports deep linking for sharing watch URLs
- Smooth transitions using `pushState` and `popstate` for back/forward navigation

### 💻 Modern UI Interactions
- Responsive view switching
- Clean UI with view-based component rendering
- Fast DOM updates and minimal external dependencies


---



## 📦 Tech Stack

| Layer        | Tech                 |
| ------------ | -------------------- |
| Frontend     | Vanilla JavaScript   |
| UI Markup    | HTML5 + CSS3         |
| API          | [OMDb API](https://www.omdbapi.com/) |
| Embeds       | `vidsrc`, `multiembed`, `autoembed`, `embed.su` |
| Routing      | Hash-based SPA Router |
| Deployment   | GitHub Pages / Netlify / Vercel |



---



## 🌐 Live Demo

🔗 [View Live AutoFlix](https://auto-flix.onrender.com/)

## 🌐 Live Demo

🔗 <a href="https://auto-flix.onrender.com/" target="_blank" rel="noopener noreferrer">View Live AutoFlix</a>

  
---

## ⚠️ Disclaimer

AutoFlix is a **personal project built purely for educational and experimental purposes**. This app:

- Does **not host** or store any videos, media files, or content on its own servers.
- Utilizes **freely available public APIs** and **iframe-based embeds** from third-party services.
- Is **not affiliated** with any of the video providers (like `vidsrc`, `multiembed`, `autoembed`, or `embed.su`).
- Does **not claim ownership** of any media accessed via embedded players.

If you are a **rightful copyright owner**
and object to any content being displayed via this app, please contact us and we will take the webapp down immediately.

> This app was built just for fun using free tools found around the web.  
> Please **support the filmmakers and creators** — watch, rent, or buy movies and TV shows legally.


















 
