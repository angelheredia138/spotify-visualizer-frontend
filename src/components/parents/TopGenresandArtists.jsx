import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MostPlayedGenres from "../children/MostPlayedGenres";
import ArtistLeaderboard from "../children/ArtistLeaderboard";
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

const TopGenresandArtists = () => {
  const [topGenres, setTopGenres] = useState([]);
  const [leastGenres, setLeastGenres] = useState([]);
  const [randomLeastGenre, setRandomLeastGenre] = useState(null);
  const [artists, setArtists] = useState([]);
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

      // Fetch genres data
      const genresResponse = await fetch(
        `http://127.0.0.1:8000/api/top-genres/?time_range=${timeRange}`,
        { headers }
      );
      const genresData = await genresResponse.json();

      // Fetch artists data
      const artistsResponse = await fetch(
        `http://127.0.0.1:8000/api/top-artists/?time_range=${timeRange}`,
        { headers }
      );
      const artistsData = await artistsResponse.json();

      // Create a map to collect artists for each genre
      const genreArtistsMap = new Map();

      // Iterate through artists and populate the map
      artistsData.items.forEach((artist) => {
        artist.genres.forEach((genre) => {
          if (!genreArtistsMap.has(genre)) {
            genreArtistsMap.set(genre, []);
          }
          genreArtistsMap.get(genre).push(artist.name);
        });
      });

      // Enrich genres data with artists, including those listed in the genres data
      const enrichedGenres = genresData.top_genres.map((genre) => {
        const genreArtists = genreArtistsMap.get(genre.genre) || [];
        const additionalArtists = genre.artists || [];

        // Combine both sets of artists
        const allArtists = [
          ...new Set([...genreArtists, ...additionalArtists]),
        ];

        genre.description = allArtists.length
          ? `Artists: ${allArtists.join(", ")}`
          : "No artists available";

        return genre;
      });

      setTopGenres(enrichedGenres);
      setLeastGenres(genresData.least_genres || []);
      setArtists(artistsData.items || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const generateRandomGenre = () => {
    if (leastGenres.length > 0) {
      const randomGenre =
        leastGenres[Math.floor(Math.random() * leastGenres.length)];
      setRandomLeastGenre({
        genre: randomGenre.genre.toUpperCase(),
        artist: randomGenre.artists[0] || "Unknown Artist",
      });
    }
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animated-background"
    >
      <Heading as="h2" size="lg" mb={4} className="heading" paddingTop={"10px"}>
        Genre Ranking and Artist Leaderboard!
      </Heading>
      <Text fontSize="md" className="heading" mb={4}>
        Hover over or tap the bars for additional details about the artist and
        genre!
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
          <strong>Most Played Genres:</strong> Displays the top genres you have
          listened to in the selected time range. Hover or tap on the bars to
          see the count of artists contributing to each genre.
        </Text>
        <Text fontSize="sm" mb={2}>
          <strong>Artist Leaderboard:</strong> Shows the most listened-to
          artists in the selected time range. Hover or tap on the bars to get
          more details about each artist and their popularity.
        </Text>
        <Text fontSize="sm" mb={2}>
          <strong>Random Genre Generator:</strong> Generate a random genre you
          have listened to at least once. This can help you discover less
          frequently played genres in your listening history.
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
              Most Played Genres
            </Heading>
            <MostPlayedGenres
              topGenres={topGenres}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          </Box>
          <Box className="chart-container" style={{ flex: 1, padding: "10px" }}>
            <Heading as="h3" size="md" mb={4}>
              Artist Leaderboard
            </Heading>
            <ArtistLeaderboard artists={artists} />
            <Box mt={4} textAlign="center">
              <Heading as="h3" size="md" mt={4}>
                Generate a random genre you have listened to!
              </Heading>
              <Button
                onClick={generateRandomGenre}
                className="button"
                colorScheme="green"
                mt={2}
              >
                Generate Random Genre
              </Button>
              <Box mt={4} minHeight="50px">
                {randomLeastGenre ? (
                  <>
                    <Text fontSize="lg" fontWeight="bold" color="teal.500">
                      {randomLeastGenre.genre}
                    </Text>
                    <Text fontSize="md" color="gray.500">
                      ({randomLeastGenre.artist})
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color="transparent"
                      userSelect={"none"}
                    >
                      Placeholder
                    </Text>
                    <Text fontSize="md" color="transparent" userSelect={"none"}>
                      Placeholder
                    </Text>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};
export default TopGenresandArtists;
