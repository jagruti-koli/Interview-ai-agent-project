import { Link, useNavigate } from 'react-router'
import '../auth.form.scss'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_BASE_URL

const Register = () => {

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
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

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (!email || !username || !password) {
            return toast.error("All fields required")
        }

        try {

            const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                return toast.error(data.message || "Failed to send OTP")
            }

            toast.success("OTP sent to your email ✉️")

            navigate("/otp-login", {
                state: {
                    email,
                    username,
                    password,
                    type: "register"
                }
            })

        } catch (err) {

            console.log(err)

            toast.error("Failed to send OTP")
        }
    }

    return (
        <main>

            <div className="cursor-glow" ref={glowRef}></div>

            <motion.div
                className="form-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >

                <h1>Create Account 🚀</h1>

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label>Username</label>

                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder='Enter Your Name'
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>

                        <input
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter Email address'
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>

                        <input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Enter Password'
                        />
                    </div>

                    <button className="button primary-button">
                        Register with OTP
                    </button>

                </form>

                <p>
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

            </motion.div>

        </main>
    )
}

export default Register