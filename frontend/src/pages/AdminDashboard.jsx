/**
 * ================================
 * AdminDashboard
 * ================================
 * Main admin page
 *
 * Responsibilities:
 * - Loads and manages students data
 * - Handles filtering, sorting and pagination
 * - Manages inline editing of student fields
 * - Handles notifications (selected and filtered)
 * - Manages templates (upload, replace, delete)
 * - Coordinates UI components
 *
 * Notes:
 * - Contains business logic and API calls
 * - UI is delegated to child components
 * ================================
 */

// 1. imports
import { useEffect, useState, useRef, useMemo } from "react";
import { formatDateTime } from "../utils/formatDateTime";
import {
    getStudentsPage,
    getEducationalPrograms,
    getGroups,
    filterStudents,
    sendNotification,
    sendNotificationByFilter,
    downloadStudentResume,
    getStudentNotificationsForAdmin,
    getCurrentAdmin,
    getTemplatesAdmin,
    uploadTemplate,
    downloadTemplateForAdmin,
    deleteTemplate,
    changeAdminPassword,
    updateTemplateDisplayName,
    replaceTemplateFile,
    updateTemplateCategory,
    updateStudentField,
    getCourses,
    getStudentPractice,
    updateStudentPractice,
    getPracticeSettings,
    updatePracticeSettings,
    exportStudentsToExcel,
    getAllStudentIds,
    getSelectedStudentsByIds,
} from "../api/adminApi";
import { logout } from "../auth/auth";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { isAllowedTemplateFile, isDraggedTemplateFile } from "../utils/fileValidation";
import { logoutRequest } from "../api/authApi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AdminAccountDropdown from "../components/admin/AdminAccountDropdown";
import AdminNotificationViewerModal from "../components/admin/AdminNotificationViewerModal";
import AdminStudentsPagination from "../components/admin/AdminStudentPagination";
import AdminFiltersPanel from "../components/admin/AdminFiltersPanel";
import AdminTemplatesSection from "../components/admin/AdminTemplatesSection";
import AdminStudentsTable from "../components/admin/AdminStudentsTable";
import { formatPracticeStatus } from "../utils/formatPracticeStatus";
import { getPracticeStatusRowStyle } from "../utils/getPracticeStatusRowStyle";
import { getDisplayFileName } from "../utils/fileUtils";
import AdminPracticeModal from "../components/admin/AdminPracticeModal";
import { formatCompanyType } from "../utils/formatCompanyType";
import { formatDocumentType } from "../utils/formatDocumentType";
import AdminSelectedStudentsModal from "../components/admin/AdminSelectedStudentsModal";

