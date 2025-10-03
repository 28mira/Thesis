import Box from "@mui/material/Box";
import { MonitorHeart } from "@mui/icons-material";
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
    >
      <Typography sx={{ textAlign: "left",  marginLeft: 2 }}>
        <MonitorHeart />
      </Typography>
    </Box>
  );
};

export default Header;
