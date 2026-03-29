import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import { useState } from "react";
import { Typography } from "@mui/material";

const ImageAnalysis = () => {
  const [image, setImage] = React.useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [tumorType, setTumorType] = useState(0);
  const [accuracy, setAccuracy] = useState(0.0);
  const [label, setLabel] = useState("");

  const onChange = (imageList: any, addUpdateIndex: any) => {
    console.log(imageList, addUpdateIndex);
    setImage(imageList);
  };

  async function HandleOnChange(image: any) {
    try {
      const formData = new FormData();
      formData.append("image", image.file);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/userupload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const resp = await response.json();
      console.log("Success:", resp);
      setTumorType(resp.prediction);
      setAccuracy(resp.accuracy);
      if (resp.label != "") setLabel(resp.label);
      else setLabel(resp.prediction + ". típusú");
      setShowDetails(true);
      return resp;
    } catch (error) {
      console.error("Error", error);
    }
  }

  return (
    <>
      <Box
        sx={{
          borderRadius: 10,
          color: "secondary.contrastText",
          borderColor: "secondary.main",
          backgroundColor: "secondary.main",
          borderStyle: "solid",
          borderWidth: 1.5,
          padding: 2,
          margin: 1,
          width: "75%",
          textAlign: "left",
          flexDirection: "row",
          display: { xs: "block", md: "flex" },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">Képelemzés</Typography>
          <Typography
            variant="body1"
            sx={{
              marginTop: 2,
              marginBottom: 2,
            }}
          >
            Sikeres volt a modell tanítása a megadott képek alapján. Alább tudod
            kiprobálni.
          </Typography>
        </Box>
        <Box sx={{ flex: 1, height: "max-content" }}>
          <div className="imageUpload" style={{ textAlign: "center" }}>
            <ImageUploading
              value={image}
              onChange={onChange}
              dataURLKey="data_url"
              acceptType={["jpg"]}
            >
              {({ imageList, onImageUpload, onImageRemove }) => (
                <div>
                  <Tooltip title="Kép feltöltése">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onImageUpload}
                    >
                      <AddPohotoAlternate />
                    </Button>
                  </Tooltip>
                  {imageList.map((img, index) => (
                    <div key={index} className="imageItem">
                      <Box sx={{ margin: 1 }}>
                        <img
                          src={img["data_url"]}
                          alt="image"
                          height="120"
                          width="auto"
                          style={{ borderRadius: "15px" }}
                        />
                      </Box>
                      <div>
                        <Tooltip title="Feltöltött kép eltávolítása">
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
                        <Tooltip title="Feltöltött kép elemzése">
                          <Button
                            sx={{ marginRight: 1 }}
                            variant="contained"
                            color="success"
                            onClick={() => HandleOnChange(img)}
                          >
                            <FileUploadIcon />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
          </div>
        </Box>
      </Box>
      {showDetails && (
        <Box
          sx={{
            borderRadius: 10,
            color: "secondary.contrastText",
            borderColor: "secondary.main",
            backgroundColor: "secondary.main",
            borderStyle: "solid",
            borderWidth: 1.5,
            padding: 2,
            margin: 1,
            width: "75%",
            textAlign: "left",
            flexDirection: "column",
            display: { xs: "block", md: "flex" },
          }}
        >
          <Typography variant="h5" sx={{}}>
            Eredmény:
          </Typography>
          <Typography sx={{}}>
            A feltöltött kép {accuracy} valószínúséggel egy {label}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ImageAnalysis;
