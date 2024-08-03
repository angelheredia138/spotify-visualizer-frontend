import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SpotifyLogin from "./components/SpotifyLogin";
import Callback from "./components/Callback";
import MainPage from "./components/MainPage";
import TopGenresAndArtists from "./components/parents/TopGenresandArtists";
import AudioFeatures from "./components/parents/AudioFeatures";
import ListeningHistory from "./components/parents/ListeningHistory";
import Genres from "./components/parents/Genres";
import Playlists from "./components/parents/Playlists";
import Wrapped from "./components/parents/Wrapped";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SpotifyLogin />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/top-genres-artists" element={<TopGenresAndArtists />} />
          <Route path="/audio-features" element={<AudioFeatures />} />
          <Route path="/listening-history" element={<ListeningHistory />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/wrapped" element={<Wrapped />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
