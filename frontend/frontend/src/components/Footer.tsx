import Box from "@mui/material/Box";
import { Mail } from "@mui/icons-material";
import { Call } from "@mui/icons-material";
import { Typography } from "@mui/material";
const Header = () => {
  return (
    <Box
      sx={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        bgcolor: "#002060ff",
        color: "#aee0ffff",
        padding: 2,
        marginTop: 3,
      }}
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
