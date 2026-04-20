export default function StudentTemplatesSection({
    templates,
    handleDownloadTemplate,
    getDisplayFileName,
}) {
    return (
        <div className="student-templates-page">
            <h1 className="student-page-title">Templates</h1>

            <div className="student-templates-grid">
                {templates.length === 0 ? (
                    <p>No templates available</p>
                ) : (
                    templates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            className="student-template-card"
                            onClick={() => handleDownloadTemplate(template.id, template.fileName)}
                        >
                            <div className="student-template-card__preview">📄</div>
                            <div
                                className="student-template-card__name"
                                title={template.displayName}
                            >
                                {getDisplayFileName(template.displayName, 20)}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}