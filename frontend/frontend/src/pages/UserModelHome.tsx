import Introduction from "../components/Introduction";
import Box from "@mui/material/Box";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UserModel from "../components/UserModel";
import UserModelIntro from "../components/UserModelIntro";

const UserModelHome = () => {
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      width="100%"
      height="max-content"
      bgcolor="#ffffffff"
    >
      <Header />
      <UserModelIntro />
      <UserModel />
    </Box>
  );
};

export default UserModelHome;
