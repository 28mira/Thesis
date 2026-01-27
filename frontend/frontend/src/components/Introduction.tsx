import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      width="100%"
      bgcolor="#002360ff"
      color="#aee0ffff"
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
    </Box>
  );
};

export default Introduction;
