import { useEffect, useState } from "react";
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
    changeAdminPassword,
} from "../api/adminApi";
import { logout } from "../auth/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const [admin, setAdmin] = useState(null);
    const [students, setStudents] = useState([]);
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

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isFilterMode, setIsFilterMode] = useState(false);

    const studentsPerPage = 20;
    const pagesPerBlock = 15;

    const [appliedFilters, setAppliedFilters] = useState({
        fullName: "",
        educationalProgram: "",
        groupName: "",
        course: "",
        practiceStatus: "",
        minGpa: "",
    });

    const [notificationViewerOpen, setNotificationViewerOpen] = useState(false);
    const [currentStudentNotifications, setCurrentStudentNotifications] = useState([]);
    const [currentStudentName, setCurrentStudentName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        loadCurrentAdmin();
        loadStudentsPage(0);
        loadEducationalPrograms();
        loadGroups();
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

            try {
                const data = await filterStudents(preparedFilters, currentPage, studentsPerPage);
                setStudents(data.content);
                // setCurrentPage(data.number);
                setTotalPages(data.totalPages);
                // setTotalStudentsCount(data.totalElements);
            }
            catch (error) {
                console.error(error);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [filters.fullName, appliedFilters, currentPage, studentsPerPage]);

    const loadCurrentAdmin = async () => {
        try {
            const data = await getCurrentAdmin();
            setAdmin(data);
        } 
        catch (error) {
            console.error(error);
        }
    };
    
    const loadStudentsPage = async (page = 0) => {
        try {
            const data = await getStudentsPage(page, studentsPerPage);
            setStudents(data.content);
            setCurrentPage(data.number);
            setTotalPages(data.totalPages);
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

    const handleFilter = async (page = 0) => {
        try {
            const preparedFilters = {
                fullName: filters.fullName || undefined,
                educationalProgram: filters.educationalProgram || undefined,
                groupName: filters.groupName || undefined,
                course: filters.course ? Number(filters.course) : undefined,
                practiceStatus: filters.practiceStatus || undefined,
                minGpa: filters.minGpa ? Number(filters.minGpa) : undefined,
            };

            const data = await filterStudents(preparedFilters, page, studentsPerPage);

            setStudents(data.content);
            setCurrentPage(data.number);
            setTotalPages(data.totalPages);
            setIsFilterMode(true);
            setSelectedStudentIds([]);

            setAppliedFilters({
                fullName: filters.fullName,
                educationalProgram: filters.educationalProgram,
                groupName: filters.groupName,
                course: filters.course,
                practiceStatus: filters.practiceStatus,
                minGpa: filters.minGpa,
            });
        } 
        catch (error) {
            console.error(error);
        }
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
        setAppliedFilters({
            fullName: "",
            educationalProgram: "",
            groupName: "",
            course: "",
            practiceStatus: "",
            minGpa: "",
        });
        setSelectedStudentIds([]);
        setMessage("");
        setStatusMessage("");
        await loadStudentsPage(0);
    };

    const handlePageChange = async (page) => {
        if (page < 0 || page >= totalPages) return;

        if (isFilterMode) {
            await handleFilter(page);
        }
        else {
            await loadStudentsPage(page);
        }
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
            console.log("Selected students: ", selectedStudentIds);
            console.log("Message:", message);

            const response = await sendNotification(selectedStudentIds, message);
            setStatusMessage(response);
            setMessage("");
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
            link.download = `student-${safeName}-resume.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } 
        catch (error) {
            console.error(error);
            setStatusMessage("Resume not found or failed to download");
        }
    };

    const handleViewNotifications = async (student) => {
        try {
            const data = await getStudentNotificationsForAdmin(student.id);
            setCurrentStudentNotifications(data);
            setCurrentStudentName(student.fullName);
            setNotificationViewerOpen(true);
        } 
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to load student notifications");
        }
    };

    const handleCloseNotificationViewer = () => {
        setNotificationViewerOpen(false);
        setCurrentStudentNotifications([]);
        setCurrentStudentName("");
    };

    const currentBlock = Math.floor(currentPage / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock;
    const endPage = Math.min(startPage + pagesPerBlock, totalPages);

    const hasSelectedStudent = selectedStudentIds.length > 0;

    const hasActiveFilters = 
        !!appliedFilters.fullName ||
        !!appliedFilters.educationalProgram ||
        !!appliedFilters.groupName ||
        !!appliedFilters.course ||
        !!appliedFilters.practiceStatus ||
        !!appliedFilters.minGpa;

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

    const handleChangePassword = async () => {
        try {
            const response = await changeAdminPassword(currentPassword, newPassword);
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

            <h1>Admin Dashboard</h1>

            {admin && (
                <p>Logged in as: {admin.fullName} ({admin.email})</p>
            )}

            <h3>Filters</h3>

            <input 
                type="text"
                placeholder="Search by full name"
                value={filters.fullName}
                onChange={(e) => {
                    setFilters({...filters, fullName: e.target.value});
                    setCurrentPage(0);
                }}
            />
            <br /><br />
            
            <select
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
            <br /><br />

            <select
                value={filters.groupName}
                onChange={(e) => 
                    setFilters({...filters, groupName: e.target.value})
                }
            >
                <option value="">All groups</option>
                {groups.map((group) => (
                    <option key={group} value={group}>
                        {group}
                    </option>
                ))}
            </select>
            <br /><br />

            <select
                value={filters.course}
                onChange={(e) => 
                    setFilters({...filters, course: e.target.value})
                }
            >
                <option value="">All courses</option>
                <option value="2">2</option>
                <option value="3">3</option>
            </select>
            <br /><br />

            <select 
                value={filters.practiceStatus}
                onChange={(e) => 
                    setFilters({...filters, practiceStatus: e.target.value})
                }
            >
                <option value="">All statuses</option>
                <option value="EMPLOYED">EMPLOYED</option>
                <option value="NOT_FOUND">NOT FOUND</option>
            </select>
            <br /><br />

            <input 
                type="number"
                step="0.1"
                placeholder="Minimum GPA"
                value={filters.minGpa}
                onChange={(e) => 
                    setFilters({...filters, minGpa: e.target.value})
                }
            />
            <br /><br />

            <button onClick={() => handleFilter(0)}>Apply Filters</button>
            <button onClick={handleResetFilters} style={{marginLeft: "10px"}}>
                Reset Filters
            </button>

            <h3 style={{marginTop: "30px"}}>Students</h3>

            <p>Selected students: {selectedStudentIds.length}</p>

            {students.length === 0 ? (
                <p>No students found</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table
                        border="1"
                        cellPadding="8"
                        cellSpacing="0"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left",
                        }}
                    >
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Group</th>
                            <th>Course</th>
                            <th>Educational Program</th>
                            <th>Phone</th>
                            <th>GPA</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Resume</th>
                            <th>Notifications</th>
                        </tr>
                        </thead>

                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleSelectStudent(student.id)}
                                        />
                                    </td>
                                    <td>{student.fullName}</td>
                                    <td>{student.email}</td>
                                    <td>{student.groupName}</td>
                                    <td>{student.course}</td>
                                    <td>{student.educationalProgram}</td>
                                    <td>{student.phone || "Not specified"}</td>
                                    <td>{student.gpa ?? "Not specified"}</td>
                                    <td>{student.companyName || "Not specified"}</td>
                                    <td>{student.practiceStatus || "Not specified"}</td>
                                    <td>
                                        {student.resumePath ? (
                                            <button onClick={() => handleDownloadResume(student.id)}>
                                                Download
                                            </button>
                                        ) : (
                                            "No resume"
                                        )}
                                    </td>
                                    <td>
                                        <button onClick={() => handleViewNotifications(student)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

            {totalPages > 1 && (
                <div style={{ marginTop: "20px" }}>
                    <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                    >
                        First
                    </button>

                    <button
                        onClick={() => handlePageChange(Math.max(startPage - pagesPerBlock, 0))}
                        disabled={startPage === 0}
                        style={{ marginLeft: "8px" }}
                    >
                        Previous
                    </button>

                    {Array.from({ length: endPage - startPage }, (_, index) => {
                        const pageNumber = startPage + index;

                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                style={{
                                marginLeft: "8px",
                                fontWeight: currentPage === pageNumber ? "bold" : "normal",
                                }}
                            >
                                {pageNumber + 1}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(endPage)}
                        disabled={endPage >= totalPages}
                        style={{ marginLeft: "8px" }}
                    >
                        Next
                    </button>

                    <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        style={{ marginLeft: "8px" }}
                    >
                        Last
                    </button>
                </div>
            )}

            <h3 style={{marginTop: "30px"}}>Send Notification</h3>

            <textarea
                rows="5"
                cols="60"
                placeholder="Enter message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <br /><br />

            <button onClick={handleNotificationAction}>
                {getNotificationsButtonText()}
            </button>

            {statusMessage && <p>{statusMessage}</p>}


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