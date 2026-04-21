/**
 * ================================
 * AdminStudentsPagination
 * ================================
 * Pagination component for students table.
 *
 * Responsibilities:
 * - Handles page navigation
 * - Displays current page state
 *
 * Notes:
 * - Controlled via props
 * ================================
 */

export default function AdminStudentsPagination({
    totalPages,
    currentPage,
    startPage,
    endPage,
    pagesPerBlock,
    handlePageChange,
}) {
    if (totalPages <= 1) return null;

    return (
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
    );
}