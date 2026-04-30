export default function AdminSelectedStudentsModal({
    selectedStudents,
    onClose,
    onRemoveStudent,
    onDownloadResume,
    onEditPracticeSelected,
    formatPracticeStatus,
}) {
    return (
        <div
            className="admin-selected-modal-backdrop"
            onClick={onClose}
        >
            <div
                className="admin-selected-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-selected-modal__header">
                    <div>
                        <h3 className="admin-selected-modal__title">
                            Selected Students
                        </h3>
                        <p className="admin-selected-modal__subtitle">
                            Selected: {selectedStudents.length}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-selected-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="admin-selected-modal__table-wrap">
                    <table className="admin-selected-modal__table">
                        <thead>
                            <tr>
                                <th>Full name</th>
                                <th>Email</th>
                                <th>Group</th>
                                <th>Course</th>
                                <th>Educational Program</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Contract</th>
                                <th>CV</th>
                                <th>Remove</th>
                            </tr>
                        </thead>

                        <tbody>
                            {selectedStudents.map((student) => (
                                <tr key={student.id}>
                                    <td title={student.fullName}>
                                        {student.fullName}
                                    </td>

                                    <td title={student.email}>
                                        {student.email}
                                    </td>

                                    <td>{student.groupName}</td>

                                    <td>{student.course}</td>

                                    <td title={student.educationalProgram}>
                                        {student.educationalProgram}
                                    </td>

                                    <td title={student.practice?.companyName || "Not specified"}>
                                        {student.practice?.companyName || "Not specified"}
                                    </td>

                                    <td>
                                        {formatPracticeStatus(student.practice?.practiceStatus) || "Not specified"}
                                    </td>

                                    <td>
                                        {student.practice?.contractNumber || "—"}
                                    </td>

                                    <td>
                                        {student.resumePath ? (
                                            <button
                                                type="button"
                                                className="admin-selected-modal__small-btn"
                                                onClick={() => onDownloadResume(student.id)}
                                            >
                                                Download
                                            </button>
                                        ) : (
                                            "—"
                                        )}
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            className="admin-selected-modal__small-btn admin-selected-modal__small-btn--danger"
                                            onClick={() => onRemoveStudent(student.id)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="admin-selected-modal__actions">
                    <button
                        type="button"
                        className="admin-selected-modal__primary"
                        onClick={onEditPracticeSelected}
                        disabled={selectedStudents.length === 0}
                    >
                        Edit Practice for Selected
                    </button>

                    <button
                        type="button"
                        className="admin-selected-modal__secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}