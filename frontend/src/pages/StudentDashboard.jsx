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
import StudentLayout from "../layouts/StudentLayout";
import { isPdfFile, isDraggedPdf } from "../utils/fileValidation";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudentDashboard() {
    const [student, setStudent] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [practiceStatus, setPracticeStatus] = useState("");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);

    // const [activePage, setActivePage] = useState("main");
    const [activePage, setActivePage] = useState(() => {
        return localStorage.getItem("studentActivePage") || "main";
    });
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    
    const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

    const [resumeFile, setResumeFile] = useState(null);

    const resumeFileInputRef = useRef(null);

    // const [resumeMessage, setResumeMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const [showAccountCurrentPassword, setShowAccountCurrentPassword] = useState(false);
    const [showAccountNewPassword, setShowAccountNewPassword] = useState(false);
    const [accountPasswordMessage, setAccountPasswordMessage] = useState("");

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

    const [showCvUploadModal, setShowCvUploadModal] = useState(false);
    const [isCvHovered, setIsCvHovered] = useState(false);

    const [isEditingCompany, setIsEditingCompany] = useState(false);

    const [accountOpen, setAccountOpen] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [isDraggingCv, setIsDraggingCv] = useState(false);

    const dragCounterRef = useRef(0);

    const companyEditRef = useRef(null);

    const [isCompanyConfirmed, setIsCompanyConfirmed] = useState(false);
    const [companyConfirmError, setCompanyConfirmError] = useState("");

    const [studentLoadFailed, setStudentLoadFailed] = useState(false);

    const MAX_CV_FILE_SIZE = 10 * 1024 * 1024; // 10 MB


    const loadCurrentStudent = async () => {
        try {
            const currentStudent = await getCurrentStudent();
            setStudent(currentStudent);
            setCompanyName(currentStudent.companyName || "");
            setPracticeStatus(currentStudent.practiceStatus || "");
            setStudentLoadFailed(false);

            await loadNotifications();
        } 
        catch (error) {
            console.error(error);
            setStudentLoadFailed(true);
        }
    };

    useEffect(() => {
        loadCurrentStudent();
        loadTemplates();
    }, []);

    useEffect(() => {
        localStorage.setItem("studentActivePage", activePage);
    }, [activePage]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;

            try {
                await loadNotifications();
            }
            catch (error) {
                console.error(error);
            }
        }, 15000);

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
        }, 30000);

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
        if (!accountPasswordMessage) return;

        const timeout = setTimeout(() => {
            const isSuccess =
                accountPasswordMessage.toLowerCase().includes("success");

            setAccountPasswordMessage("");

            if (isSuccess) {
                setShowPasswordForm(false);
                setAccountOpen(false);
            }
        }, 1800);

        return () => clearTimeout(timeout);
    }, [accountPasswordMessage]);

    useEffect(() => {
        if (!resumeActionMessage && !resumeActionError) return;

        const timeout = setTimeout(() => {
            setResumeActionMessage("");
            setResumeActionError("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [resumeActionMessage, resumeActionError]);

    useEffect(() => {
        if (!isEditingCompany) return;

        const handleClickOutside = (event) => {
            if (companyEditRef.current && !companyEditRef.current.contains(event.target)) {
                setIsEditingCompany(false);
                setCompanyName(student?.companyName || "");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditingCompany, student?.companyName]);

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
        if (!isCompanyConfirmed) {
            setCompanyConfirmError("Please confirm company name");
            return false;
        }
        
        try {
            setCompanyConfirmError("");
            
            const updateStudent = await updateStudentCompany(companyName);
            setStudent(updateStudent);
            setMessage("Company updated successfully");
            setIsCompanyConfirmed(false);
            return true;
        } 
        catch (error) {
            console.error(error);
            setMessage("Failed to update company");
            return false;
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
            return false;
        }

        // if (resumeFile.type !== "application/pdf") {
        //     setResumeActionMessage("");
        //     setResumeActionError("Only PDF files are allowed");
        //     return false;
        // }

        if (!isAllowedResumeFile(resumeFile)) {
            setResumeActionMessage("");
            setResumeActionError("Only PDF files are allowed");
            return false;
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
            return true;
        } 
        catch (error) {
            console.error(error);
            // setResumeMessage("Failed to upload resume");
            setResumeActionError(error?.response?.data || "Failed to upload CV");
            return false;
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

    const handleCvDragEnter = (e) => {
        if (student?.resumePath) return;

        e.preventDefault();
        e.stopPropagation();

        // if (!isDraggedPdf(e)) return;

        // dragCounterRef.current += 1;

        // if (isDraggedPdf(e)) {
        //     setIsDraggingCv(true);
        // }
        // else {
        //     setIsDraggingCv(false);
        // }
    };

    const handleCvDragOver = (e) => {
        if (student?.resumePath) return;

        // if (!isDraggedPdf(e)) return;

        e.preventDefault();
        e.stopPropagation();

        if (isDraggedPdf(e)) {
            if (!isDraggingCv) {
                setIsDraggingCv(true);
            }
        } else {
            if (isDraggingCv) {
                setIsDraggingCv(false);
            }
        }
    };

    const handleCvDragLeave = (e) => {
        if (student?.resumePath) return;

        e.preventDefault();
        e.stopPropagation();

        // dragCounterRef.current -= 1;
        // if (dragCounterRef.current <= 0) {
        //     dragCounterRef.current = 0;
        //     setIsDraggingCv(false);
        // }

        const relatedTarget = e.relatedTarget;
        if (e.currentTarget.contains(relatedTarget)) {
            return;
        }

        setIsDraggingCv(false);
    };

    const handleCvDrop = async (e) => {
        if (student?.resumePath) return;

        e.preventDefault();
        e.stopPropagation();

        // dragCounterRef.current = 0;
        setIsDraggingCv(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.size > MAX_CV_FILE_SIZE) {
            setResumeActionMessage("");
            setResumeActionError("CV file size must be less than 10 MB");
            return;
        }

        if (!isAllowedResumeFile(file)) {
            setResumeActionMessage("");
            setResumeActionError("Only PDF files are allowed");
            return;
        }

        try {
            setShowCvUploadModal(false);
            setResumeActionMessage("");
            setResumeActionError("");
            setIsUploadingResume(true);

            await uploadStudentResume(file);

            setResumeActionMessage("CV uploaded successfully");
            setResumeFile(null);

            if (resumeFileInputRef.current) {
                resumeFileInputRef.current.value = "";
            }

            await loadCurrentStudent();
        } catch (error) {
            console.error(error);
            setResumeActionMessage("");
            setResumeActionError(error?.response?.data || "Failed to upload CV");
        } finally {
            setIsUploadingResume(false);
        }
    };

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

    const getResumeFileName = (resumePath) => {
        if (!resumePath) return "CV.pdf";
        return resumePath.split("/").pop();
    };

    const handleChangePassword = async () => {
        if (currentPassword === newPassword) {
            setAccountPasswordMessage("New password must be different from current password");
            return;
        }
        
        try {
            const response = await changeStudentPassword(currentPassword, newPassword);
            // setPasswordMessage(response);
            
            setAccountPasswordMessage(response || "Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setShowAccountCurrentPassword(false);
            setShowAccountNewPassword(false);
            // setShowPasswordForm(false);
        } 
        catch (error) {
            console.error(error);
            // setPasswordMessage(error?.response?.data || "Failed to change password");
            setAccountPasswordMessage(error?.response?.data || "Failed to change password");
        }
    };

    const getDisplayFileName = (fileName, maxLength = 24) => {
        if (!fileName) return "";

        const cleanedName = fileName.replace(/_\d+\.(pdf|docx)$/i, ".$1");

        if (cleanedName.length <= maxLength) {
            return cleanedName;
        }

        const dotIndex = cleanedName.lastIndexOf(".");
        const extension = dotIndex !== -1 ? cleanedName.slice(dotIndex) : "";
        const baseName = dotIndex !== -1 ? cleanedName.slice(0, dotIndex) : cleanedName;

        return `${baseName.slice(0, maxLength)}...${extension}`;
    };

    const isAllowedResumeFile = (file) => {
        return isPdfFile(file);
    };

    const handleResumeFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_CV_FILE_SIZE) {
            setResumeActionMessage("");
            setResumeActionError("CV file size must be less than 10 MB");
            setResumeFile(null);

            if (resumeFileInputRef.current) {
                resumeFileInputRef.current.value = "";
            }

            return;
        }

        if (!isAllowedResumeFile(file)) {
            setResumeActionMessage("");
            setResumeActionError("Only PDF files are allowed");
            setResumeFile(null);

            if (resumeFileInputRef.current) {
                resumeFileInputRef.current.value = "";
            }

            return;
        }

        setResumeActionMessage("");
        setResumeActionError("");
        setResumeFile(file);
    };

    const resetCvUploadModal = () => {
        setResumeFile(null);
        setResumeActionMessage("");
        setResumeActionError("");

        if (resumeFileInputRef.current) {
            resumeFileInputRef.current.value = "";
        }
    };

    const hasPracticeStatusChanged = practiceStatus !== (student?.practiceStatus || "");

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!student) {
        return (
            <div className="app-page-loader">
                <div className="app-page-loader__text">Loading...</div>
            </div>
        );
    }

    if (studentLoadFailed) {
        return (
            <div className="app-page-loader">
                <div className="app-page-loader__text">Session expired. Redirecting...</div>
            </div>
        );
    }

    return (
        <StudentLayout
            activePage={activePage}
            onChangePage={setActivePage}
            notifications={notifications}
            hasUnreadNotifications={hasUnreadNotifications}
            notificationsOpen={notificationsOpen}
            onToggleNotifications={() => {
                setNotificationsOpen((prev) => !prev);
                setAccountOpen(false);
            }}
            onCloseNotifications={() => setNotificationsOpen(false)}
            onClearNotifications={handleMarkAllAsRead}

            accountOpen={accountOpen}
            onToggleAccount={() => {
                setAccountOpen((prev) => !prev);
                setNotificationsOpen(false);
            }}
            onCloseAccount={() => {
                setAccountOpen(false);
                setShowPasswordForm(false);
            }}
            renderAccountDropdown={() => (
                <div className="student-account-menu">
                    {!showPasswordForm ? (
                        <button
                            type="button"
                            className="student-account-menu__item"
                            onClick={() => setShowPasswordForm(true)}
                        >
                            Change Password
                        </button>
                    ) : (
                        <div className="student-account-password-box">
                            <h4 className="student-account-password-box__title">
                                Change Password
                            </h4>

                            <div className="student-account-password-box__field">
                                <input
                                    type={showAccountCurrentPassword ? "text" : "password"}
                                    className="student-account-password-box__input"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="student-account-password-box__toggle"
                                    onClick={() => setShowAccountCurrentPassword((prev) => !prev)}
                                >
                                    {showAccountCurrentPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <div className="student-account-password-box__field">
                                <input
                                    type={showAccountNewPassword ? "text" : "password"}
                                    className="student-account-password-box__input"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="student-account-password-box__toggle"
                                    onClick={() => setShowAccountNewPassword((prev) => !prev)}
                                >
                                    {showAccountNewPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <button
                                type="button"
                                className="student-account-password-box__save"
                                onClick={handleChangePassword}
                            >
                                Save Password
                            </button>

                            {accountPasswordMessage && (
                                <p
                                    className={`student-account-password-box__message ${
                                        accountPasswordMessage.toLowerCase().includes("incorrect") ||
                                        accountPasswordMessage.toLowerCase().includes("failed") ||
                                        accountPasswordMessage.toLowerCase().includes("different")
                                            ? "error"
                                            : "success"
                                    }`}
                                >
                                    {accountPasswordMessage}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            onLogout={handleLogout}
            renderNotification={(notification) => (
                <div
                    key={notification.id}
                    className={`app-notification-item ${
                        !notification.isRead ? "app-notification-item--unread" : ""
                    }`}
                >
                    <p className="app-notification-item__message">{notification.message}</p>
                    <p className="app-notification-item__meta">
                        Status: {notification.isRead ? "Read" : "Unread"}
                    </p>

                    {!notification.isRead && (
                        <button
                            type="button"
                            className="app-notification-read-btn"
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            Mark as Read
                        </button>
                    )}
                </div>
            )}
        >
            {activePage === "main" && (
                <div className="student-profile-page">
                    <h1 className="student-profile-page__title">Profile</h1>

                    <div className="student-profile-hero">
                        <div className="student-profile-avatar student-profile-avatar--placeholder">
                            <span>👤</span>
                        </div>

                        <div className="student-profile-hero__info">
                            <h2 className="student-profile-name">{student.fullName}</h2>
                            <p className="student-profile-subtext">{student.email}</p>
                            <p className="student-profile-subtext">{student.groupName}</p>
                        </div>
                    </div>

                    <div className="student-profile-details">
                        <div className="student-profile-details__column">
                            <div className="student-detail-row">
                                <span className="student-detail-icon">🎓</span>
                                <span>Course: {student.course}</span>
                            </div>

                            <div className="student-detail-row">
                                <span className="student-detail-icon">📚</span>
                                <span>Educational Program: {student.educationalProgram}</span>
                            </div>

                            <div className="student-detail-row">
                                <span className="student-detail-icon">📊</span>
                                <span>GPA: {student.gpa}</span>
                            </div>

                            <div className="student-detail-row">
                                <span className="student-detail-icon">📞</span>
                                <span>Phone: {student.phone || "-"}</span>
                            </div>
                        </div>

                        <div className="student-profile-details__column">
                            <div className="student-detail-row student-detail-row--company">
                                <span className="student-detail-icon">💼</span>
                                <span>Company: {student.companyName || "-"}</span>

                                {!isEditingCompany && (
                                    // <button
                                    //     type="button"
                                    //     className="student-inline-icon-btn"
                                    //     onClick={() => setIsEditingCompany(true)}
                                    //     title="Edit company"
                                    // >
                                    //     ✎
                                    // </button>
                                    <button
                                        type="button"
                                        className="student-inline-icon-btn"
                                        onClick={() => {
                                            setIsEditingCompany(true);
                                            setIsCompanyConfirmed(false);
                                            setCompanyConfirmError("");
                                        }}
                                        title="Edit company"
                                    >
                                        ✎
                                    </button>
                                )}
                            </div>

                            {/* {isEditingCompany && (
                                <div className="student-company-edit" ref={companyEditRef}>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter company name"
                                    />
                                    
                                    <label className="student-company-confirm">
                                        <input
                                            type="checkbox"
                                            checked={isCompanyConfirmed}
                                            onChange={(e) => setIsCompanyConfirmed(e.target.checked)}
                                        />
                                        I confirm that the company name is correct
                                    </label>

                                    <button
                                        className="primary-btn"
                                        onClick={async () => {
                                            await handleUpdateCompany();
                                            setIsEditingCompany(false);
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            )} */}

                            {isEditingCompany && (
                                <div className="student-company-edit" ref={companyEditRef}>
                                    <div className="student-company-edit__row">
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Enter company name"
                                        />

                                        <label className="student-company-confirm">
                                            <input
                                                type="checkbox"
                                                checked={isCompanyConfirmed}
                                                onChange={(e) => {
                                                    setIsCompanyConfirmed(e.target.checked);
                                                    if (e.target.checked) {
                                                        setCompanyConfirmError("");
                                                    }
                                                }}
                                            />
                                            <span>I confirm that the company name is correct</span>
                                        </label>

                                        {/* <button
                                            className="primary-btn"
                                            onClick={async () => {
                                                const previousCompanyName = student?.companyName || "";

                                                await handleUpdateCompany();

                                                if (companyName !== previousCompanyName && isCompanyConfirmed) {
                                                    setIsEditingCompany(false);
                                                }
                                            }}
                                        >
                                            Save
                                        </button> */}

                                        <button
                                            className="primary-btn"
                                            onClick={async () => {
                                                const success = await handleUpdateCompany();

                                                if (success) {
                                                    setIsEditingCompany(false);
                                                }
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>

                                    {companyConfirmError && (
                                        <p className="student-company-confirm__error">
                                            {companyConfirmError}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="student-detail-row student-detail-row--status">
                                <span className="student-detail-icon">🧍</span>
                                <span>Status:</span>

                                <div className="student-status-inline">
                                    <select
                                        className="student-status-select"
                                        value={practiceStatus}
                                        onChange={(e) => setPracticeStatus(e.target.value)}
                                    >
                                        {/* <option value="">Not selected</option> */}
                                        <option value="EMPLOYED">EMPLOYED</option>
                                        <option value="NOT_FOUND">NOT FOUND</option>
                                    </select>

                                    {/* <button
                                        className="primary-btn student-status-save-inline"
                                        onClick={handleUpdatePracticeStatus}
                                    >
                                        Save
                                    </button> */}

                                    {hasPracticeStatusChanged && (
                                        <button
                                            className="primary-btn student-status-save-inline"
                                            onClick={handleUpdatePracticeStatus}
                                        >
                                            Save
                                        </button>
                                    )}
                                </div>
                            </div>
                            {message && <p className="student-action-message">{message}</p>}
                        </div>
                    </div>

                    {/* {message && <p className="student-inline-message">{message}</p>} */}
                </div>
            )}

            {activePage === "resume" && (
                <div className="student-cv-page">
                    <div
                        // className={`student-cv-page ${!student.resumePath && isDraggingCv ? "student-cv-page--dragging" : ""}`}
                        className="student-cv-dropzone"
                        onDragEnter={handleCvDragEnter}
                        onDragOver={handleCvDragOver}
                        onDragLeave={handleCvDragLeave}
                        onDrop={handleCvDrop}
                    >
                        <h1 className="student-page-title">CV</h1>

                        {resumeActionError && !showCvUploadModal && (
                            <p className="student-inline-message student-inline-message--error">
                                {resumeActionError}
                            </p>
                        )}

                        {resumeActionMessage && !showCvUploadModal && (
                            <p className="student-inline-message student-inline-message--success">
                                {resumeActionMessage}
                            </p>
                        )}

                        <div className="student-cv-grid">
                            {/* {resumeActionError && !showCvUploadModal && (
                                <p className="student-inline-message student-inline-message--error">
                                    {resumeActionError}
                                </p>
                            )}

                            {resumeActionMessage && !showCvUploadModal && (
                                <p className="student-inline-message student-inline-message--success">
                                    {resumeActionMessage}
                                </p>
                            )} */}

                            {student.resumePath && (
                                <div
                                    className="student-cv-card"
                                    onMouseEnter={() => setIsCvHovered(true)}
                                    onMouseLeave={() => setIsCvHovered(false)}
                                >
                                    <button
                                        type="button"
                                        className="student-cv-preview-button"
                                        onClick={handlePreviewResume}
                                    >
                                        <div className="student-cv-thumbnail">
                                            <span className="student-cv-thumbnail__icon">📄</span>
                                        </div>
                                        <div 
                                            className="student-cv-file-name"
                                            title={getResumeFileName(student.resumePath)}
                                        >
                                            {getDisplayFileName(getResumeFileName(student.resumePath), 22)}
                                        </div>
                                    </button>

                                    {isCvHovered && (
                                        <button
                                            type="button"
                                            className="student-cv-replace-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCvUploadModal(true);
                                            }}
                                        >
                                            Replace CV
                                        </button>
                                    )}
                                </div>
                            )}

                            {!student.resumePath && (
                                <button
                                    type="button"
                                    className="student-cv-upload-tile"
                                    onClick={() => {
                                        resetCvUploadModal();
                                        setShowCvUploadModal(true);
                                    }}
                                >
                                    <div className="student-cv-upload-tile__box">+</div>
                                    <div className="student-cv-upload-tile__text">Upload new CV</div>
                                </button>
                            )}
                        </div>

                        {showCvUploadModal && (
                            <div className="student-cv-modal-backdrop">
                                <div className="student-cv-modal">
                                    <div className="student-cv-modal__topbar" />

                                    <div className="student-cv-modal__content">
                                        <h3 className="student-cv-modal__title">Upload new CV</h3>

                                        <input
                                            ref={resumeFileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="student-cv-modal__file-input"
                                            // onChange={(e) => setResumeFile(e.target.files[0])}
                                            onChange={handleResumeFileChange}
                                        />

                                        {resumeFile && (
                                            <p className="student-cv-modal__selected-file">
                                                Selected file: {resumeFile.name}
                                            </p>
                                        )}

                                        <div className="student-cv-modal__actions">
                                            <button
                                                type="button"
                                                className="student-cv-modal__save"
                                                onClick={async () => {
                                                    const success = await handleResumeUpload();

                                                    if (success) {
                                                        resetCvUploadModal();
                                                        setShowCvUploadModal(false);
                                                    }
                                                }}
                                                disabled={isUploadingResume}
                                            >
                                                {isUploadingResume ? "Uploading..." : "Save CV"}
                                            </button>

                                            <button
                                                type="button"
                                                className="student-cv-modal__cancel"
                                                onClick={() => {
                                                    resetCvUploadModal();
                                                    setShowCvUploadModal(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {resumeActionMessage && (
                                            <p className="student-cv-modal__message success">
                                                {resumeActionMessage}
                                            </p>
                                        )}

                                        {resumeActionError && (
                                            <p className="student-cv-modal__message error">
                                                {resumeActionError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {!student.resumePath && isDraggingCv && (
                            <div className="student-cv-drag-overlay">
                                <div className="student-cv-drag-overlay__plus">+</div>
                                <div className="student-cv-drag-overlay__text">Drop your CV here</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activePage === "templates" && (
                <div className="student-templates-page">
                    <h1 className="student-page-title">Templates</h1>

                    <div className="student-templates-grid">
                        {templates.length === 0 ? (
                            <p>No templates available</p>
                        ) : (
                            templates.map((template) => (
                                <button
                                    key={template.id}
                                    type="button"
                                    className="student-template-card"
                                    onClick={() => handleDownloadTemplate(template.id, template.fileName)}
                                >
                                    <div className="student-template-card__preview">📄</div>
                                    <div 
                                        className="student-template-card__name"
                                        title={template.displayName}
                                    >
                                        {getDisplayFileName(template.displayName, 20)}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

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

                        <div
                            ref={previewContainerRef}
                            style={{
                                flex: 1,
                                overflow: "auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flex-start",
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
        </StudentLayout>
    );
}