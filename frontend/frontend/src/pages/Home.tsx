import Introduction from "../components/Introduction";
import Box from "@mui/material/Box";
import ImageAnalysis from "../components/ImageAnalysis";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Model1 from "../components/Model1";

const Home = () => {
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
      <Introduction />
      <ImageAnalysis />
      <Model1 />
      <Footer />
    </Box>
  );
};

export default Home;
