/**
 * ================================
 * StudentDashboard
 * ================================
 * Main student page
 *
 * Responsibilities:
 * - Loads student profile data
 * - Handles CV upload, preview and replace
 * - Displays templates
 * - Manages notifications
 * - Handles password change and logout
 *
 * Notes:
 * - Uses polling for data refresh
 * - UI is split into separate components
 * ================================
 */

// 1. imports
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
import { useNavigate, useParams } from "react-router-dom";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import StudentLayout from "../layouts/StudentLayout";
import { isPdfFile, isDraggedPdf } from "../utils/fileValidation";
import { getDisplayFileName, getResumeFileName } from "../utils/fileUtils";
import { logoutRequest } from "../api/authApi";
import StudentAccountDropdown from "../components/student/StudentAccountDropdown";
import StudentTemplatesSection from "../components/student/StudentTemplatesSection";
import StudentPdfPreviewModal from "../components/student/StudentPdfPreviewModal";
import StudentProfileSection from "../components/student/StudentProfileSection";
import StudentCvSection from "../components/student/StudentCvSection";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function StudentDashboard() {
    // 2. state
    const [student, setStudent] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [practiceStatus, setPracticeStatus] = useState("");
    const [message, setMessage] = useState("");
    const [notifications, setNotifications] = useState([]);

    const {page} = useParams();
    const allowedStudentPages = ["main", "resume", "templates"];
    const activePage = allowedStudentPages.includes(page) ? page : "main";

    const {setRole} = useAuth();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    
    const hasUnreadNotifications = notifications.some((notification) => !notification.isRead);

    const [resumeFile, setResumeFile] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showAccountCurrentPassword, setShowAccountCurrentPassword] = useState(false);
    const [showAccountNewPassword, setShowAccountNewPassword] = useState(false);
    const [accountPasswordMessage, setAccountPasswordMessage] = useState("");

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

    const [isCompanyConfirmed, setIsCompanyConfirmed] = useState(false);
    const [companyConfirmError, setCompanyConfirmError] = useState("");

    const [studentLoadFailed, setStudentLoadFailed] = useState(false);

    const MAX_CV_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const hasPracticeStatusChanged = practiceStatus !== (student?.practiceStatus || "");

    // 3. refs
    const resumeFileInputRef = useRef(null);
    const previewContainerRef = useRef(null);
    const companyEditRef = useRef(null);
    const isEditingCompanyRef = useRef(false);
    const hasPracticeStatusChangedRef = useRef(false);

    // 4. effects
    useEffect(() => {
        loadCurrentStudent();
        loadTemplates();
        loadNotifications();
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
        isEditingCompanyRef.current = isEditingCompany;
    }, [isEditingCompany]);

    useEffect(() => {
        hasPracticeStatusChangedRef.current = hasPracticeStatusChanged;
    }, [hasPracticeStatusChanged]);

    useEffect(() => {
        if (document.visibilityState !== "visible") return;

        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;

            try {
                await loadCurrentStudent();
            } catch (error) {
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

    useEffect(() => {
        if (!message) return;

        const timeout = setTimeout(() => {
            setMessage("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [message]);

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

    // 5. handlers
    const loadCurrentStudent = async () => {
        try {
            const currentStudent = await getCurrentStudent();

            setStudent(currentStudent);
            
            if (!isEditingCompanyRef.current) {
                setCompanyName(currentStudent.companyName || "");
            }
            
            if (!hasPracticeStatusChangedRef.current) {
                setPracticeStatus(currentStudent.practiceStatus || "");
            }

            setStudentLoadFailed(false);
        } 
        catch (error) {
            console.error(error);
            setStudentLoadFailed(true);
        }
    };

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

        if (!isPdfFile(resumeFile)) {
            setResumeActionMessage("");
            setResumeActionError("Only PDF files are allowed");
            return false;
        }

        try {
            setIsUploadingResume(true);
            setResumeActionMessage("");
            setResumeActionError("");

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
            setResumeActionError(error?.response?.data || "Failed to upload CV");
            return false;
        }
        finally {
            setIsUploadingResume(false);
        }
    };

    const handlePreviewResume = async () => {
        try {
            const blob = await previewStudentResume();
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
    };

    const handleCvDragEnter = (e) => {
        if (student?.resumePath) return;

        e.preventDefault();
        e.stopPropagation();
    };

    const handleCvDragOver = (e) => {
        if (student?.resumePath) return;

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

        setIsDraggingCv(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.size > MAX_CV_FILE_SIZE) {
            setResumeActionMessage("");
            setResumeActionError("CV file size must be less than 10 MB");
            return;
        }

        if (!isPdfFile(file)) {
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

    const handleChangePassword = async () => {
        if (!currentPassword.trim() || !newPassword.trim()) {
            setAccountPasswordMessage("Both password fields are required");
            return;
        }
        
        if (currentPassword === newPassword) {
            setAccountPasswordMessage("New password must be different from current password");
            return;
        }
        
        try {
            const response = await changeStudentPassword(currentPassword, newPassword);
            
            setAccountPasswordMessage(response || "Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setShowAccountCurrentPassword(false);
            setShowAccountNewPassword(false);
        } 
        catch (error) {
            console.error(error);
            setAccountPasswordMessage(error?.response?.data || "Failed to change password");
        }
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

        if (!isPdfFile(file)) {
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

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.get("/health");

            await logoutRequest();

            logout();
            setRole(null);
            navigate("/login");
        }
        catch (error) {
            console.error(error);

            alert("Server is waking up. Please try logout again.");
        }
    };

    // 6. return (JSX)
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
            onChangePage={(nextPage) => navigate(`/student/${nextPage}`)}
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
                <StudentAccountDropdown
                    showPasswordForm={showPasswordForm}
                    setShowPasswordForm={setShowPasswordForm}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    showAccountCurrentPassword={showAccountCurrentPassword}
                    setShowAccountCurrentPassword={setShowAccountCurrentPassword}
                    showAccountNewPassword={showAccountNewPassword}
                    setShowAccountNewPassword={setShowAccountNewPassword}
                    handleChangePassword={handleChangePassword}
                    accountPasswordMessage={accountPasswordMessage}
                />
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
                <StudentProfileSection
                    student={student}
                    companyName={companyName}
                    setCompanyName={setCompanyName}
                    isEditingCompany={isEditingCompany}
                    setIsEditingCompany={setIsEditingCompany}
                    companyEditRef={companyEditRef}
                    isCompanyConfirmed={isCompanyConfirmed}
                    setIsCompanyConfirmed={setIsCompanyConfirmed}
                    companyConfirmError={companyConfirmError}
                    setCompanyConfirmError={setCompanyConfirmError}
                    handleUpdateCompany={handleUpdateCompany}
                    practiceStatus={practiceStatus}
                    setPracticeStatus={setPracticeStatus}
                    hasPracticeStatusChanged={hasPracticeStatusChanged}
                    handleUpdatePracticeStatus={handleUpdatePracticeStatus}
                    message={message}
                />
            )}

            {activePage === "resume" && (
                <StudentCvSection
                    student={student}
                    handleCvDragEnter={handleCvDragEnter}
                    handleCvDragOver={handleCvDragOver}
                    handleCvDragLeave={handleCvDragLeave}
                    handleCvDrop={handleCvDrop}
                    resumeActionError={resumeActionError}
                    resumeActionMessage={resumeActionMessage}
                    showCvUploadModal={showCvUploadModal}
                    setShowCvUploadModal={setShowCvUploadModal}
                    resetCvUploadModal={resetCvUploadModal}
                    isDraggingCv={isDraggingCv}
                    isCvHovered={isCvHovered}
                    setIsCvHovered={setIsCvHovered}
                    handlePreviewResume={handlePreviewResume}
                    getResumeFileName={getResumeFileName}
                    getDisplayFileName={getDisplayFileName}
                    resumeFile={resumeFile}
                    resumeFileInputRef={resumeFileInputRef}
                    handleResumeFileChange={handleResumeFileChange}
                    handleResumeUpload={handleResumeUpload}
                    isUploadingResume={isUploadingResume}
                />
            )}

            {activePage === "templates" && (
                <StudentTemplatesSection
                    templates={templates}
                    handleDownloadTemplate={handleDownloadTemplate}
                    getDisplayFileName={getDisplayFileName}
                />
            )}

            {isPreviewOpen && pdfFile && (
                <StudentPdfPreviewModal
                    pdfFile={pdfFile}
                    numPages={numPages}
                    setNumPages={setNumPages}
                    pageWidth={pageWidth}
                    previewContainerRef={previewContainerRef}
                    handleClosePreview={handleClosePreview}
                />
            )}
        </StudentLayout>
    );
}