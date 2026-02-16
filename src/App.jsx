import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';
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

function App() {
  return (
    <ThemeProvider>
      <Router>
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
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;