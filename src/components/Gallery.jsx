import { useEffect, useState } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaImage } from "react-icons/fa";

const SortableImage = ({ image, index }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: image._id });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const [hovered, setHovered] = useState(false);
    const [checked, setChecked] = useState(false);

    const checkboxStyle =
        "absolute top-2 left-2 p-1 text-white rounded-full cursor-pointer";

    const handleCheckboxClick = () => {
        setChecked(!checked);
        if (checked) {
            setSelectedImage(selectedImage.filter((id) => id !== image._id));
        } else {
            setSelectedImage([...selectedImage, image._id]);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={index === 0 ? 'col-span-2 row-span-2 col-start-1 row-start-1 ' : '' || `relative ${hovered ? "darken" : ""}`}

            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {hovered &&
                <div className={checkboxStyle}>
                    <input type="checkbox" />
                </div>
            }

            <div className={`card shadow-sm ${hovered ? "bg-slate-500" : ""}`}>
                <img
                    src={image.image}
                    className={`w-full h-auto border border-slate-300 rounded-lg picture ${hovered ? "opacity-100" : ""}`}
                />
            </div>
        </div>
    );
  
};

const Gallery = () => {
    const [images, setImage] = useState([]);
    // const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(
        localStorage.getItem("selectedImage") || null
    );

    const onCheckboxClick = (imageId) => {
        if (selectedImage.includes(imageId)) {
            setSelectedImage(selectedImage.filter((id) => id !== imageId));
        } else {
            setSelectedImage([...selectedImage, imageId]);
        }
    };

    useEffect(() => {
        getImage();
    }, [])

    // console.log(images[0].image);
    const onDragEnd = (event) => {
        const { active, over } = event;
        console.log(event);
        if (active.id === over.id) {
            return;
        }
        setImage((images) => {
            const oldIndex = images.findIndex((image) => image.id === active.id);
            const newIndex = images.findIndex((image) => image.id === over.id);
            return arrayMove(images, oldIndex, newIndex);
        });
    };

    const uploadImageToServer = async (file) => {
        console.log(selectedImage);
        fetch("http://localhost:5000/upload-image", {
            method: "POST",
            crossDomain: true,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                base64: file,
            })
        }).then((res) => res.json())
            .then((data) => console.log(data))

    };
    const handleAddPhotoClick = () => {
        // Open the file selection dialog
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () => {
                const selectedImage = reader.result;
                console.log(selectedImage); // This should show the selected image URL

                // Store the selectedImage in local storage
                localStorage.setItem("selectedImage", selectedImage);

                // Call uploadImageToServer with the selectedImage
                uploadImageToServer(selectedImage);
            };
            reader.onerror = (error) => {
                console.log("Error: ", error);
            };
        };
        input.click();
    };

    function getImage() {
        fetch('http://localhost:5000/get-image', {
            method: "GET",
        }).then((res) => res.json()).then((data) => {
            // console.log(data);
            setImage(data.data);
        })
    }

    const handleDeleteImages = () => {
        if (selectedImage.length === 0) {
          return;
        }
       console.log(selectedImage);
        // Convert selectedImages to an array of strings
        const imageIds = selectedImage;
        console.log(imageIds);
      
        fetch("http://localhost:5000/delete-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageIds }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "ok") {
              getImage();
              setSelectedImage([]);
            }
          });
      };
      
      

    return (
        <div>
            <div className="mt-8 mb-5 flex justify-between">
                <h2 className='text-4xl font-bold ml-8 '>Gallery</h2>
                <button className="btn bg-red-600 text-white p-3 rounded-lg mr-10" onClick={handleDeleteImages}
                    disabled={selectedImage.length === 0}>Delete</button>
            </div>
            <hr className='h-1 bg-slate-300' />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 mt-5">
                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={images} strategy={verticalListSortingStrategy}>
                        {images.map((image, index) => (
                            <SortableImage key={image.id} index={index} image={image} />
                        ))}
                    </SortableContext>
                </DndContext>
                {/* Add Photo Button */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg">
                    <div className="card cursor-pointer" onClick={handleAddPhotoClick}>
                        <div className="text-center text-3xl font-semibold text-gray-400 mt-20 mb-14">
                            <p className=""><FaImage className="ml-28"></FaImage></p>
                            <p className="">Add Image</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;