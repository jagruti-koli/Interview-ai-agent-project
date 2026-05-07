import { RouterProvider } from "react-router"
import { router } from './app.routes.jsx'
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { Toaster } from "react-hot-toast"
import "react-toastify/dist/ReactToastify.css"

const App = () => {
  return (
    <>
      <AuthProvider>
        <InterviewProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" reverseOrder={false} />
        </InterviewProvider>
      </AuthProvider>
    </>
  )
}

export default App