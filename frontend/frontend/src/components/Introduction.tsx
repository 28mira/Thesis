import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      width="100%"
      bgcolor="warning.main"
      color="warning.contrastText"
      padding={2}
      display={"flex"}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        Agyi daganatok detektálása MRI képekről
      </Typography>
    </Box>
  );
};

export default Introduction;
