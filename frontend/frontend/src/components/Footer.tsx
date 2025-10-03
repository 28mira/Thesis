import Box from "@mui/material/Box";
import { Mail } from "@mui/icons-material";
import { Call } from "@mui/icons-material";
import { Typography } from "@mui/material";
const Header = () => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      width="100%"
      bgcolor="#08439cff"
      color="#f0f0e1ff"
      marginTop={3}
    >
      <Typography>
        <Mail /> martonmira02@gmail.com
      </Typography>
      <Typography>
        <Call /> +36 30 123 4567
      </Typography>
    </Box>
  );
};

export default Header;
