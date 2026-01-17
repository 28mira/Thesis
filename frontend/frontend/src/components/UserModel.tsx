import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { set } from "react-hook-form";

const UserModel = () => {
  const [numberOfTypes, setNumberOfTypes] = useState(5);
  const [imagesByType, setImagesByType] = useState<any[][]>([]);
  const [images, setImages] = React.useState<any[]>([]);
  const [imageListLenght, setImageListLength] = React.useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      /*images.forEach((img) => {
        formData.append("images", img.file);
      });*/
      formData.append("numtypes", numberOfTypes.toString());

      const response = await fetch("http://localhost:5000/api/userModel", {
        method: "POST",
        body: formData,
      });

      const resp = await response.json();
      console.log("Success:", resp);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const OnChange = (imageList: any[], addUpdateIndex: any) => {
    let list_size = 0;
    for (let i = 0; i < imageList.length; i++) {
      list_size += imageList[i].file.size;
    }
    if (list_size > 5000000) {
      alert("A feltöltött képek mérete nem haladhatja meg az 5MB-ot!");
      return;
    } else {
      setImages(imageList);
      setImageListLength(imageList.length);
    }
  };

  return (
    <>
      <Typography sx={{}}>Hali</Typography>
      <input
        type="number"
        name="numtyp"
        id="numtyp"
        max={8}
        min={1}
        onChange={(e) => {
          const numtype = Number(e.target.value);
          if (numtype < 1 || numtype > 8) {
            alert("A típusok száma 1 és 8 között kell legyen!");
            return "A típusok száma 1 és 8 között kell legyen!";
          }
          setNumberOfTypes(numtype);
          setShowDetails(true);
          setImagesByType(Array.from({ length: numtype }, () => []));
        }}
      />
      {showDetails && (
        <form onSubmit={handleSubmit}>
          {imagesByType.map((value, index) => (
            <ImageUploading
              multiple
              key={index}
              value={value}
              dataURLKey="data_url"
              acceptType={["jpg", "png"]}
              onChange={(imageList) => {
                setImagesByType((prevImagesByType) => {
                  const newImagesByType = [...prevImagesByType];
                  newImagesByType[index] = imageList;
                  return newImagesByType;
                });
              }}
            >
              {({ imageList, onImageUpload, onImageRemove }) => (
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                  <Tooltip title="Kép feltöltése">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onImageUpload}
                    >
                      <AddPohotoAlternate />
                    </Button>
                  </Tooltip>
                  {imageList.map((image, index) => (
                    <div key={index} className="imageItem">
                      <Box sx={{ margin: 1, padding: 1 }}>
                        <img src={image["data_url"]} alt="image" width="100" />
                      </Box>
                      <div>
                        <Tooltip title="Feltöltött képek eltávolítása">
                          <Button
                            sx={{ marginRight: 1 }}
                            variant="contained"
                            color="error"
                            onClick={() => onImageRemove(index)}
                          >
                            <HideImage />
                          </Button>
                        </Tooltip>
                        &nbsp;
                      </div>
                    </div>
                  ))}
                </Box>
              )}
            </ImageUploading>
          ))}
          <Button
            type="submit"
            disabled={imagesByType.every((images) => images.length === 0)}
          >
            Tanítás
          </Button>
        </form>
      )}
    </>
  );
};

export default UserModel;
