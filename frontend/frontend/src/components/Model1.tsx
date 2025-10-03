import { useState, useEffect } from "react";
import { Typography, Stack, Box } from "@mui/material";
import { RadarChart } from "@mui/x-charts/RadarChart";

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
    /*<Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      width="75%"
      height="min-content"
      bgcolor="#ffffffff"
      color="#002360ff"
      padding={2}
      marginTop={3}
      borderRadius={10}
      display="flex"
    >*/
    <Box
      flexDirection="row"
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
      <Typography variant="body1">
        A képfeldolgozást egy úgynevezett CNN (Convolutional Neural Network)
        kettő mélységű hálóval készítettem el. Mivel ez könnyen tanítható kisebb
        adatmennyiségeken és a futási ideje sem nagyon hosszú. Azért nem
        használtam egy nagyobb,komplexebb modellt mert így is voltak problémák a
        túltanulással, mivel nem áll rendelkezésemre sok adat. Még érdemes tudni
        a modellről, hogy a képeket 256x256-os méretben 1 csatornán dolgozza
        fel, ez azt jelenti hogy fekete fehérek a képek, és 3 fajta elváltozásra
        tudja szétbontani a képeket.
      </Typography>
      <RadarChart
        height={300}
        width={300}
        colors={["#c42020ff"]}
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
  );
};

export default CompareModel;
