import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Landing Page Works</div>} />
        <Route path="/login" element={<div>Login Page Works</div>} />
        <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard Page Works</div></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

