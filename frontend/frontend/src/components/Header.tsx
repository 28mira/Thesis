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
        backgroundColor: "primary.main",
        color: "",
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
          style={{
            color: "#text.secondary",
            fontWeight: "bold",
            borderRadius: 10,
            fontStyle: "normal",
            fontSize: 16,
          }}
        >
          Főoldal
        </Button>
        <Button
          component={Link}
          to="/UserModel"
          style={{
            color: "#primary.contrastText",
            fontWeight: "bold",
            borderRadius: 10,
            fontStyle: "normal",
            fontSize: 16,
          }}
        >
          Felhasználói modell
        </Button>
      </nav>
    </Box>
  );
};

export default Header;
