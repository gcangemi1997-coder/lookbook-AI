<div align="center">
  
# 👗 LookBook AI

### AI-powered valuation tool for second-hand fashion items
</div>

***

## ✨ Overview

**LookBook AI** is a full-stack web application that lets users get an instant AI-powered price estimate for their used clothing and fashion accessories. Upload a photo, fill in a few details, and let Google Gemini do the rest.

The project is part of a [Start2Impact](https://www.start2impact.it/) full-stack development course, built as an **AI Agents** module project.

***

## 🌐 Live Demo

Try the app live — no installation required:

**👉 [LookBook AI Demo](https://lookbook-ai-27nj.vercel.app/)**

***

## 🚀 Features

- 🔐 **Frictionless auth** — login or auto-registration with just name + email, no password needed
- 📸 **Image analysis** — upload JPG, PNG, WEBP or GIF (max 5 MB), sent as Base64 to the AI
- 🤖 **AI evaluation** — Gemini 2.5 Flash Lite returns price, price range, motivation and 3 selling tips
- 🛡️ **Safety filter** — the AI rejects any image that does not depict a fashion item
- 📋 **Evaluation history** — every result is saved per user and browsable from the UI
- 🔁 **Retry logic** — the backend retries the Gemini call up to 2 times on transient failures
- ✅ **Strict JSON validation** — every AI response is validated against a defined schema before being stored or returned

***

## 🛠️ Tech Stack

### Frontend

| Technology  | Purpose |
|---|---|
| [React](https://react.dev/) | UI library |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| CSS custom | Styling (no external UI library) |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express](https://expressjs.com/) | HTTP server & routing |
| [Google Gemini AI](https://ai.google.dev/)  | AI image evaluation |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variables |
| [cors](https://github.com/expressjs/cors) | Cross-origin request handling |
| [nodemon](https://nodemon.io/) | Dev auto-restart |

### Infrastructure

| Service | Usage |
|---|---|
| [Vercel](https://vercel.com/) | Backend serverless deployment (`vercel.json` present) |
| MongoDB Atlas | Cloud database (via Mongoose) |

***

## 🗂️ Project Structure

```
lookbook-AI/
│
├── frontend/                        # React + Vite application
│   ├── public/                      # Static assets (favicon, icons)
│   ├── src/
│   │   ├── App.jsx                  # Main component — auth, evaluation, history
│   │   ├── App.css                  # Component styles
│   │   ├── index.css                # Global base styles
│   │   └── main.jsx                 # React entry point
│   ├── index.html                   # HTML shell with meta/OG tags and favicon
│   ├── vite.config.js               # Vite configuration
│   └── package.json
│
├── backend/                         # Node.js + Express API
│   ├── api/                         # Serverless-ready route handlers
│   │   ├── login.js                 # POST /api/login — auth & auto-registration
│   │   ├── evaluate.js              # POST /api/evaluate — AI evaluation
│   │   └── history/
│   │       └── [email].js           # GET /api/history/:email — user history
│   ├── lib/                         # Shared utilities
│   │   ├── gemini.js                # Gemini API integration & prompt
│   │   ├── validate.js              # JSON schema validation for AI responses
│   │   ├── db.js                    # MongoDB/Mongoose connection helper
│   │   └── cors.js                  # CORS configuration
│   ├── vercel.json                  # Vercel deployment config
│   ├── .env.example                 # Environment variable template
│   └── package.json
│
└── .gitignore
```

***

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A MongoDB connection string (local or Atlas)

### 1 — Clone the repo

```bash
git clone https://github.com/gcangemi1997-coder/lookbook-AI.git
cd lookbook-AI
```

### 2 — Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file from the provided example:

```bash
cp .env.example .env
```

Then fill in your values:

```env
PORT=5001
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

Start the dev server:

```bash
npm run dev
```

The backend will be available at `http://localhost:5001`.

### 3 — Set up the frontend

```bash
cd ../frontend
npm install
```

Optionally create a `.env` file to override the default API URL:

```env
VITE_API_URL=http://localhost:5001
```

Start the dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

***

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ping` | Health check |
| `POST` | `/api/login` | Login or auto-register a user |
| `POST` | `/api/evaluate` | Submit an item for AI evaluation |
| `GET` | `/api/history/:email` | Retrieve a user's evaluation history |

### `POST /api/evaluate` — Request body

```json
{
  "email": "user@example.com",
  "category": "Jeans",
  "brand": "Levi's",
  "status": "buono",
  "imageBase64": "<base64-encoded-image>",
  "imageMimeType": "image/jpeg"
}
```

### `POST /api/evaluate` — Response

```json
{
  "suggestedPrice": 25,
  "range": { "min": 20, "max": 30 },
  "motivation": "Dettagliata spiegazione in italiano...",
  "sellingTips": ["Consiglio 1", "Consiglio 2", "Consiglio 3"]
}
```

***

## 🚢 Deployment

The backend is configured for deployment on **Vercel** via `backend/vercel.json`. The serverless route handlers under `backend/api/` map directly to Vercel's file-system routing convention.

The frontend can be deployed on any static host (Vercel, Netlify, GitHub Pages) by running:

```bash
cd frontend
npm run build
```

***


## 👨‍💻 Author

Built by **Giorgio Cangemi** as part of the [Start2Impact](https://www.start2impact.it/) Full Stack Developer course — AI Agents module.

***

## 📬 Contact

Feel free to reach out if you have any questions or feedback:

- 💼 [LinkedIn — Giorgio Cangemi](https://www.linkedin.com/in/giorgio-cangemi-7b4b77172/)
- 📧 [g.cangemi1997@gmail.com](mailto:g.cangemi1997@gmail.com)

***

<div align="center">
  <sub>Made with ☕ and a lot of fashion sense.</sub>
</div>
