import { useCallback, useEffect, useRef, useState } from "react";

import ConfirmModal from "../components/ConfirmModal.jsx";
import MessageModal from "../components/MessageModal.jsx";
import { ModalContext } from "./ModalContext.js";

const DEFAULT_TITLES = {
    info: "Notice",
    success: "Success",
    error: "Something went wrong"
};

export function ModalProvider({ children }) {
    const queueRef = useRef([]);
    const activeDialogRef = useRef(null);
    const [activeDialog, setActiveDialog] = useState(null);

    const presentNext = useCallback(() => {
        if (activeDialogRef.current || queueRef.current.length === 0) {
            return;
        }

        const nextDialog = queueRef.current.shift();
        activeDialogRef.current = nextDialog;
        setActiveDialog(nextDialog);
    }, []);

    const enqueue = useCallback((dialog) => new Promise((resolve) => {
        queueRef.current.push({
            ...dialog,
            resolve
        });
        presentNext();
    }), [presentNext]);

    const showMessage = useCallback((message, options = {}) => {
        const variant = options.variant ?? "info";

        return enqueue({
            type: "message",
            message,
            variant,
            title: options.title ?? DEFAULT_TITLES[variant] ?? DEFAULT_TITLES.info
        });
    }, [enqueue]);

    const showConfirm = useCallback((message, options = {}) => enqueue({
        type: "confirm",
        message,
        title: options.title ?? "Please confirm",
        confirmText: options.confirmText ?? "Confirm",
        confirmVariant: options.confirmVariant ?? "primary"
    }), [enqueue]);

    const resolveActiveDialog = useCallback((result) => {
        const currentDialog = activeDialogRef.current;

        if (!currentDialog) {
            return;
        }

        activeDialogRef.current = null;
        setActiveDialog(null);
        currentDialog.resolve(result);

        queueMicrotask(presentNext);
    }, [presentNext]);

    useEffect(() => () => {
        activeDialogRef.current?.resolve(false);
        queueRef.current.forEach((dialog) => dialog.resolve(false));
        queueRef.current = [];
    }, []);

    return (
        <ModalContext.Provider value={{ showMessage, showConfirm }}>
            {children}

            {activeDialog?.type === "message" && (
                <MessageModal
                    title={activeDialog.title}
                    message={activeDialog.message}
                    variant={activeDialog.variant}
                    onClose={() => resolveActiveDialog(true)}
                />
            )}

            {activeDialog?.type === "confirm" && (
                <ConfirmModal
                    title={activeDialog.title}
                    message={activeDialog.message}
                    confirmText={activeDialog.confirmText}
                    confirmVariant={activeDialog.confirmVariant}
                    onConfirm={() => resolveActiveDialog(true)}
                    onCancel={() => resolveActiveDialog(false)}
                />
            )}
        </ModalContext.Provider>
    );
}
