/**
 * ================================
 * AdminFiltersPanel
 * ================================
 * Filters panel for students.
 *
 * Responsibilities:
 * - Displays filter inputs
 * - Updates filter state
 * - Triggers notification sending
 *
 * Notes:
 * - Does not contain API logic
 * ================================
 */

export default function AdminFiltersPanel({
    filters,
    setFilters,
    setCurrentPage,
    educationalPrograms,
    groups,
    courses,
    handleEducationalProgramChange,
    handleResetFilters,
    message,
    setMessage,
    handleNotificationAction,
    statusMessage,
    handleExportStudents,
    isExportingStudents,
    isSendingNotification,
}) {
    return (
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
                        setFilters((prev) => ({ ...prev, fullName: e.target.value }));
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
                        setFilters((prev) => ({ ...prev, groupName: e.target.value }));
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
                        setFilters((prev) => ({ ...prev, course: e.target.value }));
                        setCurrentPage(0);
                    }}
                >
                    <option value="">All courses</option>
                    {courses.map((course) => (
                        <option key={course} value={course}>
                            {course}
                        </option>
                    ))}
                </select>
            </div>

            <div className="admin-filter-group">
                <label className="admin-filter-label">Status</label>
                <select
                    className="admin-select"
                    value={filters.practiceStatus}
                    onChange={(e) => {
                        setFilters((prev) => ({ ...prev, practiceStatus: e.target.value }));
                        setCurrentPage(0);
                    }}
                >
                    <option value="">All statuses</option>
                    {/* <option value="EMPLOYED">EMPLOYED</option>
                    <option value="NOT_FOUND">NOT FOUND</option> */}

                    <option value="IN_PRACTICE">IN PRACTICE</option>
                    <option value="NOT_ASSIGNED">NOT ASSIGNED</option>
                    <option value="EARLY_COMPLETION">EARLY COMPLETION</option>
                    <option value="MOBILITY">MOBILITY</option>
                </select>
            </div>

            <div className="admin-filter-group">
                <label className="admin-filter-label">GPA</label>
                <input
                    className="admin-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    placeholder="Type..."
                    value={filters.minGpa}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                            setFilters((prev) => ({...prev, minGpa: "" }));
                            return;
                        }

                        const numericValue = Number(value);

                        if (numericValue < 0) {
                            setFilters((prev) => ({...prev, minGpa: "0" }));
                            return;
                        }

                        setFilters((prev) => ({...prev, minGpa: value }));
                        setCurrentPage(0);
                    }}
                />
            </div>

            <div className="admin-filter-actions admin-filter-actions--single">
                <button className="admin-pill-btn" onClick={handleResetFilters}>
                    Reset filters
                </button>

                <button
                    className="admin-pill-btn"
                    onClick={handleExportStudents}
                    disabled={isExportingStudents}
                >
                    {/* Export Excel */}
                    {isExportingStudents ? "Downloading..." : "Export Excel"}
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

            <button 
                className="admin-send-btn" 
                onClick={handleNotificationAction}
                disabled={isSendingNotification}
            >
                {/* Send */}
                {isSendingNotification ? "Sending..." : "Send"}
            </button>

            {statusMessage && <p className="admin-inline-message">{statusMessage}</p>}
        </div>
    );
}