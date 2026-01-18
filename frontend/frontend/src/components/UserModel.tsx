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

      imagesByType.forEach((images, typeIndex) => {
        images.forEach((image, imageIndex) => {
          formData.append(`type_${typeIndex}`, image.file);
        });
      });
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

  return (
    <>
      <Box
        sx={{
          borderRadius: 10,
          color: "#aee0ffff",
          borderColor: "#002360ff",
          backgroundColor: "#546d8fff",
          borderStyle: "solid",
          borderWidth: 1.5,
          padding: 2,
          margin: 2,
          width: "75%",
          textAlign: "left",
          flexDirection: "row",
          display: { xs: "block", md: "flex" },
        }}
      >
        <Typography sx={{}}>
          Az alábbi mezőbe lehet beírni, hogy mennyi féle elváltozást szeretnél
          tanítani, ez minimum 1 és maximum 8 lehet, utána meg fog jelleni annyi
          képfeltöltési lehetőség amennyi be lett írva. Majd minden elváltozást
          külön képfeltölő részhez tölts fel, mert ha keverednek a képek akkor a
          model sem lesz pontos, ami ezek alapján a képek alapján fog tanulni.
        </Typography>
        <Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ marginRight: 2 }}>Elváltozások száma:</Typography>
          <input
            type="number"
            name="numtyp"
            id="numtyp"
            width={5}
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
        </Box>
      </Box>
      {showDetails && (
        <Box sx={{}}>
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 2,
              }}
            >
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
                    <Box>
                      <Tooltip title="Kép feltöltése">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={onImageUpload}
                        >
                          <AddPohotoAlternate />
                        </Button>
                      </Tooltip>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          justifyContent: "center",
                        }}
                      >
                        {imageList.map((image, index) => (
                          <div key={index} className="imageItem">
                            <Box
                              sx={{
                                margin: 1,
                                padding: 1,
                              }}
                            >
                              <img
                                src={image["data_url"]}
                                alt="image"
                                height={100}
                                width={100}
                              />
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
                    </Box>
                  )}
                </ImageUploading>
              ))}
            </Box>
            <Button
              type="submit"
              disabled={imagesByType.every((images) => images.length === 0)}
            >
              Tanítás
            </Button>
          </form>
        </Box>
      )}
    </>
  );
};

export default UserModel;
