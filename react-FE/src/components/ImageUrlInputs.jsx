import { createClientId } from "../utils/createClientId.js";

function ImageUrlInputs({
                            images,
                            setImages,
                            isSubmitting
                        }) {
    function handleImageChange(id, value) {
        setImages((previousImages) =>
            previousImages.map((image) =>
                image.id === id
                    ? {
                        ...image,
                        url: value
                    }
                    : image
            )
        );
    }

    function handleAddImage() {
        setImages((previousImages) => [
            ...previousImages,
            {
                id: createClientId("image"),
                url: ""
            }
        ]);
    }

    function handleRemoveImage(id) {
        setImages((previousImages) => {
            const nextImages = previousImages.filter(
                (image) => image.id !== id
            );

            if (nextImages.length === 0) {
                return [
                    {
                        id: createClientId("image"),
                        url: ""
                    }
                ];
            }

            return nextImages;
        });
    }

    function handleMoveImageUp(index) {
        if (index === 0) {
            return;
        }

        setImages((previousImages) => {
            const nextImages = [...previousImages];

            [
                nextImages[index - 1],
                nextImages[index]
            ] = [
                nextImages[index],
                nextImages[index - 1]
            ];

            return nextImages;
        });
    }

    function handleMoveImageDown(index) {
        setImages((previousImages) => {
            if (index === previousImages.length - 1) {
                return previousImages;
            }

            const nextImages = [...previousImages];

            [
                nextImages[index],
                nextImages[index + 1]
            ] = [
                nextImages[index + 1],
                nextImages[index]
            ];

            return nextImages;
        });
    }

    return (
        <div className="form-group">
            <label>Images</label>

            <div className="image-inputs">
                {images.map((image, index) => (
                    <div
                        className="image-input-row"
                        key={image.id}
                    >
                        <input
                            type="url"
                            value={image.url}
                            placeholder="Enter Image URL"
                            onChange={(event) =>
                                handleImageChange(
                                    image.id,
                                    event.target.value
                                )
                            }
                            disabled={isSubmitting}
                        />

                        <div className="image-input-actions">
                            <button
                                type="button"
                                className="image-order-button"
                                onClick={() =>
                                    handleMoveImageUp(index)
                                }
                                disabled={
                                    isSubmitting || index === 0
                                }
                                aria-label="Move image up"
                            >
                                ⬆
                            </button>

                            <button
                                type="button"
                                className="image-order-button"
                                onClick={() =>
                                    handleMoveImageDown(index)
                                }
                                disabled={
                                    isSubmitting ||
                                    index === images.length - 1
                                }
                                aria-label="Move image down"
                            >
                                ⬇
                            </button>

                            <button
                                type="button"
                                className="remove-image-button"
                                onClick={() =>
                                    handleRemoveImage(image.id)
                                }
                                disabled={isSubmitting}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                id="addImageButton"
                onClick={handleAddImage}
                disabled={isSubmitting}
            >
                Add image
            </button>
        </div>
    );
}

export default ImageUrlInputs;
