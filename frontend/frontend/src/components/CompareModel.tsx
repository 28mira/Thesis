import { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { RadarChart } from "@mui/x-charts";
import { Padding } from "@mui/icons-material";

const CompareModel = () => {
  const [modelData, setModelData] = useState({
    accuracy: null,
    loss: null,
    val_loss: null,
    precision: null,
    recall: null,
    f1_score: null,
    confusion_matrix: null,
  });

  useEffect(() => {
    fetch("http://localhost:5000/model1/summary")
      .then((response) => response.json())
      .then((data) => {
        setModelData({
          accuracy: data.accuracy,
          loss: data.loss,
          val_loss: data.val_loss,
          precision: data.precision,
          recall: data.recall,
          f1_score: data.f1_score,
          confusion_matrix: data.confusion_matrix,
        });
      })
      .catch((error) => console.error("Error fetching message:", error));
  }, []);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "flex" },
        flexDirection: "row",
        width: "100%",
        paddingBottom: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          textAlign: "left",
          height: "min-content",
          backgroundColor: "info.main",
          color: "info.contrastText",
          maxHeight: 750,
          minHeight: 750,
          padding: 1,
          margin: 1,
          borderRadius: 10,
          border: "1.5px solid #003049",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            padding: 1,
          }}
        >
          A kijelölő modell jellemzői:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            padding: 2,
          }}
        >
          Az elváltozások kijelölését a képeken egy U-Net típusú modell végzi,
          amelynek MONAI-alapú megvalósítását használtam. A MONAI egy
          kifejezetten orvosi képfeldolgozásra fejlesztett, nyílt forráskódú
          Python könyvtár, amely bárki számára szabadon elérhető. A tanítás
          során a modell bemeneteként az eredeti kép, valamint a hozzá tartozó
          maszk szolgál, amely pontosan jelöli az elváltozás helyét. Ezek
          alapján a hálózat megtanulja az elváltozások felismerését és
          elkülönítését a képeken.
        </Typography>
        <Box
          sx={{
            textAlign: "center",
            padding: 2,
            margin: 2,
          }}
        >
          <img
            src="/web_img.png"
            alt="A modell és az eredeti elváltozás"
            style={{ borderRadius: 15 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CompareModel;