export default function AdminDashboard() {
    // 2. state
    const [admin, setAdmin] = useState(null);
    const [students, setStudents] = useState([]);

    const [totalStudentsCount, setTotalStudentsCount] = useState(0);

    const [clickedStudentId, setClickedStudentId] = useState(null);
    
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [message, setMessage] = useState("");

    const [statusMessage, setStatusMessage] = useState("");

    const [educationalPrograms, setEducationalPrograms] = useState([]);
    const [groups, setGroups] = useState([]);

    const [filters, setFilters] = useState({
        fullName: "",
        educationalProgram: "",
        groupName: "",
        course: "",
        practiceStatus: "",
        minGpa: "",
    });

    const [sortBy, setSortBy] = useState("");
    const [sortDir, setSortDir] = useState("asc");

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const studentsPerPage = 20;
    const pagesPerBlock = 15;

    const [notificationViewerOpen, setNotificationViewerOpen] = useState(false);
    const [currentStudentNotifications, setCurrentStudentNotifications] = useState([]);
    
    const [currentStudentNotificationId, setCurrentStudentNotificationId] = useState(null);

    const [currentStudentName, setCurrentStudentName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    // const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    // const [showNewPassword, setShowNewPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [templateName, setTemplateName] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("");

    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState("");

    const [templateActionMessage, setTemplateActionMessage] = useState("");
    const [templateActionError, setTemplateActionError] = useState("");

    const {setRole} = useAuth();

    const {page} = useParams();
    const allowedAdminPages = ["students", "templates"];
    const activePage = allowedAdminPages.includes(page) ? page : "students";

    const [accountOpen, setAccountOpen] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [accountPasswordMessage, setAccountPasswordMessage] = useState("");

    const [showTemplateUploadModal, setShowTemplateUploadModal] = useState(false);
    const [hoveredTemplateId, setHoveredTemplateId] = useState(null);
    const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);

    const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

    const [isTemplateDraggedUpload, setIsTemplateDraggedUpload] = useState(false);

    const [adminLoadFailed, setAdminLoadFailed] = useState(false);

    const MAX_TEMPLATE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const [courses, setCourses] = useState([]);
    const [editingGroups, setEditingGroups] = useState([]);
    
    const [editingCell, setEditingCell] = useState({ studentId: null, field: null });
    const [editingValue, setEditingValue] = useState("");

    // const selectEditableFields = ["groupName", "course", "educationalProgram", "practiceStatus"];
    const selectEditableFields = ["groupName", "course", "educationalProgram"];

    const currentBlock = Math.floor(currentPage / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock;
    const endPage = Math.min(startPage + pagesPerBlock, totalPages);

    const hasSelectedStudent = selectedStudentIds.length > 0;

    const selectedStudentIdsSet = useMemo(
        () => new Set(selectedStudentIds),
        [selectedStudentIds]
    );

    const hasActiveFilters = 
        !!filters.fullName ||
        !!filters.educationalProgram ||
        !!filters.groupName ||
        !!filters.course ||
        !!filters.practiceStatus ||
        !!filters.minGpa;

    const [practiceModalOpen, setPracticeModalOpen] = useState(false);
    const [practiceStudent, setPracticeStudent] = useState(null);
    const [practiceData, setPracticeData] = useState(null);
    const [practiceStatusMessage, setPracticeStatusMessage] = useState("");

    const [practiceSettings, setPracticeSettings] = useState(null);
    const [showPracticeSettingsForm, setShowPracticeSettingsForm] = useState(false);
    const [regularPracticeStartDate, setRegularPracticeStartDate] = useState("");
    const [regularPracticeEndDate, setRegularPracticeEndDate] = useState("");
    const [practiceSettingsMessage, setPracticeSettingsMessage] = useState("");

    const [isExportingStudents, setIsExportingStudents] = useState(false);

    const [selectedStudentsModalOpen, setSelectedStudentsModalOpen] = useState(false);
    const [selectedStudentsPreview, setSelectedStudentsPreview] = useState([]);

    // 3. refs
    const templateFileInputRef = useRef(null);
    const replaceFileInputRef = useRef({});
    const renameBoxRef = useRef(null);
    const editingCellRef = useRef(null);

    // 4. effects
    useEffect(() => {
        loadCurrentAdmin();
        loadCourses();
        loadStudentsPage(0);
        loadEducationalPrograms();
        loadGroups();
        loadTemplatesAdmin();
        loadPracticeSettings();
    }, []);

    useEffect(() => {
        if (!notificationViewerOpen || !currentStudentNotificationId) return;

        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;

            try {
                const data = await getStudentNotificationsForAdmin(currentStudentNotificationId);
                setCurrentStudentNotifications(data);
            }
            catch (error) {
                console.error(error);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [notificationViewerOpen, currentStudentNotificationId]);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;
            
            try {
                await loadTemplatesAdmin();
            }
            catch (error) {
                console.error(error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // useEffect(() => {
    //     const timeout = setTimeout(async () => {
    //         const preparedFilters = {
    //             fullName: filters.fullName || undefined,
    //             educationalProgram: filters.educationalProgram || undefined,
    //             groupName: filters.groupName || undefined,
    //             course: filters.course ? Number(filters.course) : undefined,
    //             practiceStatus: filters.practiceStatus || undefined,
    //             minGpa: filters.minGpa ? Number(filters.minGpa) : undefined,
    //         };

    //         const hasAnyFilters = 
    //             !!filters.fullName ||
    //             !!filters.educationalProgram ||
    //             !!filters.groupName ||
    //             !!filters.course ||
    //             !!filters.practiceStatus ||
    //             !!filters.minGpa;

    //         try {
    //             if (hasAnyFilters) {
    //                 const data = await filterStudents(preparedFilters, currentPage, studentsPerPage, sortBy, sortDir);
                    
    //                 setStudents(data.content);
    //                 setTotalPages(data.totalPages);
    //                 setTotalStudentsCount(data.totalElements);
    //             }
    //             else {
    //                 const data = await getStudentsPage(currentPage, studentsPerPage, sortBy, sortDir);
                    
    //                 setStudents(data.content);
    //                 setTotalPages(data.totalPages);
    //                 setTotalStudentsCount(data.totalElements);
    //             }
    //         }
    //         catch (error) {
    //             console.error(error);
    //         }
    //     }, filters.fullName ? 500 : 0);

    //     return () => clearTimeout(timeout);
    // }, [filters, currentPage, studentsPerPage, sortBy, sortDir]);

    useEffect(() => {
        let isCancelled = false;

        const timeout = setTimeout(async () => {
            const preparedFilters = {
                fullName: filters.fullName || undefined,
                educationalProgram: filters.educationalProgram || undefined,
                groupName: filters.groupName || undefined,
                course: filters.course ? Number(filters.course) : undefined,
                practiceStatus: filters.practiceStatus || undefined,
                minGpa: filters.minGpa ? Number(filters.minGpa) : undefined,
            };

            const hasAnyFilters =
                !!filters.fullName ||
                !!filters.educationalProgram ||
                !!filters.groupName ||
                !!filters.course ||
                !!filters.practiceStatus ||
                !!filters.minGpa;

            try {
                const data = hasAnyFilters
                    ? await filterStudents(preparedFilters, currentPage, studentsPerPage, sortBy, sortDir)
                    : await getStudentsPage(currentPage, studentsPerPage, sortBy, sortDir);

                if (isCancelled) return;

                setStudents(data.content);
                setTotalPages(data.totalPages);
                setTotalStudentsCount(data.totalElements);
            }
            catch (error) {
                if (!isCancelled) {
                    console.error(error);
                }
            }
        // }, filters.fullName ? 500 : 0);
        }, 350);

        return () => {
            isCancelled = true;
            clearTimeout(timeout);
        };
    }, [filters, currentPage, studentsPerPage, sortBy, sortDir]);

    useEffect(() => {
        if (!statusMessage) return;

        const timeout = setTimeout(() => {
            setStatusMessage("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [statusMessage]);

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
        if (!templateActionMessage && !templateActionError) return;

        const timeout = setTimeout(() => {
            setTemplateActionMessage("");
            setTemplateActionError("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [templateActionMessage, templateActionError]);

    useEffect(() => {
        if (!editingTemplateId) return;

        const handleClickOutside = (event) => {
            if (renameBoxRef.current && !renameBoxRef.current.contains(event.target)) {
                setEditingTemplateId(null);
                setNewDisplayName("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editingTemplateId]);

    useEffect(() => {
        const handleDocumentClick = () => {
            setClickedStudentId(null);
        };

        document.addEventListener("click", handleDocumentClick);

        return () => {
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    useEffect(() => {
        if (!editingCell.studentId || !editingCell.field) return;

        if (selectEditableFields.includes(editingCell.field)) {
            return;
        }

        const handleClickOutsideEditor = (event) => {
            if (
                editingCellRef.current &&
                !editingCellRef.current.contains(event.target)
            ) {
                cancelEditingCell();
            }
        };

        document.addEventListener("mousedown", handleClickOutsideEditor);

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideEditor);
        };
    }, [editingCell]);

    useEffect(() => {
        if (hasActiveFilters) return;
        if (editingCell.studentId) return;
        if (activePage !== "students") return;
        
        const interval = setInterval(async () => {
            if (document.visibilityState !== "visible") return;
            
            try {
                await refreshStudentsForPolling();
            }
            catch (error) {
                console.error(error);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [hasActiveFilters, editingCell.studentId, activePage, currentPage, studentsPerPage, sortBy, sortDir]);

    // 5. handlers
    const refreshStudentsForPolling = async () => {
        const preparedFilters = {
            fullName: filters.fullName || undefined,
            educationalProgram: filters.educationalProgram || undefined,
            groupName: filters.groupName || undefined,
            course: filters.course ? Number(filters.course) : undefined,
            practiceStatus: filters.practiceStatus || undefined,
            minGpa: filters.minGpa ? Number(filters.minGpa) : undefined,
        };

        const hasAnyFilters = 
            !!filters.fullName ||
            !!filters.educationalProgram ||
            !!filters.groupName ||
            !!filters.course ||
            !!filters.practiceStatus ||
            !!filters.minGpa;

        try {
            if (hasAnyFilters) {
                const data = await filterStudents(preparedFilters, currentPage, studentsPerPage, sortBy, sortDir);
                    
                setStudents(data.content);
                setTotalPages(data.totalPages);
                setTotalStudentsCount(data.totalElements);
            }
            else {
                const data = await getStudentsPage(currentPage, studentsPerPage, sortBy, sortDir);
                    
                setStudents(data.content);
                setTotalPages(data.totalPages);
                setTotalStudentsCount(data.totalElements);
            }
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadCurrentAdmin = async () => {
        try {
            const data = await getCurrentAdmin();
            setAdmin(data);
            setAdminLoadFailed(false);
        } 
        catch (error) {
            console.error(error);
            setAdminLoadFailed(true);
        }
    };

    const loadCourses = async () => {
        try {
            const data = await getCourses();
            setCourses(data);
        }
        catch (error) {
            console.error(error);
        }
    };
    
    const loadStudentsPage = async (page = 0) => {
        try {
            const data = await getStudentsPage(page, studentsPerPage, sortBy, sortDir);
            setStudents(data.content);
            setCurrentPage(data.number);
            setTotalPages(data.totalPages);
            setTotalStudentsCount(data.totalElements);
        } 
        catch (error) {
            console.error(error);
        }
    };

    const loadEducationalPrograms = async () => {
        try {
            const data = await getEducationalPrograms();
            setEducationalPrograms(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadGroups = async (educationalProgram = "") => {
        try {
            const data = await getGroups(educationalProgram);
            setGroups(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadTemplatesAdmin = async () => {
        try {
            const data = await getTemplatesAdmin();
            setTemplates(data);
        }
        catch (error) {
            console.error(error);
        }
    };

    const loadPracticeSettings = async () => {
        try {
            const data = await getPracticeSettings();

            setPracticeSettings(data);
            setRegularPracticeStartDate(data.regularPracticeStartDate || "");
            setRegularPracticeEndDate(data.regularPracticeEndDate || "");
        }
        catch (error) {
            console.error(error);
        }
    };

    const startEditingCell = async (studentId, field, currentValue, studentRow) => {
        if (editingCell.studentId === studentId && editingCell.field === field) {
            return;
        }
        
        setEditingCell({ studentId, field });
        setEditingValue(currentValue ?? "");

        if (field === "groupName") {
            try {
                const program = studentRow?.educationalProgram || "";
                const data = await getGroups(program);
                setEditingGroups(data);
            }
            catch (error) {
                console.error(error);
                setEditingGroups([]);
            }
        }
    };

    const cancelEditingCell = () => {
        setEditingCell({ studentId: null, field: null });
        setEditingValue("");
        setEditingGroups([]);
    };

    const handleResetFilters = async () => {
        setFilters({
            fullName: "",
            educationalProgram: "",
            groupName: "",
            course: "",
            practiceStatus: "",
            minGpa: "",
        });
        setCurrentPage(0);
        setSelectedStudentIds([]);
        setMessage("");

        await loadGroups();
        await loadStudentsPage(0);
    };

    // const handleSort = (field) => {
    //     if (sortBy !== field) {
    //         setSortBy(field);
    //         setSortDir("asc");
    //     }
    //     else if (sortDir === "asc") {
    //         setSortDir("desc");
    //     }
    //     else {
    //         setSortBy("");
    //         setSortDir("asc");
    //     }

    //     setCurrentPage(0);
    // };

    const handleSort = (field) => {
        setCurrentPage(0);

        if (sortBy !== field) {
            setSortBy(field);
            setSortDir("asc");
            return;
        }

        if (sortDir === "asc") {
            setSortDir("desc");
            return;
        }

        setSortBy("");
        setSortDir("asc");
    };

    const handlePageChange = async (page) => {
        if (page < 0 || page >= totalPages) return;
        setCurrentPage(page);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudentIds((prev) => 
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleEducationalProgramChange = async (value) => {
        setFilters((prev) => ({
            ...prev,
            educationalProgram: value,
            groupName: "",
        }));

        setCurrentPage(0);
        await loadGroups(value);
    };

    const handleSendNotification = async () => {
        if (selectedStudentIds.length === 0) {
            setStatusMessage("Please select at least one student");
            return;
        }

        if (!message.trim()) {
            setStatusMessage("Message cannot be empty");
            return;
        }

        try {
            const response = await sendNotification(selectedStudentIds, message);
            setStatusMessage(response);
            setMessage("");
        } 
        catch (error) {
            console.error(error);
            setStatusMessage(
                error?.response?.data || "Failed to send notification"
            );
        }
    };

    const handleSendNotificationToFiltered = async () => {
        if (!message.trim()) {
            setStatusMessage("Message cannot be empty");
            return;
        }

        try {
            const response = await sendNotificationByFilter(filters, message);
            setStatusMessage(response);
            setMessage("");
        } 
        catch (error) {
            console.error(error);
            setStatusMessage(error?.response?.data || "Failed to send notification");
        }
    };

    const handleNotificationAction = async () => {
        if (!message.trim()) {
            setStatusMessage("Message cannot be empty");
            return;
        }

        if (hasSelectedStudent) {
            await handleSendNotification();
        }
        else {
            await handleSendNotificationToFiltered();
        }
    };

    const handleDownloadResume = async (studentId) => {
        try {
            const blob = await downloadStudentResume(studentId);
            const url = window.URL.createObjectURL(blob);

            const student = students.find((s) => s.id === studentId);
            const safeName = student.fullName.replace(/\s+/g, "_");

            const link = document.createElement("a");
            link.href = url;
            link.download = `student-${safeName}-CV.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } 
        catch (error) {
            console.error(error);
            setStatusMessage("CV not found or failed to download");
        }
    };

    const handleViewNotifications = async (student) => {
        try {
            const data = await getStudentNotificationsForAdmin(student.id);
            setCurrentStudentNotifications(data);
            setCurrentStudentName(student.fullName);
            setCurrentStudentNotificationId(student.id);
            setNotificationViewerOpen(true);
        } 
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to load student notifications");
        }
    };

    const handleCloseNotificationViewer = () => {
        setNotificationViewerOpen(false);
        setCurrentStudentNotificationId(null);
        setCurrentStudentNotifications([]);
        setCurrentStudentName("");
    };

    const handleUploadTemplate = async () => {
        setTemplateActionMessage("");
        setTemplateActionError("");
        
        if (!templateName.trim()) {
            setTemplateActionError("Please enter template name");
            return false;
        }

        if (!templateFile) {
            setTemplateActionError("Please select a template file");
            return false;
        }

        if (templateFile.size > MAX_TEMPLATE_FILE_SIZE) {
            setTemplateActionError("Template file size must be less than 10 MB");
            return false;
        }

        if (!newTemplateCategory) {
            setTemplateActionError("Please select a template category");
            return false;
        }

        if (!isAllowedTemplateFile(templateFile)) {
            setTemplateActionError("Only PDF and DOCX files are allowed");
            return false;
        }
        
        const formData = new FormData();
        formData.append("file", templateFile);
        formData.append("displayName", templateName);
        formData.append("category", newTemplateCategory);

        try {
            setIsUploadingTemplate(true);

            await uploadTemplate(formData);

            setTemplateActionMessage("Template uploaded successfully");

            setTemplateFile(null);
            setTemplateName("");
            setNewTemplateCategory("");

            if (templateFileInputRef.current) {
                templateFileInputRef.current.value = "";
            }

            await loadTemplatesAdmin();
            return true;
        }
        catch (error) {
            console.error(error);
            setTemplateActionError(error?.response?.data || "Failed to upload template");
            return false;
        }
        finally {
            setIsUploadingTemplate(false);
        }
    };

    const handleDownloadTemplateForAdmin = async (templateId, fileName) => {
        try {
            const blob = await downloadTemplateForAdmin(templateId);
    
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
            setTemplateActionError("Failed to download template");
        }
    };

    const handleChangeTemplateName = async (templateId) => {
        if (!newDisplayName.trim()) {
            setTemplateActionMessage("");
            setTemplateActionError("Display name cannot be empty");
            return;
        }
        
        try {
            setTemplateActionMessage("");
            setTemplateActionError("");

            await updateTemplateDisplayName(templateId, newDisplayName);

            setEditingTemplateId(null);
            setNewDisplayName("");
            setTemplateActionMessage("Display name changed successfully");

            await loadTemplatesAdmin();
        }
        catch (error) {
            console.error(error);
            setTemplateActionError(
                error?.response?.data || "Failed to change display name"
            );
        }
    };

    const handleChangeTemplateCategory = async (templateId, category) => {
        try {
            setTemplateActionMessage("");
            setTemplateActionError("");
            
            await updateTemplateCategory(templateId, category);
            setTemplateActionMessage("Template category updated successfully");
            await loadTemplatesAdmin();
        }
        catch (error) {
            console.error(error);
            setTemplateActionError("Failed to update template category");
        }
    };

    const handleReplaceTemplateFile = async (templateId, file) => {
        if (!file) {
            setTemplateActionMessage("");
            setTemplateActionError("Please select a file");
            return;
        }

        if (file.size > MAX_TEMPLATE_FILE_SIZE) {
            setTemplateActionMessage("");
            setTemplateActionError("Template file size must be less than 10 MB");
            return;
        }

        if (!isAllowedTemplateFile(file)) {
            setTemplateActionMessage("");
            setTemplateActionError("Only PDF and DOCX files are allowed");
            return;
        }

        try {
            setTemplateActionMessage("");
            setTemplateActionError("");
            
            await replaceTemplateFile(templateId, file);

            setTemplateActionMessage("Template file updated successfully");
            
            if (replaceFileInputRef.current[templateId]) {
                replaceFileInputRef.current[templateId].value = "";
            }
            
            await loadTemplatesAdmin();
        }
        catch (error) {
            console.error(error);
            setTemplateActionError(
                error?.response?.data || "Failed to update template file"
            );
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            await deleteTemplate(templateId);
            await loadTemplatesAdmin();
        }
        catch (error) {
            console.error(error);
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return "↕";
        return sortDir === "asc" ? "▲" : "▼";
    };

    const resetPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setAccountPasswordMessage("");
        setShowAdminPassword(false);
    };

    const resetPracticeSettingsForm = () => {
        setRegularPracticeStartDate(practiceSettings?.regularPracticeStartDate || "");
        setRegularPracticeEndDate(practiceSettings?.regularPracticeEndDate || "");
        setPracticeSettingsMessage("");
    };

    const closeAccountDropdown = () => {
        setAccountOpen(false);
        setShowPasswordForm(false);
        setShowPracticeSettingsForm(false);
        resetPasswordForm();
        resetPracticeSettingsForm();
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
            const response = await changeAdminPassword(currentPassword, newPassword);
            
            setAccountPasswordMessage(response || "Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            // setShowCurrentPassword(false);
            // setShowNewPassword(false);
            setShowAdminPassword(false);
        } 
        catch (error) {
            console.error(error);
            setAccountPasswordMessage(error?.response?.data || "Failed to change password");
        }
    };

    const handleTemplateDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleTemplateDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isDraggedTemplateFile(e)) {
            if (!isDraggingTemplate) {
                setIsDraggingTemplate(true);
            }
        }
        else {
            if (isDraggingTemplate) {
                setIsDraggingTemplate(false);
            }
        }
    };

    const handleTemplateDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const relatedTarget = e.relatedTarget;
        if (e.currentTarget.contains(relatedTarget)) {
            return;
        }

        setIsDraggingTemplate(false);
    };

    const handleTemplateDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDraggingTemplate(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        if (file.size > MAX_TEMPLATE_FILE_SIZE) {
            setTemplateActionMessage("");
            setTemplateActionError("Template file size must be less than 10 MB");
            return;
        }

        if (!isAllowedTemplateFile(file)) {
            setTemplateActionMessage("");
            setTemplateActionError("Only PDF and DOCX files are allowed");
            return;
        }

        setTemplateActionMessage("");
        setTemplateActionError("");
        setTemplateFile(file);
        setIsTemplateDraggedUpload(true);
        setShowTemplateUploadModal(true);
    };

    const handleSaveEditedCell = async (studentId, field, valueToSave) => {
        if (!studentId || !field) return;

        try {
            const updatedStudent = await updateStudentField(studentId, field, valueToSave);

            setStudents((prev) =>
                prev.map((student) =>
                    student.id === studentId ? updatedStudent : student
                )
            );

            setStatusMessage("Student data updated successfully");
            cancelEditingCell();
        } catch (error) {
            console.error(error);
            setStatusMessage(error?.response?.data || "Failed to update student data");
        }
    };

    const resetTemplateUploadModal = () => {
        setTemplateFile(null);
        setTemplateName("");
        setNewTemplateCategory("");
        setTemplateActionMessage("");
        setTemplateActionError("");
        setIsTemplateDraggedUpload(false);

        if (templateFileInputRef.current) {
            templateFileInputRef.current.value = "";
        }
    };

    const handleOpenPracticeModal = async (student) => {
        try {
            const practice = await getStudentPractice(student.id);

            const preparedPractice = {
                ...practice,
                companyName: practice?.companyName || "",
                practiceStatus: practice?.practiceStatus || "",
                companyType: practice?.companyType || "",
                practiceMode: practice?.practiceMode || "",
                documentType: practice?.documentType || "",
                letterSent: practice?.letterSent ?? null,
                contractNumber: practice?.contractNumber || "",
                contractDate: practice?.contractDate || "",
                practiceStartDate: practice?.practiceStartDate || "",
                practiceEndDate: practice?.practiceEndDate || "",
            };

            setPracticeStudent(student);
            // setPracticeData(practice);
            setPracticeData(preparedPractice);
            setPracticeModalOpen(true);
        }
        catch (error) {
            console.error(error);
        }
    };

    const handleClosePracticeModal = () => {
        setPracticeModalOpen(false);
        setPracticeStudent(null);
        setPracticeData(null);
    };

    const handleSavePractice = async (payload) => {
        try {
            await updateStudentPractice(practiceStudent.id, payload);
            setPracticeStatusMessage("Practice data updated successfully");

            await refreshStudentsForPolling();

            handleClosePracticeModal();
        }
        catch (error) {
            console.error(error);
            setPracticeStatusMessage("Failed to update practice data");
        }
    };

    const handleSavePracticeSettings = async () => {
        if (!regularPracticeStartDate || !regularPracticeEndDate) {
            setPracticeSettingsMessage("Both dates are required");

            setTimeout(() => {
                setPracticeSettingsMessage("");
            }, 2500);

            return;
        }

        if (
            regularPracticeStartDate === (practiceSettings?.regularPracticeStartDate || "") &&
            regularPracticeEndDate === (practiceSettings?.regularPracticeEndDate || "")
        ) {
            setPracticeSettingsMessage("No changes to save");

            setTimeout(() => {
                setPracticeSettingsMessage("");
            }, 2500);

            return;
        }

        if (regularPracticeStartDate > regularPracticeEndDate) {
            setPracticeSettingsMessage("Start date cannot be after end date");

            setTimeout(() => {
                setPracticeSettingsMessage("");
            }, 2500);

            return;
        }

        try {
            const data = await updatePracticeSettings({
                regularPracticeStartDate,
                regularPracticeEndDate,
            });

            setPracticeSettings(data);
            setPracticeSettingsMessage("Regular practice dates updated successfully");

            setTimeout(() => {
                setPracticeSettingsMessage("");
                setShowPracticeSettingsForm(false);
                setAccountOpen(false);
            }, 1500);
        }
        catch (error) {
            console.error(error);
            setPracticeSettingsMessage("Failed to update practice dates");

            setTimeout(() => {
                setPracticeSettingsMessage("");
            }, 2500);
        }
    };

    const handleExportStudents = async () => {
        if (isExportingStudents) return;
        
        try {
            setIsExportingStudents(true);
            setStatusMessage("Downloading Excel...");

            const blob = await exportStudentsToExcel(filters, sortBy, sortDir, selectedStudentIds);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            // link.download = "students_export.xlsx";
            link.download = selectedStudentIds.length > 0
                ? "selected_students_export.xlsx"
                : "students_export.xlsx";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setStatusMessage("Excel downloaded successfully");
        }
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to export students");
        }
        finally {
            setIsExportingStudents(false);
        }
    };

    const isAllStudentsSelected = 
        totalStudentsCount > 0 &&
        selectedStudentIds.length === totalStudentsCount;

    const handleToggleSelectAllStudents = async () => {
        try {
            if (isAllStudentsSelected) {
                setSelectedStudentIds([]);
                setSelectedStudentsPreview([]);
                return;
            }

            const ids = await getAllStudentIds();
            setSelectedStudentIds(ids);
        }
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to select all students");
        }
    };

    const handleOpenSelectedStudentsModal = async () => {
        if (selectedStudentIds.length === 0) {
            setStatusMessage("No students selected");
            return;
        }

        try {
            const data = await getSelectedStudentsByIds(selectedStudentIds);

            const orderMap = new Map(
                selectedStudentIds.map((id, index) => [id, index])
            );

            const orderedData = [...data].sort(
                (a, b) => orderMap.get(a.id) - orderMap.get(b.id)
            );

            setSelectedStudentsPreview(orderedData);
            setSelectedStudentsModalOpen(true);
        }
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to load selected students");
        }
    };

    const handleRemoveSelectedStudent = async (studentId) => {
        setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
        setSelectedStudentsPreview((prev) => prev.filter((student) => student.id !== studentId));
    };

    const handleEditPracticeForSelected = () => {
        setStatusMessage("Bulk Edit Practice will be implemented soon!");
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
    if (!admin) {
        return (
            <div className="app-page-loader">
                <div className="app-page-loader__text">Loading...</div>
            </div>
        );
    }

    if (adminLoadFailed) {
        return (
            <div className="app-page-loader">
                <div className="app-page-loader__text">Session expired. Redirecting...</div>
            </div>
        );
    }

    return (
        <AdminLayout
            activePage={activePage}
            onChangePage={(nextPage) => navigate(`/admin/${nextPage}`)}
            onLogout={handleLogout}

            adminName={admin?.fullName}

            notifications={[]}
            hasUnreadNotifications={false}
            notificationsOpen={false}
            onToggleNotifications={() => {}}
            onCloseNotifications={() => {}}
            onClearNotifications={() => {}}

            accountOpen={accountOpen}
            // onToggleAccount={() => {
            //     setAccountOpen((prev) => !prev);
            //     setShowPasswordForm(false);
            //     setAccountPasswordMessage("");
            // }}
            onToggleAccount={() => {
                if (accountOpen) {
                    setAccountOpen(false);
                    setShowPasswordForm(false);
                    setShowPracticeSettingsForm(false);

                    setCurrentPassword("");
                    setNewPassword("");
                    setShowAdminPassword(false);
                    setAccountPasswordMessage("");

                    setRegularPracticeStartDate(practiceSettings?.regularPracticeStartDate || "");
                    setRegularPracticeEndDate(practiceSettings?.regularPracticeEndDate || "");
                    setPracticeSettingsMessage("");
                } else {
                    setAccountOpen(true);
                }
            }}


            // onCloseAccount={() => {
            //     setAccountOpen(false);
            //     setShowPasswordForm(false);
            //     setAccountPasswordMessage("");
            // }}
            onCloseAccount={() => {
                setAccountOpen(false);
                setShowPasswordForm(false);
                setShowPracticeSettingsForm(false);

                setCurrentPassword("");
                setNewPassword("");
                setShowAdminPassword(false);
                setAccountPasswordMessage("");

                setRegularPracticeStartDate(practiceSettings?.regularPracticeStartDate || "");
                setRegularPracticeEndDate(practiceSettings?.regularPracticeEndDate || "");
                setPracticeSettingsMessage("");
            }}

            renderAccountDropdown={() => (
                <AdminAccountDropdown
                    showPasswordForm={showPasswordForm}
                    setShowPasswordForm={setShowPasswordForm}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    // showCurrentPassword={showCurrentPassword}
                    // setShowCurrentPassword={setShowCurrentPassword}
                    // showNewPassword={showNewPassword}
                    // setShowNewPassword={setShowNewPassword}
                    showAdminPassword={showAdminPassword}
                    setShowAdminPassword={setShowAdminPassword}
                    handleChangePassword={handleChangePassword}
                    accountPasswordMessage={accountPasswordMessage}

                    showPracticeSettingsForm={showPracticeSettingsForm}
                    setShowPracticeSettingsForm={setShowPracticeSettingsForm}
                    regularPracticeStartDate={regularPracticeStartDate}
                    setRegularPracticeStartDate={setRegularPracticeStartDate}
                    regularPracticeEndDate={regularPracticeEndDate}
                    setRegularPracticeEndDate={setRegularPracticeEndDate}
                    handleSavePracticeSettings={handleSavePracticeSettings}
                    practiceSettingsMessage={practiceSettingsMessage}

                    handleLogout={handleLogout}
                />
            )}
        >
            {activePage === "students" && (
                <div className="admin-main-page">
                    <AdminFiltersPanel
                        filters={filters}
                        setFilters={setFilters}
                        setCurrentPage={setCurrentPage}
                        educationalPrograms={educationalPrograms}
                        groups={groups}
                        courses={courses}
                        handleEducationalProgramChange={handleEducationalProgramChange}
                        handleResetFilters={handleResetFilters}
                        message={message}
                        setMessage={setMessage}
                        handleNotificationAction={handleNotificationAction}
                        statusMessage={statusMessage}
                        handleExportStudents={handleExportStudents}
                        isExportingStudents={isExportingStudents}
                    />

                    <div className="admin-table-panel">
                        {/* <span className="admin-selected-meta">
                            <span>Selected Students: {selectedStudentIds.length}</span>

                            {selectedStudentIds.length > 0 && (
                                <button
                                    type="button"
                                    className="admin-view-selected-btn"
                                    onClick={handleOpenSelectedStudentsModal}
                                >
                                    📋
                                </button>
                            )}

                            <span>Total Students: {totalStudentsCount}</span>
                        </span> */}

                        <div className="admin-table-meta">
                            <div className="admin-table-meta-left">
                                <span className="admin-selected-meta">
                                    Selected Students: {selectedStudentIds.length}

                                    {selectedStudentIds.length > 0 && (
                                        <button
                                            type="button"
                                            className="admin-selected-icon-btn"
                                            onClick={handleOpenSelectedStudentsModal}
                                            title="View selected students"
                                        >
                                            ☰
                                        </button>
                                    )}
                                </span>
                            </div>

                            <div className="admin-table-meta-right">
                                <span>Total Students: {totalStudentsCount}</span>
                            </div>
                        </div>

                        <AdminStudentsTable
                            students={students}
                            clickedStudentId={clickedStudentId}
                            setClickedStudentId={setClickedStudentId}
                            selectedStudentIds={selectedStudentIds}
                            handleSelectStudent={handleSelectStudent}
                            handleSort={handleSort}
                            getSortIcon={getSortIcon}
                            startEditingCell={startEditingCell}
                            editingCell={editingCell}
                            editingValue={editingValue}
                            setEditingValue={setEditingValue}
                            editingCellRef={editingCellRef}
                            handleSaveEditedCell={handleSaveEditedCell}
                            cancelEditingCell={cancelEditingCell}
                            editingGroups={editingGroups}
                            courses={courses}
                            educationalPrograms={educationalPrograms}
                            formatPracticeStatus={formatPracticeStatus}
                            getRowStyle={getPracticeStatusRowStyle}
                            handleDownloadResume={handleDownloadResume}
                            handleViewNotifications={handleViewNotifications}
                            handleOpenPracticeModal={handleOpenPracticeModal}
                            isAllStudentsSelected={isAllStudentsSelected}
                            handleToggleSelectAllStudents={handleToggleSelectAllStudents}

                            selectedStudentIdsSet={selectedStudentIdsSet}
                        />

                        <AdminStudentsPagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            startPage={startPage}
                            endPage={endPage}
                            pagesPerBlock={pagesPerBlock}
                            handlePageChange={handlePageChange}
                        />

                        <AdminPracticeModal
                            isOpen={practiceModalOpen}
                            student={practiceStudent}
                            practice={practiceData}
                            onClose={handleClosePracticeModal}
                            onSave={handleSavePractice}
                            formatCompanyType={formatCompanyType}
                            formatDocumentType={formatDocumentType}
                            practiceSettings={practiceSettings}
                        />
                    </div>
                </div>
            )}

            {activePage === "templates" && (
                <AdminTemplatesSection
                    templates={templates}
                    isDraggingTemplate={isDraggingTemplate}
                    handleTemplateDragEnter={handleTemplateDragEnter}
                    handleTemplateDragOver={handleTemplateDragOver}
                    handleTemplateDragLeave={handleTemplateDragLeave}
                    handleTemplateDrop={handleTemplateDrop}
                    showTemplateUploadModal={showTemplateUploadModal}
                    setShowTemplateUploadModal={setShowTemplateUploadModal}
                    resetTemplateUploadModal={resetTemplateUploadModal}
                    templateActionMessage={templateActionMessage}
                    templateActionError={templateActionError}
                    setTemplateActionMessage={setTemplateActionMessage}
                    setTemplateActionError={setTemplateActionError}
                    hoveredTemplateId={hoveredTemplateId}
                    setHoveredTemplateId={setHoveredTemplateId}
                    handleDownloadTemplateForAdmin={handleDownloadTemplateForAdmin}
                    getDisplayFileName={getDisplayFileName}
                    handleChangeTemplateCategory={handleChangeTemplateCategory}
                    replaceFileInputRef={replaceFileInputRef}
                    handleReplaceTemplateFile={handleReplaceTemplateFile}
                    setEditingTemplateId={setEditingTemplateId}
                    setNewDisplayName={setNewDisplayName}
                    handleDeleteTemplate={handleDeleteTemplate}
                    editingTemplateId={editingTemplateId}
                    newDisplayName={newDisplayName}
                    handleChangeTemplateName={handleChangeTemplateName}
                    renameBoxRef={renameBoxRef}
                    templateName={templateName}
                    setTemplateName={setTemplateName}
                    newTemplateCategory={newTemplateCategory}
                    setNewTemplateCategory={setNewTemplateCategory}
                    templateFile={templateFile}
                    setTemplateFile={setTemplateFile}
                    templateFileInputRef={templateFileInputRef}
                    isTemplateDraggedUpload={isTemplateDraggedUpload}
                    handleUploadTemplate={handleUploadTemplate}
                    isUploadingTemplate={isUploadingTemplate}
                    MAX_TEMPLATE_FILE_SIZE={MAX_TEMPLATE_FILE_SIZE}
                    isAllowedTemplateFile={isAllowedTemplateFile}
                />
            )}

            <AdminNotificationViewerModal
                notificationViewerOpen={notificationViewerOpen}
                currentStudentName={currentStudentName}
                currentStudentNotifications={currentStudentNotifications}
                handleCloseNotificationViewer={handleCloseNotificationViewer}
            />

            {selectedStudentsModalOpen && (
                <AdminSelectedStudentsModal
                    selectedStudents={selectedStudentsPreview}
                    onClose={() => setSelectedStudentsModalOpen(false)}
                    onRemoveStudent={handleRemoveSelectedStudent}
                    onDownloadResume={handleDownloadResume}
                    onEditPracticeSelected={handleEditPracticeForSelected}
                    formatPracticeStatus={formatPracticeStatus}
                />
            )}
        </AdminLayout>
    );
}