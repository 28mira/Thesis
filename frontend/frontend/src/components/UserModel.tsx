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

const storageTime = 60 * 1000 * 30;

function setLocalStorageWithExpiry(key: string, value: any) {
  const item = {
    value,
    expiry: Date.now() + storageTime,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getLocalStorageWithExpiry(key: string) {
  const item = localStorage.getItem(key);
  if (!item) return null;

  try {
    const olditem = JSON.parse(item);
    if (Date.now() > olditem.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return olditem.value;
  } catch {
    return null;
  }
}

const UserModel = () => {
  const [numberOfTypes, setNumberOfTypes] = useState<number>(() => {
    const saved = getLocalStorageWithExpiry("numberOfTypes");
    return saved ? Number(saved) : 0;
  });

  const [imagesByType, setImagesByType] = useState<any[][]>(() => {
    try {
      const saved = getLocalStorageWithExpiry("imagesByType");
      if (!saved || saved === "undefined") return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [labelNames, setLabelNames] = useState<string[]>(() => {
    try {
      const saved = getLocalStorageWithExpiry("labelNames");
      if (!saved || saved === "undefined") return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [showDetails, setShowDetails] = useState(() => {
    const saved = getLocalStorageWithExpiry("showDetails");
    if (!saved || saved === "undefined") return false;
    return imagesByType.length > 0;
  });
  const [showModel, setShowModel] = useState(() => {
    const saved = getLocalStorageWithExpiry("showModel");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    setLocalStorageWithExpiry("numberOfTypes", numberOfTypes);
  }, [numberOfTypes]);

  useEffect(() => {
    const imagesData = imagesByType.map((list) =>
      list.map((img: any) => ({ data_url: img.data_url })),
    );
    setLocalStorageWithExpiry("imagesByType", imagesData);
  }, [imagesByType]);

  useEffect(() => {
    setLocalStorageWithExpiry("labelNames", labelNames);
  }, [labelNames]);

  useEffect(() => {
    setLocalStorageWithExpiry("showDetails", showDetails);
  }, [showDetails]);

  useEffect(() => {
    setLocalStorageWithExpiry("showModel", showModel);
  }, [showModel]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const formData = new FormData();

      imagesByType.forEach((images, typeIndex) => {
        formData.append(`label_${typeIndex}`, labelNames[typeIndex]);
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
      if (resp.classes != 0) setShowModel(true);
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
          flexDirection: "column",
          display: { xs: "block", md: "flex" },
        }}
      >
        <Typography
          sx={{
            fontFamily: "Meow Script Cursive",
            fontWeight: "400",
            fontStyle: "normal",
            fontSize: 24,
          }}
        >
          Az alábbi mezőbe lehet beírni, hogy mennyi féle elváltozást szeretnél
          tanítani, ez minimum 3 és maximum 8 lehet, utána meg fog jelleni annyi
          képfeltöltési lehetőség amennyi be lett írva. Majd minden elváltozást
          külön képfeltölő részhez tölts fel, mert ha keverednek a képek akkor a
          model sem lesz pontos, ami ezek alapján a képek alapján fog tanulni.
          Ha modell megtanult, akkor meg fog jelenni egy képfeltöltő lehetőség,
          ahol ki lehet majd probálni.
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
              fontFamily: "Meow Script Cursive",
              fontWeight: "400",
              fontStyle: "normal",
              fontSize: 24,
            }}
          >
            Elváltozások száma:
          </Typography>
          <input
            type="number"
            value={numberOfTypes || ""}
            name="numtyp"
            id="numtyp"
            width={5}
            max={8}
            min={4}
            onChange={(e) => {
              const numtype = Number(e.target.value);
              if (numtype < 4 || numtype > 8) {
                alert("A típusok száma 4 és 8 között kell legyen!");
                return "A típusok száma 4 és 8 között kell legyen!";
              }
              setNumberOfTypes(numtype);
              setShowDetails(true);
              setImagesByType(Array.from({ length: numtype }, () => []));
              setLabelNames(Array.from({ length: numtype }, () => ""));
              /*setImagesByType(
                Array.from({ length: numtype }, (_, i) => imagesByType[i] || [])
              );
              setLabelNames(Array.from({ length: numtype }, (_, i) => labelNames[i] || ""));
              */
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
                        onChange={(e) => {
                          const newLabels = [...labelNames];
                          newLabels[index] = e.target.value;
                          setLabelNames(newLabels);
                        }}
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
              style={{
                borderColor: "#002360ff",
                color: "#002360ff",
                borderStyle: "solid",
                borderWidth: 1.5,
              }}
              disabled={imagesByType.every((images) => images.length === 0)}
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
