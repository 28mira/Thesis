import { useState, useEffect } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { RadarChart } from "@mui/x-charts";

const CompareModel = () => {
  const stripeColor = (index: number) => {
    return "#7e0000ff";
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
      textAlign="center"
      height="min-content"
      bgcolor="#7e0000ff"
      padding={2}
      margin={1}
      borderRadius={10}
      maxHeight={700}
      minHeight={700}
      border="1.5px solid #7e0000ff"
      color={"#aee0ffff"}
    >
      <Box>
        <Typography variant="h4" sx={{ padding: 2 }}>
          A kijelölő modell jellemzői:
        </Typography>
        <Typography variant="body1" sx={{ padding: 2 }}>
          Az alábbi grafikon a modell különböző metrikáit mutatja be. Minél
          közelebb vannak az értékek a külső körhöz, annál jobb a modell
          teljesítménye az adott metrikában.
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: "#aee0ffff",
          borderRadius: 10,
        }}
      >
        <RadarChart
          disableAxisListener={true}
          stripeColor={stripeColor}
          loading={false}
          highlight="axis"
          height={300}
          width={300}
          colors={["#002360ff"]}
          shape="circular"
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
  );
};

export default CompareModel;
