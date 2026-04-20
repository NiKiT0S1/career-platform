import { Document, Page } from "react-pdf";

export default function StudentPdfPreviewModal({
    pdfFile,
    numPages,
    setNumPages,
    pageWidth,
    previewContainerRef,
    handleClosePreview,
}) {
    if (!pdfFile) return null;

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        console.error("PDF load error:", error);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "85%",
                    height: "85%",
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    padding: "16px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <button
                    onClick={handleClosePreview}
                    style={{
                        position: "absolute",
                        top: "-14px",
                        right: "-14px",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "none",
                        backgroundColor: "#ffffff",
                        color: "#222",
                        fontSize: "26px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                        zIndex: 1001,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        lineHeight: "1",
                    }}
                >
                    ×
                </button>

                <div
                    ref={previewContainerRef}
                    style={{
                        flex: 1,
                        overflow: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        paddingTop: "12px",
                    }}
                >
                    <Document
                        file={pdfFile}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading="Loading PDF..."
                        error="Failed to load PDF file."
                    >
                        {Array.from(new Array(numPages || 0), (_, index) => (
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
}