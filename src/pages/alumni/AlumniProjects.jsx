import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import AlumniLayout from '../../components/AlumniLayout';
import { Link } from 'react-router-dom';

const AlumniProjects = () => {
  return (
    <AlumniLayout>
      <Heading size="lg" mb={4} color="#172e36">Student Projects</Heading>
      <Text color="gray.600" mb={6}>Browse student project gallery.</Text>
      <VStack align="stretch" py={8}>
        <Text color="gray.600">
          View the project showcase from the main site: <Link to="/" style={{ color: '#d4a960', fontWeight: 'bold' }}>Home → Showcase</Link>
        </Text>
      </VStack>
    </AlumniLayout>
  );
};

export default AlumniProjects;
