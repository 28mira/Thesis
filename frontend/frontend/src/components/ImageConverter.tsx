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
import { blue } from "@mui/material/colors";

async function handleOnChange(image: any[]) {
  try {
    const formData = new FormData();
    image.forEach((img, index) => {
      formData.append("images", img.file);
    });
    const response = await fetch("http://localhost:5000/api/convert", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("Error", error);
  }
}

const ImageAnalysis = () => {
  const [images, setImages] = React.useState<any[]>([]);

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
    }
  };
  return (
    <Box
      width="75%"
      height="min-content"
      sx={{
        padding: 2,
        borderRadius: 5,
        margin: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "#002360ff",
        color: "#aee0ffff",
      }}
    >
      <Typography variant="h4" sx={{ padding: 2 }}>
        Képek konvertálása
      </Typography>
      <Typography>
        Abban az esetben, ha nem jpg formátumban vannak a képeid , akkor ide
        tudod feltölteni a png vagy jpeg formátumú képeket. Majd ha beküldöd a
        képeket, ez a rész konvertálja őket a megfelelő formátumban és menti
        őket egy mappába.
      </Typography>
      <Box sx={{ padding: 2, margin: 2 }}>
        <ImageUploading
          multiple
          value={images}
          onChange={OnChange}
          dataURLKey="data_url"
          acceptType={["png", "jpeg", "bmp"]}
        >
          {({ imageList, onImageUpload, onImageRemove }) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Tooltip
                  title="Kép feltöltése"
                  sx={{ margin: 1, padding: 1, alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onImageUpload}
                  >
                    <AddPohotoAlternate />
                  </Button>
                </Tooltip>
                <Tooltip
                  title="Feltöltött kép elemzése"
                  sx={{ margin: 1, padding: 1, alignItems: "center" }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleOnChange(images);
                    }}
                    disabled={imageList.length === 0}
                  >
                    <FileUploadIcon />
                  </Button>
                </Tooltip>
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
              >
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
            </Box>
          )}
        </ImageUploading>
      </Box>
    </Box>
  );
};

export default ImageAnalysis;
