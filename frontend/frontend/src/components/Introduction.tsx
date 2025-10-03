import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      width="100%"
      bgcolor="#08439cff"
      color="#f0f0e1ff"
      padding={2}
      display={"flex"}
    >
      <Typography
        variant="h2"
        textAlign={"left"}
        fontFamily="Meow Script Cursive"
        fontWeight="400"
        fontStyle="normal"
      >
        Agyi daganatok detektálása MRI képekről
      </Typography>
      <Typography></Typography>
    </Box>
  );
};

export default Introduction;
