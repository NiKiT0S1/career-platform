/**
 * ================================
 * AdminStudentsTable
 * ================================
 * Table component for displaying students.
 *
 * Responsibilities:
 * - Renders students list
 * - Handles inline editing (input and select)
 * - Displays sorting indicators
 * - Manages row selection (checkbox)
 *
 * Notes:
 * - Pure UI component
 * - All logic is passed via props
 * ================================
 */

export default function AdminStudentsTable({
    students,
    clickedStudentId,
    setClickedStudentId,
    selectedStudentIds,
    handleSelectStudent,
    handleSort,
    getSortIcon,
    startEditingCell,
    editingCell,
    editingValue,
    setEditingValue,
    editingCellRef,
    handleSaveEditedCell,
    cancelEditingCell,
    editingGroups,
    courses,
    educationalPrograms,
    formatPracticeStatus,
    getRowStyle,
    handleDownloadResume,
    handleViewNotifications,
    handleOpenPracticeModal,
}) {
    return (
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
                    
                    {/* Practice */}
                    <col style={{ width: "90px" }} />

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

                        <th>Practice</th>

                        <th>Company</th>
                        <th>Status</th>
                        <th>CV</th>
                        <th>Notifications</th>
                    </tr>
                </thead>

                <tbody>
                    {students.map((student) => (
                        <tr
                            key={student.id}
                            style={getRowStyle(student.practiceStatus)}
                            className={clickedStudentId === student.id ? "admin-row-selected" : ""}
                            onClick={() => setClickedStudentId(student.id)}
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => handleSelectStudent(student.id)}
                                />
                            </td>

                            <td title={student.fullName}>{student.fullName}</td>

                            <td
                                title={student.email}
                                onDoubleClick={() =>
                                    startEditingCell(student.id, "email", student.email || "", student)
                                }
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

                            <td
                                title={student.groupName}
                                onDoubleClick={() =>
                                    startEditingCell(student.id, "groupName", student.groupName || "", student)
                                }
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

                            <td
                                title={String(student.course ?? "")}
                                onDoubleClick={() =>
                                    startEditingCell(student.id, "course", String(student.course ?? ""), student)
                                }
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

                            <td
                                title={student.educationalProgram}
                                onDoubleClick={() =>
                                    startEditingCell(
                                        student.id,
                                        "educationalProgram",
                                        student.educationalProgram || "",
                                        student
                                    )
                                }
                            >
                                {editingCell.studentId === student.id &&
                                editingCell.field === "educationalProgram" ? (
                                    <select
                                        ref={editingCellRef}
                                        className="admin-cell-editor admin-cell-editor--select"
                                        autoFocus
                                        value={editingValue}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={async (e) => {
                                            const newValue = e.target.value;
                                            setEditingValue(newValue);
                                            await handleSaveEditedCell(
                                                student.id,
                                                "educationalProgram",
                                                newValue
                                            );
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

                            <td
                                title={student.phone || "Not specified"}
                                onDoubleClick={() =>
                                    startEditingCell(student.id, "phone", student.phone || "", student)
                                }
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

                            <td>
                                <button
                                    className="admin-view-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenPracticeModal(student);
                                    }}
                                >
                                    Edit
                                </button>
                            </td>

                            <td
                                title={student.companyName || "Not specified"}
                                onDoubleClick={() =>
                                    startEditingCell(student.id, "companyName", student.companyName || "", student)
                                }
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

                            <td
                                title={formatPracticeStatus(student.practiceStatus) || "Not specified"}
                                onDoubleClick={() =>
                                    startEditingCell(
                                        student.id,
                                        "practiceStatus",
                                        student.practiceStatus || "NOT_FOUND",
                                        student
                                    )
                                }
                            >
                                {editingCell.studentId === student.id &&
                                editingCell.field === "practiceStatus" ? (
                                    <select
                                        ref={editingCellRef}
                                        className="admin-cell-editor admin-cell-editor--select"
                                        autoFocus
                                        value={editingValue}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={async (e) => {
                                            const newValue = e.target.value;
                                            setEditingValue(newValue);
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
    );
}