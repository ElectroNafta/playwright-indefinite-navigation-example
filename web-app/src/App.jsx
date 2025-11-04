import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Calendar from "./pages/Calendar";
import Mail from "./pages/Mail";
import Account from "./pages/Account";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/calendar/*" element={<Calendar />} />
        <Route path="/mail/*" element={<Mail />} />
        <Route path="/account/*" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
