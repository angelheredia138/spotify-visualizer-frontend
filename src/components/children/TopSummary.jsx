import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  Image,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import ControlledConfetti from "./ControlledConfetti";

const TopSummary = ({ topArtist, topSong, topGenre }) => {
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const confettiRef = useRef(null);

  const headingFontSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const subHeadingFontSize = useBreakpointValue({ base: "md", md: "lg" });
  const textFontSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonFontSize = useBreakpointValue({ base: "sm", md: "lg" });

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
    <VStack spacing={8} p={6} ref={confettiRef}>
      <ControlledConfetti run={confettiVisible} />
      {!revealed ? (
        <>
          <Heading as="h2" size="2xl" fontSize={headingFontSize}>
            Your Top Highlights
          </Heading>
          <Button
            onClick={startReveal}
            colorScheme="blue"
            size="lg"
            fontSize={buttonFontSize}
          >
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
              fontSize={subHeadingFontSize}
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
          <Box textAlign="center">
            <Heading as="h3" size="xl" fontSize={subHeadingFontSize}>
              Top Artist
            </Heading>
            <Image
              src={topArtist.image}
              alt={topArtist.name}
              boxSize="200px"
              borderRadius="full"
              mx="auto"
              my={4}
            />
            <Text fontSize={textFontSize}>{topArtist.name}</Text>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="xl" fontSize={subHeadingFontSize}>
              Top Song
            </Heading>
            <Text fontSize={textFontSize} fontWeight="bold">
              {topSong.title}
            </Text>
            <Text fontSize={textFontSize}>by {topSong.artist}</Text>
          </Box>
          <Box textAlign="center">
            <Heading as="h3" size="xl" fontSize={subHeadingFontSize}>
              Top Genre
            </Heading>
            <Text fontSize={textFontSize}>{topGenre}</Text>
          </Box>
        </VStack>
      )}
    </VStack>
  );
};

export default TopSummary;
