import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Image,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ControlledConfetti from "./ControlledConfetti";

const TopArtists = ({ artists = [] }) => {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const confettiRef = useRef(null);

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

  return (
    <VStack
      spacing={8}
      p={6}
      ref={confettiRef}
      height="100vh"
      justifyContent="center"
    >
      <ControlledConfetti run={confettiVisible} />
      {!revealed ? (
        <>
          <Heading as="h2" size="2xl">
            Your Top 5 Artists
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
          spacing={10}
          p={6}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {artists.length ? (
            artists.map((artist, index) => (
              <HStack key={index} spacing={4} alignItems="center">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  boxSize="80px"
                  borderRadius="full"
                  ref={index === 0 ? confettiRef : null} // Use the first artist's image as the confetti trigger
                />
                <Box>
                  <Heading as="h3" size="md">
                    {artist.name}
                  </Heading>
                  <Text fontSize="md">Popularity: {artist.playcount}</Text>
                </Box>
              </HStack>
            ))
          ) : (
            <Text>No top artists data available.</Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default TopArtists;
