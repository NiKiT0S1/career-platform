import { useEffect, useState, useRef } from "react";
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
} from "../api/adminApi";
import { logout } from "../auth/auth";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import { isAllowedTemplateFile, isDraggedTemplateFile } from "../utils/fileValidation";

import { logoutRequest } from "../api/authApi";

import api from "../api/axios";

import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
    const [admin, setAdmin] = useState(null);
    const [students, setStudents] = useState([]);

    const [totalStudentsCount, setTotalStudentsCount] = useState(0);

    const [clickedStudentId, setClickedStudentId] = useState(null);
    
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [message, setMessage] = useState("");

    // const clearNotificationMessage = (reason) => {
    //     console.trace("clearNotificationMessage: ", reason);
    //     setMessage("");
    // };

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
    const [isFilterMode, setIsFilterMode] = useState(false);

    const studentsPerPage = 20;
    const pagesPerBlock = 15;

    const [notificationViewerOpen, setNotificationViewerOpen] = useState(false);
    const [currentStudentNotifications, setCurrentStudentNotifications] = useState([]);
    
    const [currentStudentNotificationId, setCurrentStudentNotificationId] = useState(null);

    const [currentStudentName, setCurrentStudentName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    // const [passwordMessage, setPasswordMessage] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [templateFile, setTemplateFile] = useState(null);
    const [templateName, setTemplateName] = useState("");
    // const [templateCategory, setTemplateCategory] = useState("");
    const [newTemplateCategory, setNewTemplateCategory] = useState("");

    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState("");
    // const [replaceFile, setReplaceFile] = useState(null);

    const templateFileInputRef = useRef(null);
    const replaceFileInputRef = useRef({});

    const [templateActionMessage, setTemplateActionMessage] = useState("");
    const [templateActionError, setTemplateActionError] = useState("");
    const [replacingTemplateId, setReplacingTemplateId] = useState(null);

    // const [activePage, setActivePage] = useState("students");
    // const [activePage, setActivePage] = useState(() => {
    //     return localStorage.getItem("adminActivePage") || "students";
    // });

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
    const dragTemplateCounterRef = useRef(0);

    const renameBoxRef = useRef(null);

    const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);

    const [isTemplateDraggedUpload, setIsTemplateDraggedUpload] = useState(false);

    const [adminLoadFailed, setAdminLoadFailed] = useState(false);

    const MAX_TEMPLATE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    const [courses, setCourses] = useState([]);
    const [editingGroups, setEditingGroups] = useState([]);
    
    const [editingCell, setEditingCell] = useState({ studentId: null, field: null });
    const [editingValue, setEditingValue] = useState("");
    const editingCellRef = useRef(null);

    const selectEditableFields = ["groupName", "course", "educationalProgram", "practiceStatus"];


    useEffect(() => {
        loadCurrentAdmin();
        loadCourses();
        loadStudentsPage(0);
        loadEducationalPrograms();
        loadGroups();
        loadTemplatesAdmin();
    }, []);

    // useEffect(() => {
    //     localStorage.setItem("adminActivePage", activePage);
    // }, [activePage]);

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

    useEffect (() => {
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
                if (hasAnyFilters) {
                    const data = await filterStudents(preparedFilters, currentPage, studentsPerPage, sortBy, sortDir);
                    
                    setStudents(data.content);
                    setTotalPages(data.totalPages);
                    setTotalStudentsCount(data.totalElements);
                    setIsFilterMode(true);
                }
                else {
                    const data = await getStudentsPage(currentPage, studentsPerPage, sortBy, sortDir);
                    
                    setStudents(data.content);
                    setTotalPages(data.totalPages);
                    setTotalStudentsCount(data.totalElements);
                    setIsFilterMode(false);
                }
            }
            catch (error) {
                console.error(error);
            }
        }, filters.fullName ? 500 : 0);

        return () => clearTimeout(timeout);
    }, [filters, currentPage, studentsPerPage, sortBy, sortDir]);

    // useEffect(() => {
    //     if (!message) return;

    //     const timeout = setTimeout(() => {
    //         // setMessage("");
    //         clearNotificationMessage("useEffect success");
    //     }, 1500);

    //     return () => clearTimeout(timeout);
    // }, [message]);

    useEffect(() => {
        if (!statusMessage) return;

        const timeout = setTimeout(() => {
            setStatusMessage("");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [statusMessage]);

    // useEffect(() => {
    //     if (!passwordMessage) return;

    //     const timeout = setTimeout(() => {
    //         setPasswordMessage("");
    //     }, 1500);

    //     return () => clearTimeout(timeout);
    // }, [passwordMessage]);

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
                setIsFilterMode(true);
            }
            else {
                const data = await getStudentsPage(currentPage, studentsPerPage, sortBy, sortDir);
                    
                setStudents(data.content);
                setTotalPages(data.totalPages);
                setTotalStudentsCount(data.totalElements);
                setIsFilterMode(false);
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
            setIsFilterMode(false);
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

    // const startEditingCell = (studentId, field, currentValue) => {
    //     setEditingCell({ studentId, field });
    //     setEditingValue(currentValue ?? "");
    // };

    // const cancelEditingCell = () => {
    //     setEditingCell({ studentId: null, field: null });
    //     setEditingValue("");
    // };

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
        // clearNotificationMessage("handleResetFilters success");
        setIsFilterMode(false);

        await loadGroups();
        await loadStudentsPage(0);
    };

    const handleSort = (field) => {
        if (sortBy !== field) {
            setSortBy(field);
            setSortDir("asc");
        }
        else if (sortDir === "asc") {
            setSortDir("desc");
        }
        else {
            setSortBy("");
            setSortDir("asc");
        }

        setCurrentPage(0);
    };

    const handlePageChange = async (page) => {
        // if (page < 0 || page >= totalPages) return;

        // if (isFilterMode) {
        //     await handleFilter(page);
        // }
        // else {
        //     await loadStudentsPage(page);
        // }
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
            // console.log("Selected students: ", selectedStudentIds);
            // console.log("Message:", message);

            const response = await sendNotification(selectedStudentIds, message);
            setStatusMessage(response);
            setMessage("");
            // clearNotificationMessage("handleSendNotification success");
        } 
        catch (error) {
            console.error(error);
            setStatusMessage(
                error?.response?.data ||"Failed to send notification"
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
            // clearNotificationMessage("handleSendNotificationToFiltered success");
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

        // const allowedExtensions = [".pdf", ".docx"];
        // const lowerName = templateFile.name.toLowerCase();
        // const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

        // if (!isAllowed) {
        //     setTemplateActionError("Only PDF and DOCX files are allowed");
        //     return false;
        // }
        
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
            setReplacingTemplateId(templateId);
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
        finally {
            setReplacingTemplateId(null);
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
    }

    const currentBlock = Math.floor(currentPage / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock;
    const endPage = Math.min(startPage + pagesPerBlock, totalPages);

    const hasSelectedStudent = selectedStudentIds.length > 0;

    const hasActiveFilters = 
        !!filters.fullName ||
        !!filters.educationalProgram ||
        !!filters.groupName ||
        !!filters.course ||
        !!filters.practiceStatus ||
        !!filters.minGpa;

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

    const getNotificationsButtonText = () => {
        if (!hasActiveFilters && !hasSelectedStudent) {
            return "Send Notification For All Students";
        }

        if (!hasActiveFilters && hasSelectedStudent) {
            return "Send Notification For Current Students";
        }

        if (hasActiveFilters && !hasSelectedStudent) {
            return "Send Notification For All Students By Filter";
        }

        return "Send Notification For Current Students By Filter";
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return "↕";
        return sortDir === "asc" ? "▲" : "▼";
    };

    const formatPracticeStatus = (status) => {
        if (status === "NOT_FOUND") return "NOT FOUND";
        if (status === "EMPLOYED") return "EMPLOYED";
        return status;
    }

    const getRowStyle = (status) => {
        if (status === "EMPLOYED") {
            return {backgroundColor: "#27b030", color: "white"};
        }
        if (status === "NOT_FOUND") {
            return {backgroundColor: "#b92828", color: "white"};
        }

        return {};
    };

    const handleChangePassword = async () => {
        if (currentPassword === newPassword) {
            setAccountPasswordMessage("New password must be different from current password");
            return;
        }
        
        try {
            const response = await changeAdminPassword(currentPassword, newPassword);
            
            setAccountPasswordMessage(response || "Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setShowCurrentPassword(false);
            setShowNewPassword(false);
        } 
        catch (error) {
            console.error(error);
            setAccountPasswordMessage(error?.response?.data || "Failed to change password");
        }
    };

    // const isAllowedTemplateFile = (file) => {
    //     if (!file) return false;

    //     const allowedExtensions = [".pdf", ".docx"];
    //     const lowerName = file.name.toLowerCase();

    //     return allowedExtensions.some((ext) => lowerName.endsWith(ext));
    // };

    const handleTemplateDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // dragTemplateCounterRef.current += 1;

        // if (!isDraggedTemplateFile(e)) {
        //     setIsDraggingTemplate(true);
        // }
        // else {
        //     setIsDraggingTemplate(false);
        // }
    };

    const handleTemplateDragOver = (e) => {
        // if (!isDraggedTemplateFile(e)) return;
        
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

        // dragTemplateCounterRef.current -= 1;

        // if (dragTemplateCounterRef.current <= 0) {
        //     dragTemplateCounterRef.current = 0;
        //     setIsDraggingTemplate(false);
        // }

        const relatedTarget = e.relatedTarget;
        if (e.currentTarget.contains(relatedTarget)) {
            return;
        }

        setIsDraggingTemplate(false);
    };

    const handleTemplateDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // dragTemplateCounterRef.current = 0;
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
        // const { studentId, field } = editingCell;

        if (!studentId || !field) return;

        try {
            const updatedStudent = await updateStudentField(studentId, field, valueToSave);

            setStudents((prev) =>
                prev.map((student) =>
                    student.id === studentId ? updatedStudent : student
                )
            );

            // setEditingCell({ studentId: null, field: null });
            // setEditingValue("");
            // setStatusMessage("Student data updated successfully");

            setStatusMessage("Student data updated successfully");
            cancelEditingCell();
        } catch (error) {
            console.error(error);
            setStatusMessage(error?.response?.data || "Failed to update student data");
        }
    };

    // const handleSaveEditedCellWithValue = async (valueToSave) => {
    //     const { studentId, field } = editingCell;

    //     if (!studentId || !field) return;

    //     try {
    //         const updatedStudent = await updateStudentField(studentId, field, valueToSave);

    //         setStudents((prev) =>
    //             prev.map((student) =>
    //                 student.id === studentId ? updatedStudent : student
    //             )
    //         );

    //         setStatusMessage("Student data updated successfully");
    //         cancelEditingCell();
    //     }
    //     catch (error) {
    //         console.error(error);
    //         setStatusMessage(
    //             error?.response?.data || "Failed to update student data"
    //         );
    //     }
    // };

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

    const navigate = useNavigate();

    // const handleLogout = () => {
    //     logout();
    //     navigate("/login");
    // };

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
        // finally {
        //     logout();
        //     navigate("/login");
        // }
    };

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
            // onChangePage={setActivePage}
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
            onToggleAccount={() => {
                setAccountOpen((prev) => !prev);
                setShowPasswordForm(false);
                setAccountPasswordMessage("");
            }}
            onCloseAccount={() => {
                setAccountOpen(false);
                setShowPasswordForm(false);
                setAccountPasswordMessage("");
            }}

            renderAccountDropdown={() => (
                <div className="student-account-menu">
                    {!showPasswordForm ? (
                        <>
                            <button
                                type="button"
                                className="student-account-menu__item"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                Change Password
                            </button>

                            <br /><br />
                            <button
                                type="button"
                                className="student-account-menu__item student-account-menu__item--danger"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="student-account-password-box">
                            <h4 className="student-account-password-box__title">
                                Change Password
                            </h4>

                            <div className="student-account-password-box__field">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    className="student-account-password-box__input"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="student-account-password-box__toggle"
                                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                                >
                                    {showCurrentPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <div className="student-account-password-box__field">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="student-account-password-box__input"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="student-account-password-box__toggle"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                >
                                    {showNewPassword ? "Hide" : "Show"}
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
                                        accountPasswordMessage.toLowerCase().includes("success")
                                            ? "success"
                                            : "error"
                                    }`}
                                >
                                    {accountPasswordMessage}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        >
            {activePage === "students" && (
                <div className="admin-main-page">
                    <div className="admin-filter-panel">
                        <h2 className="admin-filter-title">Filter</h2>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">Search by full name</label>
                            <input
                                className="admin-input"
                                type="text"
                                placeholder="Type..."
                                value={filters.fullName}
                                onChange={(e) => {
                                    setFilters({ ...filters, fullName: e.target.value });
                                    setCurrentPage(0);
                                }}
                            />
                        </div>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">Educational Program</label>
                            <select
                                className="admin-select"
                                value={filters.educationalProgram}
                                onChange={(e) => handleEducationalProgramChange(e.target.value)}
                            >
                                <option value="">All programs</option>
                                {educationalPrograms.map((program) => (
                                    <option key={program} value={program}>
                                        {program}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">Group</label>
                            <select
                                className="admin-select"
                                value={filters.groupName}
                                onChange={(e) => {
                                    setFilters({ ...filters, groupName: e.target.value });
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="">All groups</option>
                                {groups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">Course</label>
                            <select
                                className="admin-select"
                                value={filters.course}
                                onChange={(e) => {
                                    setFilters({ ...filters, course: e.target.value });
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="">All courses</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">Status</label>
                            <select
                                className="admin-select"
                                value={filters.practiceStatus}
                                onChange={(e) => {
                                    setFilters({ ...filters, practiceStatus: e.target.value });
                                    setCurrentPage(0);
                                }}
                            >
                                <option value="">All statuses</option>
                                <option value="EMPLOYED">EMPLOYED</option>
                                <option value="NOT_FOUND">NOT FOUND</option>
                            </select>
                        </div>

                        <div className="admin-filter-group">
                            <label className="admin-filter-label">GPA</label>
                            <input
                                className="admin-input"
                                type="number"
                                step="0.1"
                                placeholder="Type..."
                                value={filters.minGpa}
                                onChange={(e) => {
                                    setFilters({ ...filters, minGpa: e.target.value });
                                    setCurrentPage(0);
                                }}
                            />
                        </div>

                        <div className="admin-filter-actions admin-filter-actions--single">
                            <button className="admin-pill-btn" onClick={handleResetFilters}>
                                Reset filters
                            </button>
                        </div>

                        <div className="admin-filter-group admin-filter-group--message">
                            <label className="admin-filter-label">Message</label>
                            <textarea
                                className="admin-textarea"
                                placeholder="Type..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        <button className="admin-send-btn" onClick={handleNotificationAction}>
                            Send
                        </button>

                        {statusMessage && <p className="admin-inline-message">{statusMessage}</p>}
                    </div>

                    <div className="admin-table-panel">
                        <div className="admin-table-meta">
                            <span>Selected students: {selectedStudentIds.length}</span>
                            <span>Total Students: {totalStudentsCount}</span>
                        </div>

                        <div className="admin-table-wrapper">
                            <table className="admin-table" onClick={(e) => e.stopPropagation()}>
                                <colgroup>
                                    <col style={{ width: "42px" }} />
                                    <col style={{ width: "110px" }} />
                                    <col style={{ width: "160px" }} />
                                    <col style={{ width: "65px" }} />
                                    <col style={{ width: "50px" }} />
                                    <col style={{ width: "170px" }} />
                                    <col style={{ width: "100px" }} />
                                    <col style={{ width: "45px" }} />
                                    <col style={{ width: "120px" }} />
                                    <col style={{ width: "75px" }} />
                                    <col style={{ width: "55px" }} />
                                    <col style={{ width: "95px" }} />
                                </colgroup>

                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th
                                            onClick={() => handleSort("fullName")}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                        >
                                            Full name {getSortIcon("fullName")}
                                        </th>
                                        <th>Email</th>
                                        <th>Group</th>
                                        <th
                                            onClick={() => handleSort("course")}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                        >
                                            Course {getSortIcon("course")}
                                        </th>
                                        <th>Educational Program</th>
                                        <th>Phone</th>
                                        <th
                                            onClick={() => handleSort("gpa")}
                                            style={{ cursor: "pointer", userSelect: "none" }}
                                        >
                                            GPA {getSortIcon("gpa")}
                                        </th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>CV</th>
                                        <th>Notifications</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map((student) => (
                                        // <tr key={student.id} style={getRowStyle(student.practiceStatus)}>
                                        <tr
                                            key={student.id}
                                            style={getRowStyle(student.practiceStatus)}
                                            className={clickedStudentId === student.id ? "admin-row-selected" : ""}
                                            onClick={() => setClickedStudentId(student.id)}
                                        >
                                            <td>
                                                {/* <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onChange={() => handleSelectStudent(student.id)}
                                                /> */}
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={() => handleSelectStudent(student.id)}
                                                />
                                            </td>
                                            <td title={student.fullName}>{student.fullName}</td>
                                            {/* <td title={student.email}>{student.email}</td> */}
                                            <td
                                                title={student.email}
                                                onDoubleClick={() => startEditingCell(student.id, "email", student.email || "", student)}
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "email" ? (
                                                    <input
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSaveEditedCell(student.id, "email", editingValue);
                                                            }

                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    student.email
                                                )}
                                            </td>
                                            {/* <td>{student.groupName}</td> */}
                                            <td
                                                title={student.groupName}
                                                onDoubleClick={() => startEditingCell(student.id, "groupName", student.groupName || "", student)}
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "groupName" ? (
                                                    <select
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor admin-cell-editor--select"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={async (e) => {
                                                            const newValue = e.target.value;
                                                            setEditingValue(newValue);
                                                            // await handleSaveEditedCellWithValue(newValue);
                                                            await handleSaveEditedCell(student.id, "groupName", newValue);
                                                        }}
                                                        onBlur={() => cancelEditingCell()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    >
                                                        {/* <option value="">Select group</option> */}
                                                        {editingGroups.map((group) => (
                                                            <option key={group} value={group}>
                                                                {group}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    student.groupName
                                                )}
                                            </td>
                                            {/* <td>{student.course}</td> */}
                                            <td
                                                title={String(student.course ?? "")}
                                                onDoubleClick={() => startEditingCell(student.id, "course", String(student.course ?? ""), student)}
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "course" ? (
                                                    <select
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor admin-cell-editor--select"
                                                        autoFocus
                                                        value={String(editingValue)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={async (e) => {
                                                            const newValue = e.target.value;
                                                            setEditingValue(newValue);
                                                            // await handleSaveEditedCellWithValue(newValue);
                                                            await handleSaveEditedCell(student.id, "course", newValue);
                                                        }}
                                                        onBlur={() => cancelEditingCell()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    >
                                                        {/* <option value="">Select course</option> */}
                                                        {courses.map((course) => (
                                                            <option key={course} value={String(course)}>
                                                                {course}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    student.course
                                                )}
                                            </td>
                                            {/* <td title={student.educationalProgram}>{student.educationalProgram}</td> */}
                                            <td
                                                title={student.educationalProgram}
                                                onDoubleClick={() =>
                                                    startEditingCell(student.id, "educationalProgram", student.educationalProgram || "", student)
                                                }
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "educationalProgram" ? (
                                                    <select
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor admin-cell-editor--select"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={async (e) => {
                                                            const newValue = e.target.value;
                                                            setEditingValue(newValue);
                                                            // await handleSaveEditedCellWithValue(newValue);
                                                            await handleSaveEditedCell(student.id, "educationalProgram", newValue);
                                                        }}
                                                        onBlur={() => cancelEditingCell()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    >
                                                        {/* <option value="">Select program</option> */}
                                                        {educationalPrograms.map((program) => (
                                                            <option key={program} value={program}>
                                                                {program}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    student.educationalProgram
                                                )}
                                            </td>
                                            {/* <td>{student.phone || "Not specified"}</td> */}
                                            <td
                                                title={student.phone || "Not specified"}
                                                onDoubleClick={() => startEditingCell(student.id, "phone", student.phone || "", student)}
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "phone" ? (
                                                    <input
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSaveEditedCell(student.id, "phone", editingValue);
                                                            }

                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    student.phone || "Not specified"
                                                )}
                                            </td>
                                            <td>{student.gpa ?? "Not specified"}</td>
                                            {/* <td title={student.companyName || "Not specified"}>
                                                {student.companyName || "Not specified"}
                                            </td> */}
                                            <td
                                                title={student.companyName || "Not specified"}
                                                onDoubleClick={() => startEditingCell(student.id, "companyName", student.companyName || "", student)}
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "companyName" ? (
                                                    <input
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleSaveEditedCell(student.id, "companyName", editingValue);
                                                            }

                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    student.companyName || "Not specified"
                                                )}
                                            </td>
                                            {/* <td>{formatPracticeStatus(student.practiceStatus) || "Not specified"}</td> */}
                                            <td
                                                title={formatPracticeStatus(student.practiceStatus) || "Not specified"}
                                                onDoubleClick={() =>
                                                    startEditingCell(student.id, "practiceStatus", student.practiceStatus || "NOT_FOUND", student)
                                                }
                                            >
                                                {editingCell.studentId === student.id && editingCell.field === "practiceStatus" ? (
                                                    <select
                                                        ref={editingCellRef}
                                                        className="admin-cell-editor admin-cell-editor--select"
                                                        autoFocus
                                                        value={editingValue}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={async (e) => {
                                                            const newValue = e.target.value;
                                                            setEditingValue(newValue);
                                                            // await handleSaveEditedCellWithValue(newValue);
                                                            await handleSaveEditedCell(student.id, "practiceStatus", newValue);
                                                        }}
                                                        onBlur={() => cancelEditingCell()}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                cancelEditingCell();
                                                            }
                                                        }}
                                                    >
                                                        <option value="EMPLOYED">EMPLOYED</option>
                                                        <option value="NOT_FOUND">NOT FOUND</option>
                                                    </select>
                                                ) : (
                                                    formatPracticeStatus(student.practiceStatus) || "Not specified"
                                                )}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {student.resumePath ? (
                                                    // <span
                                                    //     className="admin-check"
                                                    //     style={{ cursor: "pointer" }}
                                                    //     onClick={() => handleDownloadResume(student.id)}
                                                    // >
                                                    //     ✅
                                                    // </span>
                                                    <span
                                                        className="admin-check"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadResume(student.id);
                                                        }}
                                                    >
                                                        ✅
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td>
                                                {/* <button
                                                    className="admin-view-btn"
                                                    onClick={() => handleViewNotifications(student)}
                                                >
                                                    View
                                                </button> */}
                                                <button
                                                    className="admin-view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewNotifications(student);
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(0)}
                                    disabled={currentPage === 0}
                                >
                                    First
                                </button>

                                <button
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(Math.max(startPage - pagesPerBlock, 0))}
                                    disabled={startPage === 0}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: endPage - startPage }, (_, index) => {
                                    const pageNumber = startPage + index;

                                    return (
                                        <button
                                            key={pageNumber}
                                            className={`admin-page-btn ${
                                                currentPage === pageNumber ? "admin-page-btn--active" : ""
                                            }`}
                                            onClick={() => handlePageChange(pageNumber)}
                                        >
                                            {pageNumber + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(endPage)}
                                    disabled={endPage >= totalPages}
                                >
                                    Next
                                </button>

                                <button
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Last
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activePage === "templates" && (
                <div className="admin-templates-page">
                    <div
                        className={`admin-templates-dropzone ${isDraggingTemplate ? "admin-templates-page-dropzone--dragging" : ""}`}
                        onDragEnter={handleTemplateDragEnter}
                        onDragOver={handleTemplateDragOver}
                        onDragLeave={handleTemplateDragLeave}
                        onDrop={handleTemplateDrop}
                    >
                        <h2 className="admin-templates-title">Templates Management</h2>

                        {!showTemplateUploadModal && templateActionMessage && (
                            <p className="admin-template-inline-message success">{templateActionMessage}</p>
                        )}

                        {!showTemplateUploadModal && templateActionError && (
                            <p className="admin-template-inline-message error">{templateActionError}</p>
                        )}
                        
                        <div className="admin-templates-grid">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="admin-template-card"
                                    onMouseEnter={() => setHoveredTemplateId(template.id)}
                                    onMouseLeave={() => setHoveredTemplateId(null)}
                                >
                                    <button
                                        type="button"
                                        className="admin-template-card__button"
                                        onClick={() => handleDownloadTemplateForAdmin(template.id, template.fileName)}
                                    >
                                        <div className="admin-template-card__preview">📄</div>
                                        <div 
                                        className="admin-template-card__name"
                                        title={template.displayName}
                                        >
                                            {getDisplayFileName(template.displayName, 20)}
                                        </div>
                                    </button>

                                    <select
                                        className="admin-template-card__category"
                                        value={template.category}
                                        onChange={(e) => handleChangeTemplateCategory(template.id, e.target.value)}
                                    >
                                        <option value="CV">CV</option>
                                        <option value="CONTRACT">CONTRACT</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>

                                    {hoveredTemplateId === template.id && (
                                        <div className="admin-template-card__actions">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    replaceFileInputRef.current[template.id]?.click();
                                                }}
                                            >
                                                Replace
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingTemplateId(template.id);
                                                    setNewDisplayName(template.displayName);
                                                }}
                                            >
                                                Rename
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTemplate(template.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        ref={(el) => {
                                            replaceFileInputRef.current[template.id] = el;
                                        }}
                                        type="file"
                                        accept=".pdf,.docx"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            handleReplaceTemplateFile(template.id, file);
                                        }}
                                    />

                                    {editingTemplateId === template.id && (
                                        <div className="admin-template-card__rename-box" ref={renameBoxRef}>
                                            <input
                                                type="text"
                                                value={newDisplayName}
                                                onChange={(e) => setNewDisplayName(e.target.value)}
                                                placeholder="New display name"
                                            />
                                            <button onClick={() => handleChangeTemplateName(template.id)}>
                                                Save
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                className="admin-template-upload-tile"
                                onClick={() => {
                                    resetTemplateUploadModal();
                                    setIsTemplateDraggedUpload(false);
                                    setShowTemplateUploadModal(true);
                                }}
                            >
                                <div className="admin-template-upload-tile__box">+</div>
                                <div className="admin-template-upload-tile__text">Upload new template</div>
                            </button>
                        </div>

                        {showTemplateUploadModal && (
                            <div className="admin-template-modal-backdrop">
                                <div className="admin-template-modal">
                                    <div className="admin-template-modal__topbar" />

                                    <div className="admin-template-modal__content">
                                        <h3 className="admin-template-modal__title">Upload new template</h3>

                                        <input
                                            type="text"
                                            className="admin-template-modal__input"
                                            placeholder="Template display name"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />

                                        <select
                                            className="admin-template-modal__input"
                                            value={newTemplateCategory}
                                            onChange={(e) => setNewTemplateCategory(e.target.value)}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="CV">CV</option>
                                            <option value="CONTRACT">CONTRACT</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>

                                        {/* <input
                                            ref={templateFileInputRef}
                                            type="file"
                                            accept=".pdf,.docx"
                                            className="admin-template-modal__file-input"
                                            onChange={(e) => setTemplateFile(e.target.files[0])}
                                        />

                                        {templateFile && (
                                            <p className="admin-template-modal__selected-file">
                                                Selected file: {templateFile.name}
                                            </p>
                                        )} */}

                                        {!isTemplateDraggedUpload && (
                                            <>
                                                <input
                                                    ref={templateFileInputRef}
                                                    type="file"
                                                    accept=".pdf,.docx"
                                                    className="admin-template-modal__file-input"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];

                                                        if (!file) return;

                                                        if (file.size > MAX_TEMPLATE_FILE_SIZE) {
                                                            setTemplateActionMessage("");
                                                            setTemplateActionError("Template file size must be less than 10 MB");
                                                            setTemplateFile(null);

                                                            if (templateFileInputRef.current) {
                                                                templateFileInputRef.current.value = "";
                                                            }

                                                            return;
                                                        }

                                                        if (!isAllowedTemplateFile(file)) {
                                                            setTemplateActionMessage("");
                                                            setTemplateActionError("Only PDF and DOCX files are allowed");
                                                            setTemplateFile(null);

                                                            if (templateFileInputRef.current) {
                                                                templateFileInputRef.current.value = "";
                                                            }

                                                            return;
                                                        }

                                                        setTemplateActionMessage("");
                                                        setTemplateActionError("");
                                                        setTemplateFile(file);
                                                    }}
                                                />

                                                {templateFile && (
                                                    <p className="admin-template-modal__selected-file">
                                                        Selected file: {templateFile.name}
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        <div className="admin-template-modal__actions">
                                            <button
                                                type="button"
                                                className="admin-template-modal__save"
                                                onClick={async () => {
                                                    const success = await handleUploadTemplate();
                                                    if (success) {
                                                        resetTemplateUploadModal();
                                                        setShowTemplateUploadModal(false);
                                                    }
                                                }}
                                                disabled={isUploadingTemplate}
                                            >
                                                {isUploadingTemplate ? "Uploading..." : "Upload Template"}
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-template-modal__cancel"
                                                onClick={() => {
                                                    resetTemplateUploadModal();
                                                    setShowTemplateUploadModal(false);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {templateActionMessage && (
                                            <p className="admin-template-modal__message success">
                                                {templateActionMessage}
                                            </p>
                                        )}

                                        {templateActionError && (
                                            <p className="admin-template-modal__message error">
                                                {templateActionError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isDraggingTemplate && (
                            <div className="admin-template-drag-overlay">
                                <div className="admin-template-drag-overlay__plus">+</div>
                                <div className="admin-template-drag-overlay__text">
                                    Drop your template here
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {notificationViewerOpen && (
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
                            onClick={handleCloseNotificationViewer}
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
                            style={{
                                width: "100%",
                                height: "100%",
                                overflowY: "auto",
                                paddingRight: "8px",
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
                                Notifications: {currentStudentName}
                            </h3>

                            {currentStudentNotifications.length === 0 ? (
                                <p>No notifications</p>
                            ) : (
                                currentStudentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "12px",
                                            marginBottom: "12px",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        <p><strong>Message:</strong> {notification.message}</p>
                                        <p><strong>Created at:</strong> {formatDateTime(notification.createdAt)}</p>
                                        <p><strong>Status:</strong> {notification.isRead ? "Read" : "Unread"}</p>
                                        <p><strong>Read at:</strong> {formatDateTime(notification.readAt)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}