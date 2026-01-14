import { useState, useEffect } from "react";
import { Typography, Stack, Box } from "@mui/material";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { useTheme } from "@mui/material/styles";
import CompareModel from "./CompareModel";

const Model1 = () => {
  const stripeColor = (index: number) => {
    return "#002360ff";
  };

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
        width: "75%",
        paddingBottom: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          textAlign: "left",
          height: "min-content",
          backgroundColor: "#aee0ffff",
          color: "#002360ff",
          maxHeight: 700,
          minHeight: 700,
          padding: 1,
          margin: 1,
          borderRadius: 10,
          border: "1.5px solid #002360ff",
        }}
      >
        <Typography variant="h4" sx={{ padding: 2 }}>
          A modellről:
        </Typography>
        <Typography variant="body1">
          A képfeldolgozást egy úgynevezett CNN (Convolutional Neural Network)
          kettő mélységű hálóval készítettem el. Mivel ez könnyen tanítható
          kisebb adatmennyiségeken és a futási ideje sem nagyon hosszú. Azért
          nem használtam egy nagyobb,komplexebb modellt mert így is voltak
          problémák a túltanulással, mivel nem áll rendelkezésemre sok adat. Még
          érdemes tudni a modellről, hogy a képeket 256x256-os méretben 1
          csatornán dolgozza fel, ez azt jelenti hogy fekete fehérek a képek, és
          3 fajta elváltozásra tudja szétbontani a képeket.
        </Typography>
        <Box sx={{ padding: 2 }}>
          <RadarChart
            stripeColor={stripeColor}
            height={300}
            width={300}
            colors={["#7e0000ff"]}
            series={[
              {
                label: "Ditaiails",
                data: [
                  Number(modelData.accuracy),
                  Number(modelData.loss),
                  Number(modelData.val_loss),
                  Number(modelData.precision),
                  Number(modelData.recall),
                  Number(modelData.f1_score),
                ],
              },
            ]}
            radar={{
              metrics: [
                { name: "Accuracy", max: 1, min: 0.3 },
                { name: "Avg Loss", max: 0.0, min: 1.0 },
                { name: "Avg Val Loss", max: 0.0, min: 1.0 },
                { name: "Precision", max: 1, min: 0.3 },
                { name: "Recall", max: 1, min: 0.3 },
                { name: "F1 Score", max: 1, min: 0.3 },
              ],
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
        }}
      >
        <CompareModel />
      </Box>
    </Box>
  );
};

export default Model1;
