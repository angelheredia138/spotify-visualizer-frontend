import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { motion } from "framer-motion";
import { Element, scroller } from "react-scroll";
import TopSummary from "../children/TopSummary";
import TopArtists from "../children/TopArtists";
import Summary from "../children/Summary";
import "../css/Components.css";

const Wrapped = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [scrollLocked, setScrollLocked] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("spotify_access_token");
      const response = await fetch("http://127.0.0.1:8000/api/wrapped/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const wrappedData = await response.json();
      setData(wrappedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scrollToNext = (id) => {
    unlockScroll();
    scroller.scrollTo(id, {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  const lockScroll = () => {
    document.body.style.overflow = "hidden";
    setScrollLocked(true);
  };

  const unlockScroll = () => {
    document.body.style.overflow = "auto";
    setScrollLocked(false);
  };

  const handleButtonClick = (id) => {
    unlockScroll();
    scrollToNext(id);
  };

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
    <div className="animated-background">
      <Heading
        as={motion.h2}
        size="lg"
        mb={4}
        className="heading"
        paddingTop={"10px"}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Classic Spotify Wrapped
      </Heading>
      <Box textAlign="center" mb={4}>
        <Button
          colorScheme="red"
          className="button"
          onClick={() => navigate("/main")}
          as={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Back to Home
        </Button>
      </Box>
      <Element
        name="section1"
        className="element"
        style={{ padding: "2rem 0" }}
      >
        <Box
          className="chart-container"
          height="80vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          width={isMobile ? "90%" : "50%"}
          margin="auto"
        >
          <TopSummary
            topArtist={data.top_artist}
            topSong={data.top_track}
            topGenre={data.top_genre}
            scrollToNext={scrollToNext}
            lockScroll={lockScroll}
            unlockScroll={unlockScroll}
          />
          <Button
            onClick={() => handleButtonClick("section2")}
            mt={4}
            disabled={scrollLocked}
          >
            Next
          </Button>
        </Box>
      </Element>
      <Element
        name="section2"
        className="element"
        style={{ padding: "2rem 0" }}
      >
        <Box
          className="chart-container"
          height="80vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          width={isMobile ? "90%" : "50%"}
          margin="auto"
        >
          <TopArtists artists={data.top_artists || []} />
          <Button
            onClick={() => handleButtonClick("section3")}
            mt={4}
            disabled={scrollLocked}
          >
            Next
          </Button>
        </Box>
      </Element>
      <Element
        name="section3"
        className="element"
        style={{ padding: "2rem 0" }}
      >
        <Box
          className="chart-container"
          height="80vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          width={isMobile ? "90%" : "50%"}
          margin="auto"
        >
          <Summary
            listeningTime={data.listening_time}
            uniqueGenres={data.unique_genres}
            uniqueArtists={data.unique_artists}
            trends={data.trends}
            scrollToNext={scrollToNext}
            lockScroll={lockScroll}
            unlockScroll={unlockScroll}
          />
          <Button
            onClick={() => handleButtonClick("section4")}
            mt={4}
            disabled={scrollLocked}
          >
            Next
          </Button>
        </Box>
      </Element>
      <Element
        name="section4"
        className="element"
        style={{ padding: "2rem 0" }}
      >
        <Box
          className="chart-container"
          height="80vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          width={isMobile ? "90%" : "50%"}
          margin="auto"
        >
          <Heading as="h3" size="md" mb={4} textAlign="center">
            Thank You for Viewing!
          </Heading>
          <Text textAlign="center">
            We hope you enjoyed your Wrapped experience.
          </Text>
          <Box mt={6} textAlign="center">
            <Heading as="h3" size="lg" mb={4} textAlign="center">
              A Special Thank You!
            </Heading>
            <Text fontSize="lg" textAlign="center">
              Your journey through this Wrapped experience means the world to
              me. This project has been a labor of love and seeing you reach
              this point is incredibly rewarding. I hope these insights bring a
              smile to your face and a song to your heart. Thank you.
            </Text>
          </Box>
          <Button
            onClick={() => navigate("/main")}
            mt={8}
            colorScheme="blue"
            size="lg"
          >
            Back to Home
          </Button>
        </Box>
      </Element>
    </div>
  );
};

export default Wrapped;
