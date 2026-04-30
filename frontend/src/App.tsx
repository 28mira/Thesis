import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import UserModelHome from "./pages/UserModelHome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/UserModel" element={<UserModelHome />}></Route>
    </Routes>
  );
}

export default App;
