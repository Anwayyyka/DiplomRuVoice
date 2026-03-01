import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Charts from './pages/Charts';
import Favorites from './pages/Favorites';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Moderation from './pages/Moderation';
import Artist from './pages/Artist';
import TrackPage from './pages/TrackPage';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeArtist from './pages/BecomeArtist';
import MyRequests from './pages/MyRequests';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/moderation" element={<Moderation />} />
              <Route path="/artist" element={<Artist />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/become-artist" element={<BecomeArtist />} />
              <Route path="/upload-track" element={<Navigate to="/upload" replace />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </Layout>
          <Toaster />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;