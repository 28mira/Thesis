import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      textAlign="left"
      width="100%"
      bgcolor="warning.main"
      color="warning.contrastText"
      padding={2}
      display={"flex"}
      marginBottom={2}
    >
      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
        A felhasználói modell tanítása
      </Typography>
    </Box>
  );
};

export default Introduction;
