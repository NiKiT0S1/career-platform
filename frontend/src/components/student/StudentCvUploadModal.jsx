export default function StudentCvUploadModal({
    resumeFile,
    resumeFileInputRef,
    handleResumeFileChange,
    handleResumeUpload,
    resetCvUploadModal,
    setShowCvUploadModal,
    isUploadingResume,
    resumeActionMessage,
    resumeActionError,
}) {
    return (
        <div className="student-cv-modal-backdrop">
            <div className="student-cv-modal">
                <div className="student-cv-modal__topbar" />

                <div className="student-cv-modal__content">
                    <h3 className="student-cv-modal__title">Upload new CV</h3>

                    <input
                        ref={resumeFileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="student-cv-modal__file-input"
                        onChange={handleResumeFileChange}
                    />

                    {resumeFile && (
                        <p className="student-cv-modal__selected-file">
                            Selected file: {resumeFile.name}
                        </p>
                    )}

                    <div className="student-cv-modal__actions">
                        <button
                            type="button"
                            className="student-cv-modal__save"
                            onClick={async () => {
                                const success = await handleResumeUpload();

                                if (success) {
                                    resetCvUploadModal();
                                    setShowCvUploadModal(false);
                                }
                            }}
                            disabled={isUploadingResume}
                        >
                            {isUploadingResume ? "Uploading..." : "Save CV"}
                        </button>

                        <button
                            type="button"
                            className="student-cv-modal__cancel"
                            onClick={() => {
                                resetCvUploadModal();
                                setShowCvUploadModal(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    {resumeActionMessage && (
                        <p className="student-cv-modal__message success">
                            {resumeActionMessage}
                        </p>
                    )}

                    {resumeActionError && (
                        <p className="student-cv-modal__message error">
                            {resumeActionError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}