import { useState, useRef, useEffect } from "react"
import axios from "axios"
import "./chatbot.scss"

const Chatbot = () => {

    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: "ai", text: "Hi 👋 I'm your AI assistant. Ask me anything!" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null)

    // ✅ Auto scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, loading])

    // ✅ Send Message
    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const userMsg = { role: "user", text: input }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await axios.post("http://localhost:5000/api/chat", {
                message: input
            })

            setMessages(prev => [
                ...prev,
                { role: "ai", text: res.data.reply }
            ])

        } catch (err) {
            setMessages(prev => [
                ...prev,
                { role: "ai", text: "⚠️ Something went wrong" }
            ])
        }

        setLoading(false)
    }

    // ✅ Enter key support
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="chatbot">

            {/* Floating Button */}
            <button
                className="chatbot__toggle"
                onClick={() => setOpen(prev => !prev)}
            >
                💬
            </button>

            {open && (
                <div className="chatbot__window">

                    {/* Header */}
                    <div className="chatbot__header">
                        <div className="chatbot__title">
                            🤖 AI Assistant
                        </div>
                        <button
                            className="chatbot__close"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot__messages">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`chatbot__message chatbot__message--${msg.role}`}
                            >
                                {msg.text}
                            </div>
                        ))}

                        {loading && (
                            <div className="chatbot__typing">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot__input">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything..."
                        />
                        <button onClick={sendMessage}>
                            ➤
                        </button>
                    </div>

                </div>
            )}
        </div>
    )
}

export default Chatbot