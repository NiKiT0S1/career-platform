import { useEffect, useState } from "react";
import { 
    getStudentProfile, 
    updateStudentCompany,
    updateStudentPracticeStatus,
    getStudentNotifications,
    markNotificationAsRead ,
    uploadStudentResume,
    downloadThreeSidedContract,
    changeStudentPassword,
    markAllNotificationsAsRead,
    previewStudentResume,
    getCurrentStudent
} from "../api/studentApi";

export default function StudentDashboard() {
    const [studentId, setStudentId] = useState(null);
    const [student, setStudent] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [practiceStatus, setPracticeStatus] = useState("");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [resumePreviewUrl, setResumePreviewUrl] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        loadCurrentStudent();
        // loadStudent();
        loadNotifications();
    }, []);

    const loadCurrentStudent = async () => {
        try {
            const currentStudent = await getCurrentStudent();
            setStudent(currentStudent);
            setStudentId(currentStudent.id);
            setCompanyName(currentStudent.companyName || "");
            setPracticeStatus(currentStudent.practiceStatus || "");

            await loadNotifications();
        } 
        catch (error) {
            console.error(error);
        }
    };
    
    // const loadStudent = async () => {
    //     try {
    //         const data = await getStudentProfile(2424);
    //         setStudent(data);
    //         setCompanyName(data.companyName || "");
    //         setPracticeStatus(data.practiceStatus || "");
    //     } 
    //     catch (error) {
    //         console.error(error);
    //     }
    // };

    const loadNotifications = async (id) => {
        try {
            const data = await getStudentNotifications(id);
            setNotifications(data);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleUpdateCompany = async () => {
        try {
            const updateStudent = await updateStudentCompany(studentId, companyName);
            setStudent(updateStudent);
            setMessage("Company updated successfully");
        } 
        catch (error) {
            console.error(error);
            setMessage("Failed to update company");
        }
    };

    const handleUpdatePracticeStatus = async () => {
        try {
            const updateStudent = await updateStudentPracticeStatus(studentId, practiceStatus);
            setStudent(updateStudent);
            setMessage("Practice status updated successfully");
        } 
        catch (error) {
            console.error(error);
            setMessage("Failed to update practice status");
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

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(studentId);
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
            const updateStudent = await uploadStudentResume(studentId, resumeFile);
            setStudent(updateStudent);
            setResumeMessage("Resume uploaded successfully");
        } 
        catch (error) {
            console.error(error);
            setResumeMessage("Failed to upload resume");
        }
    };

    const handlePreviewResume = async () => {
        try {
            const blob = await previewStudentResume(studentId);
            const url = window.URL.createObjectURL(blob);
            setResumePreviewUrl(url);
            setIsPreviewOpen(true);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);

        if (resumePreviewUrl) {
            window.URL.revokeObjectURL(resumePreviewUrl);
            setResumePreviewUrl("");
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

    const handleChangePassword = async () => {
        try {
            const response = await changeStudentPassword(studentId, currentPassword, newPassword);
            setPasswordMessage(response);
            setCurrentPassword("");
            setNewPassword("");
        } 
        catch (error) {
            console.error(error);
            setPasswordMessage(error?.response?.data || "Failed to change password");
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

            <h3>Update Practice Status</h3>
            <select
                value={practiceStatus}
                onChange={(e) => setPracticeStatus(e.target.value)}
            >
                <option value="">Select status</option>
                <option value="EMPLOYED">EMPLOYED</option>
                <option value="NOT FOUND">NOT FOUND</option>
            </select>
            <br /><br />

            <button onClick={handleUpdatePracticeStatus}>Save Practice Status</button>


            <h3>Resume Upload</h3>
            <p>Resume status: {student.resumePath ? "Uploaded" : "Not uploaded"}</p>

            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <br /><br />
            <button onClick={handleResumeUpload}>
                {student.resumePath ? "Replace Resume" : "Upload Resume"}
            </button>

            {resumeMessage && <p>{resumeMessage}</p>}

            {student.resumePath && (
                <>
                    <br /><br />
                    <button onClick={handlePreviewResume}>Preview Resume</button>
                </>
            )}

            {isPreviewOpen && resumePreviewUrl && (
                <div
                    style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.45)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "85%",
                            height: "85%",
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            padding: "16px",
                        }}
                        >
                        <button
                            onClick={handleClosePreview}
                            style={{
                                position: "absolute",
                                top: "-14px",
                                right: "-14px",
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor: "#ffffff",
                                color: "#222",
                                fontSize: "26px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                zIndex: 1001,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                lineHeight: "1",
                            }}
                        >
                            ×
                        </button>

                        <iframe
                            src={resumePreviewUrl}
                            width="100%"
                            height="100%"
                            title="Resume Preview"
                            style={{ 
                                border: "none", 
                            }}
                        />
                    </div>
                </div>
            )}


            <h3>Contract Template</h3>

            <button onClick={handleDownloadContract}>
                Download Three-Sided Contract
            </button>
            

            <h3>Notifications</h3>

            {notifications.length > 0 && (
                <>
                    <button onClick={handleMarkAllAsRead}>Mark All as Read</button>
                    <br /><br />
                </>
            )}

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


            <h3>Change Password</h3>

            <input 
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <br /><br />

            <button type="button" onClick={() => setShowCurrentPassword((prev) => !prev)}>
                {showCurrentPassword ? "Hide Current Password" : "Show Current Password"}
            </button>

            <br /><br />

            <input 
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <br /><br />

            <button type="button" onClick={() => setShowNewPassword((prev) => !prev)}>
                {showNewPassword ? "Hide New Password" : "Show New Password"}
            </button>

            <br /><br />

            <button onClick={handleChangePassword}>Change Password</button>

            {passwordMessage && <p>{passwordMessage}</p>}
        </div>
    );
}