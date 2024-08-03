import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScatterPlot from "../children/ScatterPlot";
import RadarChart from "../children/RadarChart";
import { motion } from "framer-motion";
import {
  Select,
  Box,
  Heading,
  Button,
  Flex,
  Spinner,
  Text,
  VStack,
  SimpleGrid,
  useBreakpointValue,
  useMediaQuery,
} from "@chakra-ui/react";
import "../css/Components.css";

const AudioFeatures = () => {
  const [tracks, setTracks] = useState([]);
  const [timeRange, setTimeRange] = useState("medium_term");
  const [loading, setLoading] = useState(true);
  const columns = useBreakpointValue({ base: 1, md: 2 });
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const navigate = useNavigate(); // Use the useNavigate hook from React Router v6

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("spotify_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      let fetchedTracks = [];
      let offset = 0;
      const limit = 50;

      while (fetchedTracks.length < 100) {
        // Adjust the loop to fetch 100 tracks
        const tracksResponse = await fetch(
          `http://127.0.0.1:8000/api/top-tracks/?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
          { headers }
        );
        const tracksData = await tracksResponse.json();

        fetchedTracks = fetchedTracks.concat(tracksData.items);
        offset += limit;

        if (tracksData.items.length < limit) break;
      }

      const trackIds = fetchedTracks.map((track) => track.id).join(",");

      const audioFeaturesResponse = await fetch(
        `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
        { headers }
      );
      const audioFeaturesData = await audioFeaturesResponse.json();

      const tracksWithAudioFeatures = fetchedTracks.map((track) => {
        const audioFeatures = audioFeaturesData.audio_features.find(
          (feature) => feature.id === track.id
        );
        return { ...track, audio_features: audioFeatures };
      });

      setTracks(tracksWithAudioFeatures);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <Flex
        className="animated-background"
        minHeight="100vh"
        width="100vw"
        alignItems="center"
        justifyContent="center"
        color="white"
        p={6}
      >
        <VStack
          spacing={6}
          p={6}
          boxShadow="lg"
          bg="white"
          rounded="md"
          color="black"
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold">
            Loading...
          </Text>
          <Spinner size="xl" color="green.500" />
        </VStack>
      </Flex>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animated-background"
    >
      <Heading as="h2" size="lg" mb={4} className="heading" paddingTop={"10px"}>
        Top Tracks Audio Features
      </Heading>
      <Text fontSize="md" className="heading" mb={4}>
        Visualize the audio features of your top tracks! Hover or tap on the
        radar chart to see detailed information about each track. Hover or tap
        on each data point in the scatter plot to find out which track it
        represents.
      </Text>
      <Box textAlign="center" mb={4}>
        <Button
          colorScheme="red"
          className="button"
          onClick={() => navigate("/main")}
        >
          Back to Home
        </Button>
      </Box>
      <Box
        className="chart-container"
        textAlign={"left"}
        width={isMobile ? "100%" : "65%"}
        margin="auto"
        mt={4}
      >
        <Heading as="h4" size="md" mb={2} textAlign={"center"}>
          Chart Explanations
        </Heading>
        <Text fontSize="sm" mb={2}>
          <strong>Audio Features Scatter Plot:</strong> This scatter plot
          visualizes the audio features of your top tracks. Each point
          represents a track, plotted based on its energy and danceability.
          Hover or tap on a point to see more details about the track.
        </Text>
        <Text fontSize="sm" mb={2}>
          <strong>Audio Features Radar Chart:</strong> This radar chart displays
          the audio features of selected tracks. The chart shows danceability,
          energy, tempo, and valence of each track. Hover or tap on the chart to
          see detailed information about each track.
        </Text>
        <Text fontSize="sm" mb={2}>
          These charts are created using D3.js.
        </Text>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        padding={2}
      >
        <SimpleGrid
          columns={columns}
          spacing={4}
          width={isMobile ? "100%" : "65%"}
          padding={2}
        >
          <Box className="chart-container" style={{ flex: 1, padding: "10px" }}>
            <Heading as="h3" size="md" mb={4}>
              Audio Features Scatter Plot
            </Heading>
            <ScatterPlot
              tracks={tracks}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          </Box>
          <Box className="chart-container" style={{ flex: 1, padding: "10px" }}>
            <Heading as="h3" size="md" mb={4}>
              Audio Features Radar Chart
            </Heading>
            <RadarChart tracks={tracks} />
          </Box>
        </SimpleGrid>
        <Box className="chart-container" textAlign={"left"}>
          <Heading as="h4" size="md" mb={2} textAlign={"center"}>
            Audio Features Explanation
          </Heading>
          <Text fontSize="sm" mb={2}>
            <strong>Danceability:</strong> Describes how suitable a track is for
            dancing based on a combination of musical elements including tempo,
            rhythm stability, beat strength, and overall regularity. A value of
            0.0 is least danceable and 1.0 is most danceable.
          </Text>
          <Text fontSize="sm" mb={2}>
            <strong>Energy:</strong> A measure from 0.0 to 1.0 and represents a
            perceptual measure of intensity and activity. Typically, energetic
            tracks feel fast, loud, and noisy.
          </Text>
          <Text fontSize="sm" mb={2}>
            <strong>Tempo:</strong> The overall estimated tempo of a track in
            beats per minute (BPM). In musical terminology, tempo is the speed
            or pace of a given piece.
          </Text>
          <Text fontSize="sm" mb={2}>
            <strong>Valence:</strong> A measure from 0.0 to 1.0 describing the
            musical positiveness conveyed by a track. Tracks with high valence
            sound more positive (e.g. happy, cheerful, euphoric), while tracks
            with low valence sound more negative (e.g. sad, depressed, angry).
          </Text>
        </Box>
      </Box>
    </motion.div>
  );
};
export default AudioFeatures;
