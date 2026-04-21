export default function AdminTemplateCard({
    template,
    hoveredTemplateId,
    setHoveredTemplateId,
    handleDownloadTemplateForAdmin,
    getDisplayFileName,
    handleChangeTemplateCategory,
    replaceFileInputRef,
    handleReplaceTemplateFile,
    setEditingTemplateId,
    setNewDisplayName,
    handleDeleteTemplate,
    editingTemplateId,
    newDisplayName,
    setNewDisplayNameLocal,
    handleChangeTemplateName,
    renameBoxRef,
}) {
    return (
        <div
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
                        onChange={(e) => setNewDisplayNameLocal(e.target.value)}
                        placeholder="New display name"
                    />
                    <button onClick={() => handleChangeTemplateName(template.id)}>
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}