import { useEffect, useId, useRef } from "react";

import emptyProfileImage from "../images/empty-profile-image.png";
import "../styles/modal.css";

function ProfileImageChoiceModal({
                                     isOpen,
                                     currentImageUrl,
                                     personalImageUrl,
                                     team,
                                     targetImageUrl,
                                     targetLabel,
                                     targetIsTeamLogo,
                                     isSubmitting,
                                     onUseTeamLogo,
                                     onKeepPersonalImage,
                                     onCancel
                                 }) {
    const dialogRef = useRef(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!isOpen || !dialog) {
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
    }, [isOpen]);

    if (!isOpen || !team) {
        return null;
    }

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

    return (
        <dialog
            ref={dialogRef}
            className="text-modal profile-image-choice-modal"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={handleDialogCancel}
            onClick={handleBackdropClick}
        >
            <div className="text-modal-form">
                <div className="text-modal-header">
                    <h2 id={titleId}>Choose your profile image</h2>
                    <p id={descriptionId}>
                        {team.name} will be saved as your favorite team either way.
                    </p>
                </div>

                <div className="profile-image-comparison">
                    <div className="profile-image-option">
                        <span>Current profile</span>
                        <div className="profile-image-modal-preview">
                            <img
                                src={currentImageUrl || emptyProfileImage}
                                alt="Current profile"
                            />
                        </div>
                    </div>

                    <span className="profile-image-change-arrow" aria-hidden="true">
                        →
                    </span>

                    <div className="profile-image-option">
                        <span>{targetLabel}</span>
                        <div
                            className={`profile-image-modal-preview ${
                                targetIsTeamLogo ? "team-logo" : ""
                            }`}
                        >
                            <img
                                src={targetImageUrl || emptyProfileImage}
                                alt={targetIsTeamLogo
                                    ? `${team.name} logo`
                                    : "Personal profile"}
                            />
                        </div>
                    </div>
                </div>

                <p className="profile-image-preserved-note">
                    Your personal image
                    {personalImageUrl ? " will remain saved." : " is not set yet."}
                </p>

                <div className="text-modal-actions profile-choice-actions">
                    <button
                        type="button"
                        className="modal-confirm-button"
                        disabled={isSubmitting}
                        onClick={onUseTeamLogo}
                    >
                        {isSubmitting ? "Saving..." : "Use team logo"}
                    </button>

                    <button
                        type="button"
                        className="profile-choice-personal-button"
                        disabled={isSubmitting}
                        onClick={onKeepPersonalImage}
                    >
                        Use personal image
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
            </div>
        </dialog>
    );
}

export default ProfileImageChoiceModal;
