import { useEffect, useId, useRef } from "react";

import "../styles/modal.css";

function ConfirmModal({
                          title,
                          message,
                          confirmText = "Confirm",
                          confirmVariant = "primary",
                          onConfirm,
                          onCancel
                      }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    const messageId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (dialog && !dialog.open) {
            dialog.showModal();
        }

        return () => {
            if (dialog?.open) {
                dialog.close();
            }
        };
    }, []);

    function handleDialogCancel(event) {
        event.preventDefault();
        onCancel();
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            onCancel();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className="text-modal confirm-modal"
            aria-labelledby={titleId}
            aria-describedby={messageId}
            onCancel={handleDialogCancel}
            onClick={handleBackdropClick}
        >
            <div className="text-modal-form">
                <div className="text-modal-header">
                    <span className="message-modal-type danger">confirmation</span>
                    <h2 id={titleId}>{title}</h2>
                    <p id={messageId}>{message}</p>
                </div>

                <div className="text-modal-actions">
                    <button
                        type="button"
                        className={`modal-confirm-button ${
                            confirmVariant === "danger" ? "danger" : ""
                        }`}
                        autoFocus={confirmVariant !== "danger"}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="modal-cancel-button"
                        autoFocus={confirmVariant === "danger"}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default ConfirmModal;
