
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add dark theme class if user prefers dark mode
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
