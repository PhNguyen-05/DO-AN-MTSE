
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './components/context/auth.context';

// Layout
import Header from './components/layout/header';
import Footer from './components/layout/footer';

// Pages
import Home from './pages/home';
import Register from './pages/register';
import VerifyOTP from './pages/verifyOTP';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-grow-1">
            <Routes>
              {/* Trang chủ */}
              <Route path="/" element={<Home />} />

              {/* Authentication */}
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              

              {/* Protected Routes (sau này) */}
              <Route path="/dashboard" element={
                <h1 className="text-center mt-5">Dashboard Page</h1>
              } />

              {/* 404 Page */}
              <Route path="*" element={
                <div className="text-center mt-5 py-5">
                  <h2>404 - Trang không tồn tại</h2>
                  <a href="/" className="btn btn-primary mt-3">
                    Quay về trang chủ
                  </a>
                </div>
              } />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;