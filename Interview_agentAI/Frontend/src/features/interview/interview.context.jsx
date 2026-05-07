import { createContext } from "react"
import { useState } from "react"

export const InterviewContext = createContext()

export const InterviewProvider = ({ children }) => {

    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])

    // ✅ NEW: user state
    const [user, setUser] = useState(null)

    return (
        <InterviewContext.Provider value={{
            loading,
            setLoading,
            report,
            setReport,
            reports,
            setReports,
            user,
            setUser
        }}>
            {children}
        </InterviewContext.Provider>
    )
}