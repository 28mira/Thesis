import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      width="100%"
      bgcolor="#780000"
      color="#fdf0d5"
      padding={2}
      display={"flex"}
    >
      <Typography
        variant="h2"
        textAlign={"left"}
        sx={{
          fontFamily: "Playwrite NZ Basic",
        }}
      >
        Agyi daganatok detektálása MRI képekről
      </Typography>
    </Box>
  );
};

export default Introduction;
