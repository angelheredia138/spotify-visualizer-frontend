import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TimelineChart from "../children/TimelineChart";
import { motion } from "framer-motion";
import {
  Box,
  Heading,
  Button,
  Flex,
  Spinner,
  Text,
  VStack,
  useBreakpointValue,
  useMediaQuery,
} from "@chakra-ui/react";
import "../css/Components.css";

const ListeningHistory = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const columns = useBreakpointValue({ base: 1, md: 1 });
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const navigate = useNavigate();

  const fetchRecentlyPlayed = async () => {
    try {
      const token = localStorage.getItem("spotify_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await fetch(
        `http://127.0.0.1:8000/api/recently-played/`,
        { headers }
      );
      const text = await response.text();
      const data = JSON.parse(text);
      setTracks(data.items || []);
    } catch (error) {
      console.error("Error fetching recently played tracks:", error);
      setTracks([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await fetchRecentlyPlayed();
    setLoading(false);
  };

  const updateData = async () => {
    setUpdating(true);
    await fetchRecentlyPlayed();
    setTimeout(() => {
      setUpdating(false);
    }, 1000); // Delay to ensure the "Updating..." text is displayed
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(updateData, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

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
        Listening History
      </Heading>
      <Text fontSize="md" className="heading" mb={4}>
        Explore your recently played tracks displayed on a clock timeline,
        showcasing your listening patterns and the most recent track played.
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
          Chart Explanation
        </Heading>
        <Text fontSize="sm" mb={2}>
          <strong>Recently Played Timeline:</strong> This chart displays your
          recently played tracks on a clock timeline, allowing you to see your
          listening patterns and identify the most recent track played. Each dot
          on the timeline represents a track, and the position of the dot
          corresponds to the time you listened to the track.
        </Text>
        <Text fontSize="sm" mb={2}>
          This chart is created using D3.js.
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
        <Box
          className="chart-container"
          style={{
            flex: 1,
            padding: "10px",
            width: isMobile ? "100%" : "30%",
          }}
        >
          <Heading as="h3" size="md" mb={4}>
            Recently Played Timeline
          </Heading>
          <TimelineChart tracks={tracks} updating={updating} />
        </Box>
      </Box>
    </motion.div>
  );
};
export default ListeningHistory;
