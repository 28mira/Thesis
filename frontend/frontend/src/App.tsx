import { useState, useEffect } from "react";
import Introduction from "./components/Introduction";
import Box from "@mui/material/Box";
import ImageAnalysis from "./components/ImageAnalysis";
import ImageConverter from "./components/ImageConverter";
import UserModel from "./components/UserModel";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CompareModel from "./components/CompareModel";

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
      <CompareModel />
      <ImageConverter />
      <UserModel />
      <Footer />
    </Box>
    //<div>{message}</div>
  );
}

export default App;
