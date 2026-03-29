import { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { RadarChart } from "@mui/x-charts/RadarChart";
import CompareModel from "./CompareModel";

const Model1 = () => {
  const stripeColor = () => {
    return "#003049";
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
    fetch(`${import.meta.env.VITE_API_URL}/model1/summary`)
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
        height: "min-content",
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
          A modellről:
        </Typography>
        <Typography
          variant="body1"
          style={{
            padding: 2,
            marginLeft: 12,
          }}
        >
          A képfeldolgozást egy konvolúciós neurális hálózattal (CNN –
          Convolutional Neural Network) valósítottam meg, mivel ez a megoldás
          kisebb adatmennyiségek esetén is jól tanítható, és a futási ideje sem
          túl hosszú. A tanítás során azonban túltanulási problémák is
          jelentkeztek, ami annak tudható be, hogy nem állt rendelkezésre
          elegendő mennyiségű adat. A modell a bemeneti képeket 256×256 pixeles
          méretben, egyetlen csatornán dolgozza fel, vagyis szürkeárnyalatos
          képekkel működik. Az így feldolgozott képeket hat különböző
          elváltozási kategóriába képes besorolni.
        </Typography>
        <Box sx={{ padding: 2 }}>
          <RadarChart
            stripeColor={stripeColor}
            height={300}
            width={300}
            colors={["#d62828"]}
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
