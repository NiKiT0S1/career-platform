import { useEffect, useState, useRef } from "react";
import { 
    getCurrentStudent, 
    updateStudentCompany,
    updateStudentPracticeStatus,
    getStudentNotifications,
    markNotificationAsRead ,
    uploadStudentResume,
    getTemplates,
    downloadTemplate,
    changeStudentPassword,
    markAllNotificationsAsRead,
    previewStudentResume,
} from "../api/studentApi";
import { logout } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [practiceStatus, setPracticeStatus] = useState("");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);

    const resumeFileInputRef = useRef(null);

    // const [resumeMessage, setResumeMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    // const [resumePreviewUrl, setResumePreviewUrl] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const previewContainerRef = useRef(null);
    const [pageWidth, setPageWidth] = useState(700);

    const [pdfFile, setPdfFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const [templates, setTemplates] = useState([]);

    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [resumeActionMessage, setResumeActionMessage] = useState("");
    const [resumeActionError, setResumeActionError] = useState("");


    const loadCurrentStudent = async () => {
        try {
            const currentStudent = await getCurrentStudent();
            setStudent(currentStudent);
            setCompanyName(currentStudent.companyName || "");
            setPracticeStatus(currentStudent.practiceStatus || "");

            await loadNotifications();
        } 
        catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadCurrentStudent();
        loadTemplates();
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;

            try {
                await loadNotifications();
            }
            catch (error) {
                console.error(error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;

            try {
                await loadTemplates();
            }
            catch (error) {
                console.error(error);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            if (pdfFile) {
                URL.revokeObjectURL(pdfFile);
            }
        };
    }, [pdfFile]);

    useEffect(() => {
        const updatePageWidth = () => {
            if (previewContainerRef.current) {
                const containerWidth = previewContainerRef.current.clientWidth;
                setPageWidth(Math.min(containerWidth - 40, 900));
            }
        };

        updatePageWidth();

        window.addEventListener("resize", updatePageWidth);

        return () => window.removeEventListener("resize", updatePageWidth);
    }, [isPreviewOpen]);

    // useEffect(() => {
    //     loadTemplates();
    // });

    useEffect(() => {
        if (!message) return;

        const timeout = setTimeout(() => {
            setMessage("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [message]);

    useEffect(() => {
        if (!passwordMessage) return;

        const timeout = setTimeout(() => {
            setPasswordMessage("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [passwordMessage]);

    useEffect(() => {
        if (!resumeActionMessage && !resumeActionError) return;

        const timeout = setTimeout(() => {
            setResumeActionMessage("");
            setResumeActionError("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [resumeActionMessage, resumeActionError]);

    const loadTemplates = async () => {
        try {
            const data = await getTemplates();
            setTemplates(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadNotifications = async () => {
        try {
            const data = await getStudentNotifications();
            setNotifications(data);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleUpdateCompany = async () => {
        try {
            const updateStudent = await updateStudentCompany(companyName);
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
            const updateStudent = await updateStudentPracticeStatus(practiceStatus);
            setStudent(updateStudent);
            setMessage("Practice status updated successfully");
        } 
        catch (error) {
            console.error(error);
            setMessage("Failed to update practice status");
        }
    };

    const getPracticeStatusColor = (status) => {
        if (status === "EMPLOYED") return "green";
        if (status === "NOT_FOUND") return "red";
        return "gray";
    };

    const formatPracticeStatus = (status) => {
        if (status === "NOT_FOUND") return "NOT FOUND";
        if (status === "EMPLOYED") return "EMPLOYED";
        return status;
    }

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
            await markAllNotificationsAsRead();
            loadNotifications();
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleResumeUpload = async () => {
        if (!resumeFile) {
            setResumeActionMessage("");
            setResumeActionError("Please select a PDF file first");
            return;
        }

        if (resumeFile.type !== "application/pdf") {
            setResumeActionMessage("");
            setResumeActionError("Only PDF files are allowed");
            return;
        }

        try {
            setIsUploadingResume(true);
            setResumeActionMessage("");
            setResumeActionError("");
            
            // const updateStudent = await uploadStudentResume(resumeFile);
            // setStudent(updateStudent);
            // setResumeMessage("Resume uploaded successfully");

            await uploadStudentResume(resumeFile);
            setResumeActionMessage("CV uploaded successfully");
            setResumeFile(null);

            if (resumeFileInputRef.current) {
                resumeFileInputRef.current.value = "";
            }

            await loadCurrentStudent();
        } 
        catch (error) {
            console.error(error);
            // setResumeMessage("Failed to upload resume");
            setResumeActionError("Failed to upload CV");
        }
        finally {
            setIsUploadingResume(false);
        }
    };

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        console.error("PDF load error:", error);
    };
    
    const handlePreviewResume = async () => {
        try {
            const blob = await previewStudentResume();
            // const url = window.URL.createObjectURL(blob);
            // setResumePreviewUrl(url);
            setPdfFile(blob);
            setIsPreviewOpen(true);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const handleClosePreview = () => {
        setPdfFile(null);
        setNumPages(null);
        setIsPreviewOpen(false);

        // if (resumePreviewUrl) {
        //     window.URL.revokeObjectURL(resumePreviewUrl);
        //     setResumePreviewUrl("");
        // }
    };

    // const handleDownloadResumeTemplate = async () => {
    //     try {
    //         const blob = await downloadResumeTemplate();
    //         const url = window.URL.createObjectURL(blob);

    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.download = "resume-template.docx";
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();

    //         window.URL.revokeObjectURL(url);
    //     }
    //     catch (error) {
    //         console.error(error);
    //     }
    // };
    
    // const handleDownloadContract = async () => {
    //     try {
    //         const blob = await downloadThreeSidedContract();
    //         const url = window.URL.createObjectURL(blob);

    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.download = "three-sided-contract.docx";
    //         document.body.appendChild(link);
    //         link.click();
    //         link.remove();

    //         window.URL.revokeObjectURL(url);
    //     } 
    //     catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleDownloadTemplate = async (templateId, fileName) => {
        try {
            const blob = await downloadTemplate(templateId);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = fileName;

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
            const response = await changeStudentPassword(currentPassword, newPassword);
            setPasswordMessage(response);
            setCurrentPassword("");
            setNewPassword("");
        } 
        catch (error) {
            console.error(error);
            setPasswordMessage(error?.response?.data || "Failed to change password");
        }
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!student) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{position: "relative", padding: "40px"}}>
            <button 
            onClick={handleLogout}
            style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "red",
            }}
            >
                Logout
            </button>

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
            <p>
                Status: {" "} 
                <span style={{color: getPracticeStatusColor(student.practiceStatus)}}>
                    {formatPracticeStatus(student.practiceStatus)}
                </span>
            </p>


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
                <option value="NOT_FOUND">NOT FOUND</option>
            </select>
            <br /><br />

            <button onClick={handleUpdatePracticeStatus}>Save Practice Status</button>


            <h3>CV Upload</h3>
            <p>CV status: {student.resumePath ? "Uploaded" : "Not uploaded"}</p>

            <input
                ref={resumeFileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <br /><br />
            {/* <button onClick={handleResumeUpload}>
                {student.resumePath ? "Replace Resume" : "Upload Resume"}
            </button> */}
            <button onClick={handleResumeUpload} disabled={isUploadingResume}>
                {isUploadingResume
                    ? "Uploading..."
                    : student.resumePath 
                        ? "Replace CV" 
                        : "Upload CV"}
            </button>

            {resumeActionMessage && (
                <p style={{color: "green", fontWeight: "500"}}>
                    {resumeActionMessage}
                </p>
            )}

            {resumeActionError && (
                <p style={{color: "red", fontWeight: "500"}}>
                    {resumeActionError}
                </p>
            )}

            {student.resumePath && (
                <>
                    <br /><br />
                    <button onClick={handlePreviewResume}>Preview CV</button>
                </>
            )}

            {/* <br /><br />

            <button onClick={handleDownloadResumeTemplate}>
                Download Resume Template
            </button> */}

            {isPreviewOpen && pdfFile && (
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

                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
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

                        {/* <iframe
                            src={resumePreviewUrl}
                            width="100%"
                            height="100%"
                            title="Resume Preview"
                            style={{ 
                                border: "none", 
                            }}
                        /> */}
                        <div
                            ref={previewContainerRef}
                            style={{
                                flex: 1,
                                overflow: "auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flext-start",
                                paddingTop: "12px",
                            }}
                        >
                            <Document
                                file={pdfFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={onDocumentLoadError}
                                loading="Loading PDF..."
                                error="Failed to load PDF file."
                            >
                                {Array.from(new Array(numPages || 0), (_, index) => (
                                    <Page 
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        width={pageWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                ))}
                            </Document>
                        </div>
                    </div>
                </div>
            )}


            <h3>Templates</h3>

            {/* <button onClick={handleDownloadContract}>
                Download Three-Sided Contract
            </button> */}

            {templates.length === 0 ? (
                <p>No templates available</p>
            ) : (
                templates.map((template) => (
                    <div key={template.id} style={{marginBottom: "10px"}}>
                        <span>{template.displayName}</span>
                        <button
                            style={{marginLeft: "10px"}}
                            onClick={() => handleDownloadTemplate(template.id, template.fileName)}
                        >
                            Download
                        </button>
                    </div>
                ))
            )}
            

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