import React from 'react';
import { Box, Heading, Text, Button, HStack, VStack, SimpleGrid, Card, CardBody } from '@chakra-ui/react';
import { EmailIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AlumniLayout from '../../components/AlumniLayout';
import { useAuth } from '../../context/AuthContext';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AlumniLayout>
      <Box bgGradient="linear(to-r, #172e36, #2c5261)" borderRadius="xl" p={8} mb={8} color="white" boxShadow="xl">
        <Heading size="lg" mb={2}>Welcome back, {user?.name || user?.full_name || 'Alumni'}!</Heading>
        <Text fontSize="lg" opacity={0.9} mb={6}>
          Connect with your alma mater, mentor juniors, and stay updated with campus placements.
        </Text>
        <HStack spacing={4} flexWrap="wrap">
          <Button bg="#d4a960" color="#172e36" _hover={{ bg: '#e5b970' }} leftIcon={<ViewIcon />} onClick={() => navigate('/placement/alumni-profile')}>
            My Profile
          </Button>
          <Button variant="outline" color="white" _hover={{ bg: 'whiteAlpha.200' }} leftIcon={<EmailIcon />} onClick={() => navigate('/placement/alumni-referral')}>
            Refer HR
          </Button>
          <Button variant="outline" color="white" _hover={{ bg: 'whiteAlpha.200' }} leftIcon={<ViewIcon />} onClick={() => navigate('/placement/alumni-directory')}>
            Alumni Directory
          </Button>
        </HStack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card borderLeft="4px solid #d4a960" boxShadow="md" cursor="pointer" onClick={() => navigate('/placement/alumni-directory')} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text color="gray.500" fontSize="sm">Alumni Directory</Text>
              <Heading size="md" color="#172e36">Browse alumni network</Heading>
              <Text fontSize="sm" color="gray.600">View and search fellow alumni.</Text>
            </VStack>
          </CardBody>
        </Card>
        <Card borderLeft="4px solid #172e36" boxShadow="md" cursor="pointer" onClick={() => navigate('/placement/alumni-referral')} _hover={{ transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <VStack align="start" spacing={1}>
              <Text color="gray.500" fontSize="sm">Refer HR</Text>
              <Heading size="md" color="#172e36">Submit a referral</Heading>
              <Text fontSize="sm" color="gray.600">Share job opportunities with the placement team.</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </AlumniLayout>
  );
};

export default AlumniDashboard;
