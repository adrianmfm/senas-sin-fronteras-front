// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DoctorPage } from "./pages/DoctorPage";
import { PatientPage } from "./pages/PatientPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/doctor" element={<DoctorPage />} />
        <Route path="/patient" element={<PatientPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
