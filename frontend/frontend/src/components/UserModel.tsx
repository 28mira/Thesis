import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import AnalysisUserModel from "../components/AnalysisUserModel";
import ImageUploading from "react-images-uploading";
import AddPohotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import { HideImage } from "@mui/icons-material";
import { Typography } from "@mui/material";

const UserModel = () => {
  const [numberOfTypes, setNumberOfTypes] = useState<number>(0);
  const [imagesByType, setImagesByType] = useState<any[][]>([]);
  const [labelNames, setLabelNames] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showModel, setShowModel] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      imagesByType.forEach((images, typeIndex) => {
        formData.append(`label_${typeIndex}`, labelNames[typeIndex]);
        images.forEach((image) => {
          if (image.file) formData.append(`type_${typeIndex}`, image.file);
          else console.warn(`Hiányzó fájl a ${typeIndex}. típusnál`);
        });
      });
      formData.append("numtypes", numberOfTypes.toString());

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/userModel`,
        {
          method: "POST",
          body: formData,
        },
      );

      const resp = await response.json();
      if (resp.num_classes > 1) {
        setShowModel(true);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/loadUserData`,
      );
      const data = await response.json();
      const labels = data.data.map((item: any) => item.label);

      const images = data.data.map((item: any) =>
        item.images.map((url: string) => ({
          data_url: url,
        })),
      );
      if (labels.length < 4) {
        setShowDetails(false);
      } else {
        setShowDetails(true);
      }

      setImagesByType(images);
      setLabelNames(labels);
      setNumberOfTypes(labels.length);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function checkModel() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkUserModel`,
      );
      const data = await response.json();
      if (data.model_loaded) {
        setShowModel(true);
      } else {
        setShowModel(false);
      }
    }
    checkModel();
  });

  const saveChange = async (
    index: number,
    images: any[],
    label: string,
    numTypes: number,
  ) => {
    const formData = new FormData();
    formData.append("type_index", index.toString());
    formData.append("label", label);
    formData.append("numtypes", numTypes.toString());
    images.forEach((image) => {
      if (image.file) formData.append(`images`, image.file);
      else console.warn(`Hiányzó fájl a tesztelésnél`);
    });

    await fetch(`${import.meta.env.VITE_API_URL}/api/saveChanges`, {
      method: "POST",
      body: formData,
    });
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
          flexDirection: "column",
          display: { xs: "block", md: "flex" },
        }}
      >
        <Typography sx={{}}>
          Az alábbi mezőben add meg, hány különböző elváltozást szeretnél a
          modellnek megtanítani. A megadható érték{" "}
          <strong>minimum 4, maximum 8</strong>. A szám megadása után
          automatikusan megjelenik ugyanennyi képfeltöltési lehetőség. Fontos,
          hogy minden elváltozáshoz külön tölts fel képeket, és ne keverd őket,
          mert ez rontaná a modell pontosságát. Miután a tanítás befejeződött,
          megjelenik egy új képfeltöltő mező, ahol kipróbálhatod a betanított
          modellt.
        </Typography>
        <Box
          sx={{
            padding: 2,
            margin: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              marginRight: 2,
            }}
          >
            Elváltozások száma:
          </Typography>
          <input
            type="number"
            value={numberOfTypes || ""}
            name="numtyp"
            id="numtyp"
            max={8}
            min={4}
            onChange={(e) => {
              const numtype = Number(e.target.value);
              if (numtype < 4 || numtype > 8) {
                alert("A típusok száma 4 és 8 között kell legyen!");
                return;
              }
              setNumberOfTypes(numtype);
              setImagesByType(Array.from({ length: numtype }, () => []));
              setLabelNames(Array.from({ length: numtype }, () => ""));
              if (numtype >= 4 && numtype <= 8) setShowDetails(true);
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
                margin: 1,
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
                      saveChange(
                        index,
                        imageList,
                        labelNames[index] ?? "",
                        numberOfTypes,
                      );
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
                      <input
                        type="text"
                        value={labelNames[index] ?? ""}
                        placeholder={`Elváltozás neve`}
                        onChange={(e) => {
                          const newLabels = [...labelNames];
                          newLabels[index] = e.target.value;
                          setLabelNames(newLabels);
                        }}
                        onBlur={() =>
                          saveChange(
                            index,
                            imagesByType[index],
                            labelNames[index] ?? "",
                            numberOfTypes,
                          )
                        }
                        style={{
                          marginLeft: 10,
                          height: 34,
                          borderRadius: 6,
                          paddingLeft: 8,
                        }}
                      />
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
              sx={{
                borderColor: "secondary.main",
                color: "secondary.contrastText",
                backgroundColor: "secondary.main",
                borderStyle: "solid",
                borderWidth: 1.5,
              }}
              disabled={imagesByType.some((images) => images.length === 0)}
            >
              Tanítás
            </Button>
          </form>
        </Box>
      )}
      {!showDetails && <Box sx={{ marginBottom: 40 }}></Box>}
      {showModel && <AnalysisUserModel />}
      <Footer />
    </>
  );
};

export default UserModel;
