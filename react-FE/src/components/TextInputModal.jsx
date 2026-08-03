import { useEffect, useId, useRef, useState } from "react";

import "../styles/modal.css";

function OpenTextInputModal({
                            title,
                            description,
                            initialValue = "",
                            placeholder = "",
                            confirmText = "Confirm",
                            confirmVariant = "primary",
                            maxLength = 255,
                            isSubmitting = false,
                            emptyMessage = "Please enter a value.",
                            onConfirm,
                            onCancel
                        }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();
    const errorId = useId();

    const [value, setValue] = useState(initialValue);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (!dialog.open) {
            dialog.showModal();
        }

        return () => {
            if (dialog.open) {
                dialog.close();
            }
        };
    }, []);

    function handleCancel() {
        if (!isSubmitting) {
            onCancel();
        }
    }

    function handleDialogCancel(event) {
        event.preventDefault();
        handleCancel();
    }

    function handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            handleCancel();
        }
    }

    function handleChange(event) {
        setValue(event.target.value);

        if (errorMessage) {
            setErrorMessage("");
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedValue = value.trim();

        if (!trimmedValue) {
            setErrorMessage(emptyMessage);
            return;
        }

        if (trimmedValue.length > maxLength) {
            setErrorMessage(`Must not exceed ${maxLength} characters.`);
            return;
        }

        void onConfirm(trimmedValue);
    }

    const describedBy = [
        description ? descriptionId : null,
        errorMessage ? errorId : null
    ].filter(Boolean).join(" ") || undefined;

    return (
        <dialog
            ref={dialogRef}
            className="text-modal"
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            onCancel={handleDialogCancel}
            onClick={handleBackdropClick}
        >
            <form className="text-modal-form" onSubmit={handleSubmit}>
                <div className="text-modal-header">
                    <h2 id={titleId}>{title}</h2>

                    {description && (
                        <p id={descriptionId}>{description}</p>
                    )}
                </div>

                <label className="visually-hidden" htmlFor={`${titleId}-input`}>
                    {title}
                </label>

                <textarea
                    id={`${titleId}-input`}
                    className="text-modal-input"
                    value={value}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    rows={5}
                    autoFocus
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errorMessage)}
                    aria-errormessage={errorMessage ? errorId : undefined}
                    onChange={handleChange}
                />

                <div className="text-modal-input-meta">
                    <span
                        id={errorId}
                        className="text-modal-error"
                        aria-live="polite"
                    >
                        {errorMessage}
                    </span>

                    <span className="text-modal-character-count">
                        {value.length} / {maxLength}
                    </span>
                </div>

                <div className="text-modal-actions">
                    <button
                        type="submit"
                        className={`modal-confirm-button ${
                            confirmVariant === "danger" ? "danger" : ""
                        }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : confirmText}
                    </button>

                    <button
                        type="button"
                        className="modal-cancel-button"
                        disabled={isSubmitting}
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </dialog>
    );
}

function TextInputModal({ isOpen, ...modalProps }) {
    if (!isOpen) {
        return null;
    }

    return <OpenTextInputModal {...modalProps} />;
}

export default TextInputModal;
