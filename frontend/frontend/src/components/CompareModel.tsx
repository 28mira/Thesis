import { useState, useEffect } from "react";
import { Box, Paper, Stack } from "@mui/material";
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
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      width="75%"
      height="min-content"
      bgcolor="#9cccf2ff"
      padding={2}
      marginTop={3}
      borderRadius={10}
    >
      
      <h3>Brain Trust Classification Model</h3>
      <p>This is the introduction component.</p>
      <RadarChart
        height={300}
        //width={300}
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
