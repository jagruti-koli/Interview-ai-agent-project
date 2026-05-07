import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from '../services/auth.api'

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })

            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))

            return true
        } catch (err) {
            console.log(err.response?.data)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })

            setUser(data.user)
            localStorage.setItem("user", JSON.stringify(data.user))

            return true
        } catch (err) {
            console.log(err.response?.data)
            return false
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            localStorage.removeItem("user")
        } catch (err) {
            console.log(err.response?.data)
        } finally {
            setLoading(false)
        }
    }

    // 🔥 FIXED AUTH CHECK
    useEffect(() => {

        const getAndSetUser = async () => {
            try {
                const data = await getMe()

                if (data?.user) {
                    setUser(data.user)
                    localStorage.setItem("user", JSON.stringify(data.user))
                } else {
                    setUser(null)
                    localStorage.removeItem("user")
                }

            } catch (error) {
                setUser(null)
                localStorage.removeItem("user")
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleLogin, handleLogout, handleRegister }
}