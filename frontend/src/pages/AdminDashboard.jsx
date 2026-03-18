import { useEffect, useState } from "react";
import {
    getStudentsPage,
    filterStudents,
    sendNotification,
    downloadStudentResume,
} from "../api/adminApi";

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const studentsPerPage = 20;
    const [isFilterMode, setIsFilterMode] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const [filters, setFilters] = useState({
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
        setSelectedStudentIds([]);
        setMessage("");
        setStatusMessage("");
        await loadStudentsPage(0);
    };

    const handlePageChange = async (page) => {
        if (isFilterMode) {
            await handleFilter(page);
        }
        else {
            await loadStudentsPage(page);
        }
    };

    const handleSelectedStudent = (studentId) => {
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
            const response = await sendNotification(selectedStudentIds, message);
            setStatusMessage(response);
            setMessage("");
        } 
        catch (error) {
            console.error(error);
            setStatusMessage("Failed to send notification");
        }
    };

    const handleDownloadResume = async (studentId) => {
        try {
            const blob = await downloadStudentResume(studentId);
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `student-${studentId}-resume.pdf`;
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

            <input 
                type="text"
                placeholder="Practice Status"
                value={filters.practiceStatus}
                onChange={(e) => 
                    setFilters({...filters, practiceStatus: e.target.value})
                }
            />
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

            <button onClick={handleFilter}>Apply Filters</button>
            <button onClick={handleResetFilters} style={{marginLeft: "10px"}}>
                Reset Filters
            </button>

            <h3 style={{marginTop: "30px"}}>Students</h3>

            {students.length === 0 ? (
                <p>No students found</p>
            ) : (
                students.map((student) => (
                    <div
                        key={student.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "12px",
                            marginBottom: "12px",
                        }}
                    >
                        <input 
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => handleSelectedStudent(student.id)}
                        />
                        <span style={{marginLeft: "10px"}}>
                            <strong>{student.fullName}</strong>
                        </span>

                        <p>Email: {student.email}</p>
                        <p>Group: {student.groupName}</p>
                        <p>Course: {student.course}</p>
                        <p>Educational Program: {student.educationalProgram}</p>
                        <p>Phone: {student.phone}</p>
                        <p>GPA: {student.gpa}</p>
                        <p>Company: {student.companyName || "Not specified"}</p>
                        <p>Status: {student.practiceStatus || "Not specified"}</p>

                        <button onClick={() => handleDownloadResume(student.id)}>
                            Download Resume
                        </button>
                    </div>
                ))
            )}

        {totalPages > 1 && (
            <div style={{marginTop: "20px"}}>
                {Array.from({length: totalPages}, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        style={{
                            marginRight: "8px",
                            marginBottom: "8px",
                            fontWeight: currentPage === index ? "bold" : "normal"
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
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

            <button onClick={handleSendNotification}>
                Send Notifications
            </button>

            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}