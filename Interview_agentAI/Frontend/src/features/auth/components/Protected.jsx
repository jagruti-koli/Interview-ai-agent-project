import React, { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router'
import { toast } from 'react-toastify'

const Protected = ({ children }) => {

    const { loading, user } = useAuth()

    useEffect(() => {
        if (!loading && !user) {
            toast.error("Please login first to access this page 🔒")
        }
    }, [loading, user])

    if (loading) {
        return <main><h1>Loading......</h1></main>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected