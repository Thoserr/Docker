# Cool Landing Page

This is a **modern, responsive landing page** built with plain HTML, Tailwind CSS (via CDN), and a sprinkle of vanilla JavaScript. It fetches inspirational quotes from a public API, making the site dynamic while remaining *100 % static-host friendly*.

## 🔥 Features

* Fully responsive design out-of-the-box thanks to Tailwind CSS
* Modern hero section with parallax background
* Smooth scroll navigation
* Dynamic quote generator powered by [quotable.io](https://github.com/lukePeavey/quotable)
* No build step or dependencies – works on any static host (GitHub Pages, Vercel, Netlify, etc.)

## 🚀 Quick start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cool-landing-page.git
   cd cool-landing-page
   ```
2. **Open `index.html`** in your favourite browser – that’s it!

   ```bash
   # on macOS/Linux
   open index.html

   # Windows (PowerShell)
   start index.html
   ```

   Or serve locally with Python for live reload:
   ```bash
   python3 -m http.server 8000
   # then visit http://localhost:8000 in your browser
   ```

## 🌐 Deploying to GitHub Pages

1. Commit and push the project to a new GitHub repository.
2. In the repo settings, enable **GitHub Pages** and point it to the `main` branch (or `/docs` folder if you prefer).
3. Visit `https://<your-username>.github.io/<repo-name>/` ✨

## 📁 Project structure

```
├── index.html       # Main HTML file
├── styles.css       # Custom CSS overrides (optional)
├── script.js        # JavaScript for interactivity
└── README.md        # You are here
```

## 📝 License

Released under the MIT License – see `LICENSE` for details.