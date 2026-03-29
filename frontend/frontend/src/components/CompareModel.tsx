import { Box, Typography } from "@mui/material";

const CompareModel = () => {
  return (
    <Box
      sx={{
        display: { xs: "block", md: "flex" },
        flexDirection: "row",
        width: "100%",
        height: "min-content",
        paddingBottom: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          textAlign: "left",
          height: "min-content",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
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
            width="65%"
            style={{ borderRadius: 15 }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CompareModel;
