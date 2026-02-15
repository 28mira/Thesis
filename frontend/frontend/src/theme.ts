import { createTheme } from '@mui/material/styles';
const theme = createTheme({
  palette: {
    primary: {
      main: '#780000',
      contrastText: '#fdf0d5',
    },
    secondary: {
      main: '#003049',
      contrastText: '#fdf0d5',
    },  
    text: {
      primary: '#003049',
      secondary: '#fdf0d5',
    },
  },
  typography: {
    fontFamily: "Meow Script Cursive",
  },
});