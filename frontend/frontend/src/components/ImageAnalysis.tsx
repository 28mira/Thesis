import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import Model1 from "./Model1";
import { useState } from "react";
import { useEffect } from "react";
import { Card, Typography } from "@mui/material";

async function handleOnChange(image: any) {
  let tumortype = 0;
  let accuracy = 0.0;
  let result_image = "";
  try {
    const formData = new FormData();
    formData.append("image", image.file);
    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const resp = await response.json();
    console.log("Success:", resp);
    tumortype = Number(resp.prediction);
    accuracy = Number(resp.accuracy);
    result_image = resp.result_image;
  } catch (error) {
    console.error("Error", error);
  }
  return tumortype + "," + accuracy + "," + result_image;
}

const ImageAnalysis = () => {
  const [image, setImage] = React.useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [tumorType, setTumorType] = useState(0);
  const [accuracy, setAccuracy] = useState(0.0);
  const [resultImage, setResultImage] = useState("");
  const [resultData, setResultData] = useState({
    label: null,
    content: null,
    accuracy: null,
    link: "",
  });

  useEffect(() => {
    fetch(
      `http://localhost:5000/imageAnalyze/result?type=${tumorType}&accuracy=${accuracy}`
    )
      .then((response) => response.json())
      .then((data) => {
        setResultData({
          label: data.label,
          content: data.content,
          accuracy: data.accuracy,
          link: data.link,
        });
      })
      .catch((error) => console.error("Error fetching message:", error));
  }, [tumorType]);

  const onChange = (imageList: any, addUpdateIndex: any) => {
    console.log(imageList, addUpdateIndex);
    setImage(imageList);
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
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3">Képelemzés</Typography>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 2 }}>
            Mestereséges intelligencia segítségével elemzésre kerül az ide
            feltöltött kép, ami 6 féle diagnózist adhat vissza. A modell 3 féle
            elváltozást ismer fel ezek a meningeóma, a glióma és az agyalapi
            mirigy daganat, ezeken kívül lehet más fajta elváltozás is és
            teljesen egészséges kép az agyról.
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
                  {imageList.map((image, index) => (
                    <div key={index} className="imageItem">
                      <Box sx={{ margin: 1 }}>
                        <img
                          src={image["data_url"]}
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
                            onClick={() => {
                              handleOnChange(image).then((type) => {
                                const a = type.split(",")[0];
                                const l = type.split(",")[1];
                                const result_image = type.split(",")[2];
                                setTumorType(Number(a));
                                setAccuracy(Number(l));
                                setResultImage(result_image);
                              });
                              setShowDetails(true);
                            }}
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "75%",
        }}
      >
        {showDetails && resultImage && (
          <Box
            sx={{
              flex: 1,
              borderRadius: 10,
              height: "min-content",
              textAlign: "left",
              border: "1.5px solid #002360ff",
              color: "#aee0ffff",
              backgroundColor: "#546d8fff",
              padding: 2,
              margin: 1,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ padding: 2 }}>
                {resultData.label}:
              </Typography>
              <Typography sx={{ width: "90%", height: "90%" }}>
                {resultData.content}
              </Typography>
              <a
                href={resultData.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#002360ff" }}
              >
                Ide kettintva tudsz tovább olvasni
              </a>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ padding: 2, color: "#aee0ffff" }}>
                Az elváltozás helye:
              </Typography>
              <img
                src={resultImage}
                alt="Place of the tumor"
                style={{
                  width: "100%",
                  height: "80%",
                  objectFit: "contain",
                  padding: "5px",
                  borderRadius: "30px",
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ImageAnalysis;
