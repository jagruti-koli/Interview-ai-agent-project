const axios = require("axios")

async function chatController(req, res) {
    try {
        const { message } = req.body

        if (!message) {
            return res.status(400).json({
                message: "Message is required"
            })
        }

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI interview assistant. Help users with resume, interview prep, and career guidance."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        )

        const reply = response.data.choices[0].message.content

        res.status(200).json({ reply })

    } catch (error) {
        console.log("CHAT ERROR:", error.response?.data || error.message)

        res.status(500).json({
            message: "Chat failed"
        })
    }
}

module.exports = { chatController }