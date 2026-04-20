import StudentCvUploadModal from "./StudentCvUploadModal";

export default function StudentCvSection({
    student,
    handleCvDragEnter,
    handleCvDragOver,
    handleCvDragLeave,
    handleCvDrop,
    resumeActionError,
    resumeActionMessage,
    showCvUploadModal,
    setShowCvUploadModal,
    resetCvUploadModal,
    isDraggingCv,
    isCvHovered,
    setIsCvHovered,
    handlePreviewResume,
    getResumeFileName,
    getDisplayFileName,
    resumeFile,
    resumeFileInputRef,
    handleResumeFileChange,
    handleResumeUpload,
    isUploadingResume,
}) {
    return (
        <div className="student-cv-page">
            <div
                className="student-cv-dropzone"
                onDragEnter={handleCvDragEnter}
                onDragOver={handleCvDragOver}
                onDragLeave={handleCvDragLeave}
                onDrop={handleCvDrop}
            >
                <h1 className="student-page-title">CV</h1>

                {resumeActionError && !showCvUploadModal && (
                    <p className="student-inline-message student-inline-message--error">
                        {resumeActionError}
                    </p>
                )}

                {resumeActionMessage && !showCvUploadModal && (
                    <p className="student-inline-message student-inline-message--success">
                        {resumeActionMessage}
                    </p>
                )}

                <div className="student-cv-grid">
                    {student.resumePath && (
                        <div
                            className="student-cv-card"
                            onMouseEnter={() => setIsCvHovered(true)}
                            onMouseLeave={() => setIsCvHovered(false)}
                        >
                            <button
                                type="button"
                                className="student-cv-preview-button"
                                onClick={handlePreviewResume}
                            >
                                <div className="student-cv-thumbnail">
                                    <span className="student-cv-thumbnail__icon">📄</span>
                                </div>
                                <div
                                    className="student-cv-file-name"
                                    title={getResumeFileName(student.resumePath)}
                                >
                                    {getDisplayFileName(getResumeFileName(student.resumePath), 22)}
                                </div>
                            </button>

                            {isCvHovered && (
                                <button
                                    type="button"
                                    className="student-cv-replace-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCvUploadModal(true);
                                    }}
                                >
                                    Replace CV
                                </button>
                            )}
                        </div>
                    )}

                    {!student.resumePath && (
                        <button
                            type="button"
                            className="student-cv-upload-tile"
                            onClick={() => {
                                resetCvUploadModal();
                                setShowCvUploadModal(true);
                            }}
                        >
                            <div className="student-cv-upload-tile__box">+</div>
                            <div className="student-cv-upload-tile__text">Upload new CV</div>
                        </button>
                    )}
                </div>

                {showCvUploadModal && (
                    <StudentCvUploadModal
                        resumeFile={resumeFile}
                        resumeFileInputRef={resumeFileInputRef}
                        handleResumeFileChange={handleResumeFileChange}
                        handleResumeUpload={handleResumeUpload}
                        resetCvUploadModal={resetCvUploadModal}
                        setShowCvUploadModal={setShowCvUploadModal}
                        isUploadingResume={isUploadingResume}
                        resumeActionMessage={resumeActionMessage}
                        resumeActionError={resumeActionError}
                    />
                )}

                {!student.resumePath && isDraggingCv && (
                    <div className="student-cv-drag-overlay">
                        <div className="student-cv-drag-overlay__plus">+</div>
                        <div className="student-cv-drag-overlay__text">Drop your CV here</div>
                    </div>
                )}
            </div>
        </div>
    );
}