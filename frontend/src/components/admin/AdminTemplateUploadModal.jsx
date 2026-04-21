/**
 * ================================
 * AdminTemplateUploadModal
 * ================================
 * Modal for uploading templates.
 *
 * Responsibilities:
 * - Handles file selection
 * - Validates file size and format
 * - Displays upload status
 *
 * Notes:
 * - Controlled by parent component
 * ================================
 */

export default function AdminTemplateUploadModal({
    templateName,
    setTemplateName,
    newTemplateCategory,
    setNewTemplateCategory,
    templateFile,
    setTemplateFile,
    templateFileInputRef,
    isTemplateDraggedUpload,
    templateActionMessage,
    templateActionError,
    setTemplateActionMessage,
    setTemplateActionError,
    handleUploadTemplate,
    resetTemplateUploadModal,
    setShowTemplateUploadModal,
    isUploadingTemplate,
    MAX_TEMPLATE_FILE_SIZE,
    isAllowedTemplateFile,
}) {
    return (
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
    );
}