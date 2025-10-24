import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import Link from "@mui/material/Link";
import Refresh from "@mui/icons-material/Refresh";
import { set, useForm } from "react-hook-form";
import { useState } from "react";
import { useEffect } from "react";
import { Card, Typography } from "@mui/material";

async function handleOnChange(image: any) {
  let tumortype = 0;
  let accuracy = 0.0;
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
  } catch (error) {
    console.error("Error", error);
  }
  return tumortype + "," + accuracy;
}

const ImageAnalysis = () => {
  const [image, setImage] = React.useState([]);
  const [accuracy, setAccuracy] = useState(0.0);
  const [showDetails, setShowDetails] = useState(false);
  const [tumorType, setTumorType] = useState(0);
  const [resultData, setResultData] = useState({
    label: null,
    content: null,
    accuracy: null,
    link: "",
    placeOfTumorLabel: null,
    placeOfTumor: React.useState<string>(""),
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
          placeOfTumorLabel: data.placeOfTumorLabel,
          placeOfTumor: data.placeOfTumor,
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
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="center"
        textAlign="left"
        width="75%"
        height="min-content"
        bgcolor="#ffffffff"
        padding={2}
        marginTop={3}
        display={{ xs: "block", md: "flex" }}
      >
        <Card
          variant="outlined"
          sx={{
            flexDirection: "column",
            padding: 3,
            marginBottom: 3,
            borderRadius: 10,
            color: "#002360ff",
            borderColor: "#073c8bff",
          }}
        >
          <Typography variant="h3">Képelemzés</Typography>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 2 }}>
            Mestereséges intelligencia segítségével elemzésre kerül az ide
            feltöltött kép, ami 4 / 5 féle diagnózist adhat vissza. A modell 3
            féle elváltozást ismer fel ezek a meningeóma, a glióma és az
            agyalapi mirigy daganat, ezeken kívül lehet más fajta elváltozás is
            és teljesen egészséges kép az agyról.
          </Typography>

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
                        <img src={image["data_url"]} alt="image" width="100" />
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
                                const t = parseInt(type.split(",")[0]);
                                const a = parseFloat(type.split(",")[1]);
                                setAccuracy(a);
                                setTumorType(t);
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
        </Card>
      </Box>
      {showDetails && (
        <Box
          flexDirection="row"
          alignItems="flex-start"
          justifyContent="space-between"
          textAlign="left"
          width="75%"
          height="min-content"
          bgcolor="#ffffffff"
          padding={2}
          marginTop={3}
          display={{ xs: "block", md: "flex" }}
        >
          <Card
            variant="outlined"
            sx={{
              flexDirection: "row",
              width: "47%",
              padding: 2,
              marginBottom: 3,
              borderRadius: 10,
              color: "#002360ff",
              borderColor: "#073c8bff",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                marginBottom: 2,
              }}
            >
              Eredmény
            </Typography>
            <Typography variant="h5">{resultData.label}:</Typography>
            <Typography>{resultData.content}</Typography>
            <a href={resultData.link} target="_blank" rel="noopener noreferrer">
              Ide kettintva tudsz tovább olvasni
            </a>
          </Card>
          <Card
            variant="outlined"
            sx={{
              flexDirection: "row",
              alignItems: "left",
              width: "47%",
              marginBottom: 3,
              padding: 2,
              height: { md: "380px", xs: "300px" },
              borderRadius: 10,
              color: "#002360ff",
              borderColor: "#073c8bff",
            }}
          >
            <Typography variant="h5">
              {resultData.placeOfTumorLabel}:
            </Typography>
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt="Place of the tumor"
            />
          </Card>
        </Box>
      )}
    </>
  );
};

export default ImageAnalysis;
