import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.scss'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
<GoogleOAuthProvider clientId="821148191000-u6k5asmp4bvblth4vc2ktut2h8uiempk.apps.googleusercontent.com">
  <App />
</GoogleOAuthProvider>
)
