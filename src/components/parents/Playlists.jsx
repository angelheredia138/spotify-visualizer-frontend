import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import NetworkGraph from "../children/NetworkGraph";
import "../css/Components.css";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const columns = useBreakpointValue({ base: 1, md: 1 });
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("spotify_access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await fetch(`http://127.0.0.1:8000/api/playlists/`, {
        headers,
      });
      const data = await response.json();

      setPlaylists(data.playlists || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        Playlists
      </Heading>
      <Text fontSize="md" className="heading" mb={4}>
        Explore your created and followed playlists using network graphs showing
        relationships between playlists, tracks, and artists.
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
          <strong>Network Graph:</strong> This graph visualizes the
          relationships between your playlists, tracks, and artists. Each node
          represents a playlist, track, or artist, and the edges show their
          connections. Hover or tap on a node to see more details.
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
        <Box
          className="chart-container"
          style={{
            flex: 1,
            padding: "10px",
            width: isMobile ? "100%" : "30%",
          }}
        >
          <Heading as="h3" size="md" mb={4}>
            Playlists Network Graph
          </Heading>
          <NetworkGraph playlists={playlists} isMobile={isMobile} />
        </Box>
      </Box>
    </motion.div>
  );
};

export default Playlists;
