import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import { useState } from "react";
import { useEffect } from "react";
import { Card, createTheme, Typography } from "@mui/material";

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
    if (resp.result_image) result_image = resp.result_image;
  } catch (error) {
    console.error("Error", error);
  }
  return tumortype + "," + accuracy + "," + result_image;
}

const ImageAnalysis = () => {
  const [image, setImage] = React.useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [dontShowImage, setDontShowImage] = useState(false);
  const [dontShowLink, setDontShowLink] = useState(false);
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
      `http://localhost:5000/imageAnalyze/result?type=${tumorType}&accuracy=${accuracy}`,
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
  }, [tumorType, accuracy]);

  const onChange = (imageList: any, addUpdateIndex: any) => {
    console.log(imageList, addUpdateIndex);
    if (imageList.length > 0) {
      setShowDetails(false);
      setDontShowImage(false);
      setDontShowLink(false);
    }
    setImage(imageList);
  };

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
          margin: 2,
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
              padding: 2,
            }}
          >
            A feltöltött kép mesterséges intelligencia segítségével kerül
            elemzésre. A modell összesen hatféle állapotot képes felismerni:
            meningeóma, glióma, agyalapi mirigy daganat, agyvérzés, agyi
            infarktus, valamint az egészséges állapot. Az elemzés eredményeként
            a rendszer azt jelzi, hogy az adott kép mennyire illeszkedik az
            egyes tanult mintákhoz. Amennyiben az egyezés nem egyértelmű, a
            modell jelezheti, hogy az eset további orvosi vizsgálatot
            igényelhet.
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
                          height="250"
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
                            onClick={() => {
                              onImageRemove(index);
                              setShowDetails(false);
                              setDontShowImage(false);
                              setDontShowLink(false);
                            }}
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
                                setResultImage(
                                  result_image + "?t=" + new Date().getTime(),
                                );
                                if (Number(a) > 2 && Number(a) <= 10)
                                  setDontShowImage(false);
                                else setDontShowImage(true);
                                if (Number(a) == 3 || Number(a) == 10)
                                  setDontShowLink(false);
                                else setDontShowLink(true);
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
              border: "1.5px solid secondary.main",
              color: "secondary.contrastText",
              backgroundColor: "secondary.main",
              padding: 2,
              margin: 1,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  padding: 2,
                }}
              >
                {resultData.label}:
              </Typography>
              <Typography
                sx={{
                  width: "90%",
                  height: "90%",
                  marginLeft: 4,
                }}
              >
                {resultData.content}
              </Typography>
              {dontShowLink && (
                <Box sx={{ marginLeft: 4 }}>
                  <a
                    href={resultData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#669bbc" }}
                  >
                    <Typography>Ide kettintva tudsz tovább olvasni</Typography>
                  </a>
                </Box>
              )}
            </Box>
            {dontShowImage && (
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    padding: 2,
                    color: "secondary.contrastText",
                  }}
                >
                  Az elváltozás helye:
                </Typography>
                <Box sx={{ textAlign: "center" }}>
                  <img
                    src={resultImage}
                    alt="Place of the tumor"
                    style={{
                      objectFit: "contain",
                      borderRadius: 15,
                      maxHeight: 400,
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default ImageAnalysis;
