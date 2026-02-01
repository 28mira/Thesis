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
          backgroundColor: "#7e0000ff",
          color: "#aee0ffff",
          maxHeight: 720,
          minHeight: 720,
          padding: 1,
          margin: 1,
          borderRadius: 10,
          border: "1.5px solid #7e0000ff",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            padding: 2,
            fontFamily: "Meow Script Cursive",
            fontWeight: "bold",
            fontStyle: "normal",
          }}
        >
          A kijelölő modell jellemzői:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            padding: 2,
            fontFamily: "Meow Script Cursive",
            fontWeight: "400",
            fontStyle: "normal",
            fontSize: 20,
          }}
        >
          A képeken az elváltozások kijelölését egy úgynevezett u-net modell,
          annak is egy MONAI-s verzioja segitségével van megvalósítva. A MONAI
          egy kimondottan orvosi képfeldolgozáshoz létrehozott python könyvtár,
          ami bárki számára elérhető. A tanításhoz a modellnek meg kell adni az
          eredeti képet és ennek a képnek a maszkját, amin rajt van az
          elváltozás is.
        </Typography>
        <Box
          sx={{
            backgroundColor: "#aee0ffff",
            borderRadius: 10,
          }}
        >
          {/*<RadarChart
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
                { name: "Precision", max: 0.0, min: 1.0 },
                { name: "Recall", max: 0.0, min: 1.0 },
                { name: "F1 Score", max: 1, min: 0.3 },
              ],
            }}
          />*/}
        </Box>
      </Box>
    </Box>
  );
};

export default CompareModel;
