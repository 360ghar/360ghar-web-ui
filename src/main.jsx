import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './index.scss'
import MobileMenuProvider from './contextApi/MobileMenuContext.jsx'
import OffCanvasProvider from './contextApi/OffCanvasContext.jsx'
import ScrollHideProvider from './contextApi/ScrollHideContext.jsx'
import BlogDataProvider from './contextApi/BlogDataContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { reportWebVitals } from './seo/reportWebVitals'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BlogDataProvider>
    <HelmetProvider>
      <ScrollHideProvider>
        <OffCanvasProvider>
          <MobileMenuProvider>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </MobileMenuProvider>
        </OffCanvasProvider>
      </ScrollHideProvider>
    </HelmetProvider>
  </BlogDataProvider>
)

// Start measuring Core Web Vitals
reportWebVitals()
