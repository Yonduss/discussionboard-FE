import { useEffect, useId, useRef } from "react";

import "../styles/modal.css";

function MessageModal({ title, message, variant = "info", onClose }) {
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

    function handleCancel(event) {
        event.preventDefault();
        onClose();
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            className={`text-modal message-modal ${variant}`}
            aria-labelledby={titleId}
            aria-describedby={messageId}
            onCancel={handleCancel}
            onClick={handleBackdropClick}
        >
            <div className="text-modal-form">
                <div className="text-modal-header">
                    <span className="message-modal-type">{variant}</span>
                    <h2 id={titleId}>{title}</h2>
                    <p id={messageId}>{message}</p>
                </div>

                <div className="text-modal-actions">
                    <button
                        type="button"
                        className="modal-confirm-button"
                        autoFocus
                        onClick={onClose}
                    >
                        OK
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default MessageModal;
