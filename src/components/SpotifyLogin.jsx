import React from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import "./css/SpotifyLogin.css";

const SpotifyLogin = () => {
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const handleLogin = () => {
    const clientId = "ecc927ddea8743b3af6b32d78a149e68";
    const redirectUri =
      "https://angel-heredia.com/spotify-visualizer-frontend/callback";
    const apiUrl = "https://accounts.spotify.com/authorize";
    const scope = "user-read-recently-played user-top-read";

    window.location.href = `${apiUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&show_dialog=true`;
  };

  return (
    <Flex
      className="animated-background"
      minHeight="100vh"
      width="100vw"
      alignItems="center"
      justifyContent="center"
      color="white"
      direction="column"
      gap={8}
      pt={isMobile ? 15 : 44}
      pb={8}
      px={4}
    >
      <VStack
        spacing={6}
        p={6}
        boxShadow="lg"
        bg="white"
        rounded="md"
        color="black"
        textAlign="center"
        width={isMobile ? "90%" : "sm"}
      >
        <Heading size="lg" color="green.500">
          Spotify Data Visualizer
        </Heading>
        <Text>Log in to view your Spotify listening habits</Text>
        <Button colorScheme="green" onClick={handleLogin}>
          Log in with Spotify
        </Button>
        <Text color="red.500">
          If you have not been manually added as a user to use this website, it
          will not function properly. Please watch this tech demo of the
          developer's data to get an idea of how the website works!
        </Text>
      </VStack>
      <Box
        p={3}
        boxShadow="lg"
        bg="white"
        rounded="md"
        color="black"
        textAlign="center"
        width={isMobile ? "100%" : "lg"}
        mb={8}
      >
        <iframe
          width="100%"
          height={isMobile ? "200px" : "350px"}
          src="https://drive.google.com/file/d/1JkpRYz6ALbpRWXTmsW8-now3vv-I9dkU/preview?usp=sharing"
          title="Tech Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <Text>(make sure to fullscreen to see the graphs better)</Text>
      </Box>
    </Flex>
  );
};

export default SpotifyLogin;
