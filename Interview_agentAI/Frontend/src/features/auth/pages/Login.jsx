import { Link, useNavigate } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

const formVariant = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
}

const BASE_URL = import.meta.env.VITE_BASE_URL

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const glowRef = useRef(null)

    useEffect(() => {
        const moveGlow = (e) => {
            if (!glowRef.current) return
            glowRef.current.style.left = `${e.clientX}px`
            glowRef.current.style.top = `${e.clientY}px`
        }

        window.addEventListener("mousemove", moveGlow)
        return () => window.removeEventListener("mousemove", moveGlow)
    }, [])

    // 🔐 Normal login
    const handleSubmit = async (e) => {
        e.preventDefault()

        const success = await handleLogin({ email, password })

        if (success) {
            toast.success("Login successful 🎉")
            window.location.href = "/"
        } else {
            toast.error("Invalid credentials")
        }
    }

    // 🔢 OTP login
    const handleOTPLogin = async () => {

        if (!email) return toast.error("Enter email first")

        try {
            await fetch(`${BASE_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            toast.success("OTP sent ✉️")

            navigate("/otp-login", {
                state: {
                    email,
                    type: "login"
                }
            })

        } catch {
            toast.error("Failed to send OTP")
        }
    }

    if (loading) {
        return <main><h1>Loading......</h1></main>
    }

    return (
        <main>

            <div className="cursor-glow" ref={glowRef}></div>

            <motion.div
                className="form-container"
                variants={formVariant}
                initial="hidden"
                animate="show"
            >
                <h1>Welcome Back 👋</h1>

                {/* 🔐 NORMAL LOGIN */}
                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Enter password"
                        />
                    </div>

                    <button className="button primary-button">
                        Login
                    </button>
                </form>

                {/* 🔢 OTP LOGIN */}
                <button
                    className="button primary-button"
                    style={{ marginTop: "10px" }}
                    onClick={handleOTPLogin}
                >
                    Login with OTP
                </button>

                {/* 🌐 GOOGLE LOGIN */}
                <div style={{ marginTop: "20px" }}>
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {

                            const decoded = jwtDecode(credentialResponse.credential)

                            try {
                                const res = await fetch(`${BASE_URL}/api/auth/google`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        username: decoded.name,
                                        email: decoded.email
                                    })
                                })

                                const data = await res.json()

                                localStorage.setItem("user", JSON.stringify(data.user))

                                toast.success("Google Login successful 🚀")

                                window.location.href = "/"

                            } catch {
                                toast.error("Google login failed")
                            }
                        }}

                        onError={() => {
                            toast.error("Google Login Failed")
                        }}
                    />
                </div>

                <p>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>

            </motion.div>

        </main>
    )
}

export default Login