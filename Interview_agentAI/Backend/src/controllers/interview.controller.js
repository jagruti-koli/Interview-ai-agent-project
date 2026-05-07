const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterviewReportController(req, res) {
    try {

        // 🔥 SAFE FILE CHECK
        if (!req.file) {
            return res.status(400).json({
                message: "Resume file is required"
            })
        }

        // ✅ FIXED pdf parsing
        const data = await pdfParse(req.file.buffer)
        const resumeText = data.text

        const { selfDescription, jobDescription } = req.body

        if (!selfDescription && !jobDescription) {
            return res.status(400).json({
                message: "Self description or job description required"
            })
        }

        // 🔥 AI CALL
        const aiResult = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        if (!aiResult) {
            return res.status(500).json({
                message: "AI failed to generate report"
            })
        }

        // 🔥 DB SAVE
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...aiResult
        })

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })

    } catch (error) {
        console.log("INTERVIEW CONTROLLER ERROR:", error)

        return res.status(500).json({
            message: "Server error in interview generation",
            error: error.message
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }