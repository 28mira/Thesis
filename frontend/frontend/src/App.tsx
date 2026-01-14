import { useState, useEffect } from "react";
import Introduction from "./components/Introduction";
import Box from "@mui/material/Box";
import ImageAnalysis from "./components/ImageAnalysis";
import UserModel from "./components/UserModel";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Model1 from "./components/Model1";

function App() {
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
      //color="#002360ff"
    >
      <Header />
      <Introduction />
      <ImageAnalysis />
      <Model1 />
      <UserModel />
      <Footer />
    </Box>
    //<div>{message}</div>
  );
}

export default App;
