import { useEffect, useState } from "react";
import { 
    getStudentProfile, 
    updateStudentCompany,
    getStudentNotifications,
    markNotificationAsRead ,
    uploadStudentResume,
    downloadThreeSidedContract
} from "../api/studentApi";

export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");

    useEffect(() => {
        loadStudent();
        loadNotifications();
    }, []);

    const loadStudent = async () => {
        try {
            const data = await getStudentProfile(2424);
            setStudent(data);
            setCompanyName(data.companyName || "");
        } 
        catch (error) {
            console.error(error);
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await getStudentNotifications(2424);
            setNotifications(data);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleUpdateCompany = async () => {
        try {
            const updateStudent = await updateStudentCompany(2424, companyName);
            setStudent(updateStudent);
            setMessage("Company updated successfully");
        } 
        catch (error) {
            console.error(error);
            setMessage("Failed to update company");
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            loadNotifications();
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setResumeMessage("Please select a PDF file first");
            return;
        }

        try {
            const updateStudent = await uploadStudentResume(2424, resumeFile);
            setStudent(updateStudent);
            setResumeMessage("Resume uploaded successfully");
        } 
        catch (error) {
            console.error(error);
            setResumeMessage("Failed to upload resume");
        }
    };

    const handleDownloadContract = async () => {
        try {
            const blob = await downloadThreeSidedContract();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "three-sided-contract.docx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } 
        catch (error) {
            console.error(error);
        }
    };

    if (!student) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{padding: "40px"}}>
            <h1>Student Dashboard</h1>

            <h3>Profile</h3>

            <p>Full Name: {student.fullName}</p>
            <p>Group: {student.groupName}</p>
            <p>Course: {student.course}</p>
            <p>Educational Program: {student.educationalProgram}</p>
            <p>Email: {student.email}</p>
            <p>Phone: {student.phone}</p>


            <h3>Practice</h3>

            <p>GPA: {student.gpa}</p>
            <p>Company: {student.companyName}</p>
            <p>Status: {student.practiceStatus}</p>


            <h3>Update Company</h3>
            <input
                type="text"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
            />
            <br /><br />
            <button onClick={handleUpdateCompany}>Save Company</button>
            {message && <p>{message}</p>}


            <h3>Resume Upload</h3>

            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <br /><br />
            <button onClick={handleResumeUpload}>Upload Resume</button>

            {resumeMessage && <p>{resumeMessage}</p>}


            <h3>Contract Template</h3>

            <button onClick={handleDownloadContract}>
                Download Three-Sided Contract
            </button>
            

            <h3>Notifications</h3>

            {notifications.length === 0 ? (
                <p>No notifications</p>
            ) : (
                notifications.map((notification) => (
                    <div key={notification.id} style={{marginBottom: "20px"}}>
                        <p>{notification.message}</p>
                        <p>Status: {notification.isRead ? "Read" : "Unread"}</p>

                        {!notification.isRead && (
                            <button onClick={() => handleMarkAsRead(notification.id)}>
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}