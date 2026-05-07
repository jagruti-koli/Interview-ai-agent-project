import { useLocation, useNavigate } from "react-router"
import { useState, useRef, useEffect } from "react"
import toast from "react-hot-toast"
import "../auth.form.scss"

const Otp = () => {
    const location = useLocation()
    const navigate = useNavigate()

    // ✅ SAFE STATE ACCESS
    const state = location.state || {}

    const email = state.email || localStorage.getItem("otp_email")
    const username = state.username
    const password = state.password
    const type = state.type

    const [otp, setOtp] = useState(Array(6).fill(""))
    const [timer, setTimer] = useState(0)
    const inputsRef = useRef([])

    // 🚨 GUARD: prevent broken access
    useEffect(() => {
        if (!email) {
            toast.error("Session expired. Please try again.")
            navigate("/register")
        }
    }, [email, navigate])

    // ✅ SEND OTP (SAFE)
    useEffect(() => {
        if (!email) return

        const sendOtp = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",   
                    body: JSON.stringify({ email })
                })
                const data = await res.json()

                if (!res.ok) {
                    toast.error(data.message || "Failed to send OTP")
                    return
                }

                setTimer(data.expiresIn || 300)
                toast.success("OTP sent successfully ✉️")

            } catch (err) {
                toast.error("Server error while sending OTP")
            }
        }

        sendOtp()
    }, [email])

    // ✅ TIMER
    useEffect(() => {
        if (timer <= 0) return

        const interval = setInterval(() => {
            setTimer(prev => prev - 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [timer])

    // ✅ INPUT CHANGE
    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    // ✅ VERIFY OTP (SAFE)
    const handleVerify = async () => {
        const otpValue = otp.join("")

        if (otpValue.length !== 6) {
            return toast.error("Enter complete OTP")
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",  
                body: JSON.stringify({ email, otp: otpValue })
            })

            const data = await res.json()

            if (!res.ok) {
                return toast.error(data.message || "Invalid OTP")
            }

            localStorage.setItem("user", JSON.stringify(data.user))

            toast.success("Verification successful 🎉")
            navigate("/")

        } catch (err) {
            toast.error("OTP verification failed")
        }
    }

    // ✅ AUTO VERIFY ONLY WHEN COMPLETE
    useEffect(() => {
        if (otp.every(d => d !== "")) {
            handleVerify()
        }
    }, [otp])

    // ✅ RESEND OTP
    const resendOtp = async () => {
        if (timer > 0) {
            return toast.error("Wait before resending OTP")
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                return toast.error(data.message || "Failed to resend OTP")
            }

            setTimer(data.expiresIn || 300)
            toast.success("OTP resent ✉️")

        } catch (err) {
            toast.error("Resend failed")
        }
    }

    return (
        <main className="otp-page">
            <div className="otp-card">

                <h2>Verify OTP</h2>

                <p>
                    Sent to <strong>{email}</strong>
                </p>

                <div className="otp-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => inputsRef.current[index] = el}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength={1}
                            className="otp-input"
                        />
                    ))}
                </div>

                <button onClick={handleVerify} className="button primary-button">
                    Verify OTP
                </button>

                <p className="resend-text">
                    {timer > 0 ? (
                        `Resend in ${timer}s`
                    ) : (
                        <span onClick={resendOtp} style={{ cursor: "pointer", color: "#ff4d6d" }}>
                            Resend OTP
                        </span>
                    )}
                </p>

            </div>
        </main>
    )
}

export default Otp