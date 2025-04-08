# AutoFlix
AutoFlix - A Simple Webapp


# 🎬 AutoFlix

AutoFlix is a sleek, lightweight movie and TV show streaming frontend that integrates multiple free embed servers and uses the OMDb API to fetch movie metadata. Designed to feel like a simplified Netflix clone, AutoFlix offers clean navigation, dynamic routing, and multiple server support for seamless playback.

 

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

🔗 [View Live AutoFlix]([[https://your-live-demo-url.com](https://auto-flix.onrender.com/)])

  
---



















 
