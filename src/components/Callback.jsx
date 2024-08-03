import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import "./css/Callback.css";

const Callback = () => {
  const navigate = useNavigate();
  const processing = React.useRef(false); // Use a ref to prevent re-processing

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !processing.current) {
      processing.current = true; // Set the ref to true to indicate processing has started

      fetch(`http://127.0.0.1:8000/api/spotify-callback/?code=${code}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("spotify_access_token", data.access_token);
            localStorage.setItem("spotify_refresh_token", data.refresh_token);
            navigate("/main");
          } else {
            console.error("Token exchange failed:", data);
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Error during token exchange:", error);
          navigate("/");
        });
    }
  }, [navigate]);

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
          Redirecting...
        </Text>
        <Spinner size="xl" color="green.500" />
      </VStack>
    </Flex>
  );
};

export default Callback;
