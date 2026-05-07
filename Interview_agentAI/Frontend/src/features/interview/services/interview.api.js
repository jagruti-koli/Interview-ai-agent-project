import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

/**
 * ✅ Generate Interview Report
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();

    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);

    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    const response = await api.post("/api/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

/**
 * ✅ Get report by ID
 */
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

/**
 * ✅ Get all reports
 */
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};

/**
 * ✅ Generate Resume PDF
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        {
            responseType: "blob",
        }
    );

    return response.data;
};