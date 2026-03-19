import { useEffect, useState } from "react";
import {
    getStudentsPage,
    filterStudents,
    sendNotification,
    sendNotificationByFilter,
    downloadStudentResume,
} from "../api/adminApi";

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [filters, setFilters] = useState({
        educationalProgram: "",
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
        educationalProgram: "",
        course: "",
        practiceStatus: "",
        minGpa: "",
    });

    useEffect(() => {
        loadStudentsPage(0);
    }, []);

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

    const handleFilter = async (page = 0) => {
        try {
            const preparedFilters = {
                educationalProgram: filters.educationalProgram || undefined,
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
                educationalProgram: filters.educationalProgram,
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
            educationalProgram: "",
            course: "",
            practiceStatus: "",
            minGpa: "",
        });
        setAppliedFilters({
            educationalProgram: "",
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

    const currentBlock = Math.floor(currentPage / pagesPerBlock);
    const startPage = currentBlock * pagesPerBlock;
    const endPage = Math.min(startPage + pagesPerBlock, totalPages);

    const hasSelectedStudent = selectedStudentIds.length > 0;

    const hasActiveFilters = 
        !!appliedFilters.educationalProgram ||
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

    return (
        <div style={{padding: "40px"}}>
            <h1>Admin Dashboard</h1>

            <h3>Filters</h3>

            <input
                type="text"
                placeholder="Educational Program"
                value={filters.educationalProgram}
                onChange={(e) => 
                    setFilters({...filters, educationalProgram: e.target.value})}
            />
            <br /><br />

            <input 
                type="number"
                placeholder="Course"
                value={filters.course}
                onChange={(e) => 
                    setFilters({...filters, course: e.target.value})
                }
            />
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        </div>
    );
}