import AdminTemplateCard from "./AdminTemplateCard";
import AdminTemplateUploadModal from "./AdminTemplateUploadModal";

export default function AdminTemplatesSection({
    templates,
    isDraggingTemplate,
    handleTemplateDragEnter,
    handleTemplateDragOver,
    handleTemplateDragLeave,
    handleTemplateDrop,
    showTemplateUploadModal,
    setShowTemplateUploadModal,
    resetTemplateUploadModal,
    templateActionMessage,
    templateActionError,
    setTemplateActionMessage,
    setTemplateActionError,
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
    handleChangeTemplateName,
    renameBoxRef,
    templateName,
    setTemplateName,
    newTemplateCategory,
    setNewTemplateCategory,
    templateFile,
    setTemplateFile,
    templateFileInputRef,
    isTemplateDraggedUpload,
    handleUploadTemplate,
    isUploadingTemplate,
    MAX_TEMPLATE_FILE_SIZE,
    isAllowedTemplateFile,
}) {
    return (
        <div className="admin-templates-page">
            <div
                className={`admin-templates-dropzone ${isDraggingTemplate ? "admin-templates-page-dropzone--dragging" : ""}`}
                onDragEnter={handleTemplateDragEnter}
                onDragOver={handleTemplateDragOver}
                onDragLeave={handleTemplateDragLeave}
                onDrop={handleTemplateDrop}
            >
                <h2 className="admin-templates-title">Templates Management</h2>

                {!showTemplateUploadModal && templateActionMessage && (
                    <p className="admin-template-inline-message success">{templateActionMessage}</p>
                )}

                {!showTemplateUploadModal && templateActionError && (
                    <p className="admin-template-inline-message error">{templateActionError}</p>
                )}

                <div className="admin-templates-grid">
                    {templates.map((template) => (
                        <AdminTemplateCard
                            key={template.id}
                            template={template}
                            hoveredTemplateId={hoveredTemplateId}
                            setHoveredTemplateId={setHoveredTemplateId}
                            handleDownloadTemplateForAdmin={handleDownloadTemplateForAdmin}
                            getDisplayFileName={getDisplayFileName}
                            handleChangeTemplateCategory={handleChangeTemplateCategory}
                            replaceFileInputRef={replaceFileInputRef}
                            handleReplaceTemplateFile={handleReplaceTemplateFile}
                            setEditingTemplateId={setEditingTemplateId}
                            setNewDisplayName={setNewDisplayName}
                            handleDeleteTemplate={handleDeleteTemplate}
                            editingTemplateId={editingTemplateId}
                            newDisplayName={newDisplayName}
                            setNewDisplayNameLocal={setNewDisplayName}
                            handleChangeTemplateName={handleChangeTemplateName}
                            renameBoxRef={renameBoxRef}
                        />
                    ))}

                    <button
                        type="button"
                        className="admin-template-upload-tile"
                        onClick={() => {
                            resetTemplateUploadModal();
                            setShowTemplateUploadModal(true);
                        }}
                    >
                        <div className="admin-template-upload-tile__box">+</div>
                        <div className="admin-template-upload-tile__text">Upload new template</div>
                    </button>
                </div>

                {showTemplateUploadModal && (
                    <AdminTemplateUploadModal
                        templateName={templateName}
                        setTemplateName={setTemplateName}
                        newTemplateCategory={newTemplateCategory}
                        setNewTemplateCategory={setNewTemplateCategory}
                        templateFile={templateFile}
                        setTemplateFile={setTemplateFile}
                        templateFileInputRef={templateFileInputRef}
                        isTemplateDraggedUpload={isTemplateDraggedUpload}
                        templateActionMessage={templateActionMessage}
                        templateActionError={templateActionError}
                        setTemplateActionMessage={setTemplateActionMessage}
                        setTemplateActionError={setTemplateActionError}
                        handleUploadTemplate={handleUploadTemplate}
                        resetTemplateUploadModal={resetTemplateUploadModal}
                        setShowTemplateUploadModal={setShowTemplateUploadModal}
                        isUploadingTemplate={isUploadingTemplate}
                        MAX_TEMPLATE_FILE_SIZE={MAX_TEMPLATE_FILE_SIZE}
                        isAllowedTemplateFile={isAllowedTemplateFile}
                    />
                )}

                {isDraggingTemplate && (
                    <div className="admin-template-drag-overlay">
                        <div className="admin-template-drag-overlay__plus">+</div>
                        <div className="admin-template-drag-overlay__text">
                            Drop your template here
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}