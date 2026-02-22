import Box from "@mui/material/Box";
import { MonitorHeart } from "@mui/icons-material";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "row",
        textAlign: "right",
        backgroundColor: "warning.main",
        color: "warning.contrastText",
        width: "100%",
        padding: 1,
      }}
    >
      <Typography
        sx={{
          flex: 1,
          textAlign: "left",
          marginLeft: 2,
        }}
      >
        <MonitorHeart />
      </Typography>
      <nav>
        <Button
          component={Link}
          to="/"
          sx={{
            color: "text.secondary",
            fontWeight: "bold",
            borderRadius: 10,
            fontStyle: "normal",
          }}
        >
          <Typography>Főoldal</Typography>
        </Button>
        <Button
          component={Link}
          to="/UserModel"
          sx={{
            color: "text.secondary",
            fontWeight: "bold",
            borderRadius: 10,
            fontStyle: "normal",
          }}
        >
          <Typography>Felhasználói modell</Typography>
        </Button>
      </nav>
    </Box>
  );
};

export default Header;
