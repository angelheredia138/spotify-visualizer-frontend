import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Heading, Text, VStack, Button } from "@chakra-ui/react";

const Error = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/");
  };

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
        width="sm"
      >
        <Heading size="lg" color="red.500">
          Access Denied
        </Heading>
        <Text>
          You have denied access to your Spotify account. Please try logging in
          again.
        </Text>
        <Button colorScheme="green" onClick={handleHome}>
          Back to Home
        </Button>
      </VStack>
    </Flex>
  );
};

export default Error;
