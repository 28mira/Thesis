import { createTheme } from '@mui/material/styles';
import font from "./assets/fonts/PlaywriteNZBasic-VariableFont_wght.ttf";
import "@mui/material/styles"

const theme = createTheme({
  palette: {
    primary: {
      main: '#669bbc',
      contrastText: '#003049',
    },
    secondary: {
      main: '#003049',
      contrastText: '#fdf0d5',
    }, 
    error: {
      main: '#d62828',
      contrastText: '#fdf0d5',
    },
    warning: {
      main: '#780000',
      contrastText: '#fdf0d5',
    },
    info:{
        main: '#fdf0d5',
        contrastText: '#003049',
    },
    text: {
      primary: '#003049',
      secondary: '#fdf0d5',
    },
    
  },
  typography: {
    fontFamily: font,
    fontSize: 16,
    fontWeightLight: 300,
  },  
});

export default theme;