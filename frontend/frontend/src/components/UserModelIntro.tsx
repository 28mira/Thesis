import Box from "@mui/material/Box";
import { Paper, Typography } from "@mui/material";

const Introduction = () => {
  return (
    <Box
      flexDirection={"row"}
      textAlign="left"
      width="100%"
      bgcolor="#002360ff"
      color="#aee0ffff"
      padding={2}
      display={"flex"}
      marginBottom={2}
    >
      <Typography
        variant="h2"
        fontFamily="Meow Script Cursive"
        fontWeight="400"
        fontStyle="normal"
      >
        A felhasználói modell tanítása
      </Typography>
    </Box>
  );
};

export default Introduction;
