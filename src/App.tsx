import { Navigate, Route, Routes } from "react-router-dom";

import { ConnectPage } from "@/pages/connect-page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ConnectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
