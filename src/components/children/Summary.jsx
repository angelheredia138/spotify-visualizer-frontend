import React, { useState, useEffect, useRef } from "react";
import { Box, Text, Heading, VStack, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import ControlledConfetti from "./ControlledConfetti";

const Summary = ({ scrollToNext }) => {
  const [listeningTime, setListeningTime] = useState(null);
  const [uniqueGenres, setUniqueGenres] = useState(null);
  const [uniqueArtists, setUniqueArtists] = useState(null);
  const [trends, setTrends] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const confettiRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("spotify_access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const fetchListeningTime = fetch(
        "http://127.0.0.1:8000/api/total_listening_time",
        { headers }
      );
      const fetchUniqueGenres = fetch(
        "http://127.0.0.1:8000/api/unique_genres",
        { headers }
      );
      const fetchUniqueArtists = fetch(
        "http://127.0.0.1:8000/api/unique_artists",
        { headers }
      );
      const fetchTrends = fetch("http://127.0.0.1:8000/api/trends_insights", {
        headers,
      });

      const [listeningTimeRes, uniqueGenresRes, uniqueArtistsRes, trendsRes] =
        await Promise.all([
          fetchListeningTime,
          fetchUniqueGenres,
          fetchUniqueArtists,
          fetchTrends,
        ]);

      setListeningTime((await listeningTimeRes.json()).total_listening_time);
      setUniqueGenres((await uniqueGenresRes.json()).unique_genres);
      setUniqueArtists((await uniqueArtistsRes.json()).unique_artists);
      setTrends((await trendsRes.json()).trends);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (revealed) {
      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 3000); // Hide confetti after 3 seconds
    }
  }, [revealed]);

  const startReveal = () => {
    let counter = countdown;
    const interval = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter === 0) {
        clearInterval(interval);
        setRevealed(true);
      }
    }, 1000);
  };

  const getListeningTimeText = (hours) => {
    if (hours > 1000)
      return `Wow! You've spent ${hours} hours listening to music in the last month. You're a true audiophile!`;
    if (hours > 500)
      return `Impressive! ${hours} hours of music in the last month - you're quite the dedicated listener.`;
    if (hours > 100)
      return `${hours} hours of tunes in the last month! You certainly enjoy your music.`;
    return `You've spent ${hours} hours enjoying music in the last month. Every moment counts!`;
  };

  const getUniqueGenresText = (genres) => {
    if (genres > 50)
      return `You have diverse tastes, enjoying over ${genres} different genres in the last month!`;
    if (genres > 20)
      return `${genres} genres! You love to explore different kinds of music.`;
    if (genres > 10)
      return `You listened to ${genres} different genres in the last month. Quite an explorer!`;
    return `${genres} genres. You know what you like!`;
  };

  const getUniqueArtistsText = (artists) => {
    if (artists > 500)
      return `Incredible! You've listened to over ${artists} different artists in the last month.`;
    if (artists > 200)
      return `You enjoyed music from ${artists} different artists in the last month. That's a wide range!`;
    if (artists > 100)
      return `You checked out ${artists} different artists in the last month. Quite impressive!`;
    return `${artists} artists made it to your playlist. Quality over quantity!`;
  };

  return (
    <VStack spacing={8} p={8} ref={confettiRef}>
      <ControlledConfetti run={confettiVisible} />
      {!revealed ? (
        <>
          <Heading as="h2" size="2xl">
            Your Listening Summary for the Last Month
          </Heading>
          <Button onClick={startReveal} colorScheme="blue" size="lg">
            Reveal
          </Button>
          {countdown < 4 && countdown > 0 && (
            <Heading
              as={motion.h3}
              size="xl"
              mt={4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {countdown}
            </Heading>
          )}
        </>
      ) : (
        <VStack
          spacing={6}
          p={4}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Box textAlign="center">
            <Heading as="h3" size="xl">
              Total Listening Time
            </Heading>
            <Text fontSize="l">
              {listeningTime !== null
                ? getListeningTimeText(listeningTime)
                : "Loading..."}
            </Text>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="xl">
              Unique Genres
            </Heading>
            <Text fontSize="l">
              {uniqueGenres !== null
                ? getUniqueGenresText(uniqueGenres)
                : "Loading..."}
            </Text>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="xl">
              Unique Artists
            </Heading>
            <Text fontSize="l">
              {uniqueArtists !== null
                ? getUniqueArtistsText(uniqueArtists)
                : "Loading..."}
            </Text>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="xl">
              Trends and Insights
            </Heading>
            <Text fontSize="l">{trends || "Loading..."}</Text>
          </Box>
        </VStack>
      )}
    </VStack>
  );
};

export default Summary;
