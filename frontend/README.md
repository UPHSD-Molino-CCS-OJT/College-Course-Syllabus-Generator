# Frontend - College Course Syllabus Generator

React + Vite + Tailwind CSS frontend for the College Course Syllabus Generator.

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UserForm.jsx      # User creation/edit form
│   │   └── UserList.jsx      # Users table display
│   ├── services/
│   │   └── api.js            # Backend API integration
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind CSS imports
├── public/                   # Static assets
├── index.html                # HTML template
├── vite.config.js            # Vite + Tailwind configuration
└── package.json              # Dependencies
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework (Vite plugin)
- **Axios** - HTTP client for API calls

## 🔌 API Integration

The frontend uses a proxy to connect to the backend API running on port 3000. All requests to `/api/*` are automatically forwarded to `http://localhost:3000`.

Ensure the backend server is running before starting the frontend.

## ✨ Features

- ✅ User Management (Create, Read, Update)
- ✅ Pagination support
- ✅ Gender filtering
- ✅ Responsive design with Tailwind CSS
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Tailwind CSS

This project uses Tailwind CSS v4 as a Vite plugin for seamless integration. The configuration is automatically handled by the `@tailwindcss/vite` plugin.

No separate `tailwind.config.js` file is needed!
