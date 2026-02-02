import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Flex,
  Icon,
  Container,
  Spinner,
  Badge,
  Center
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiBriefcase, 
  FiCheckSquare, 
  FiLayers, 
  FiActivity 
} from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';
import { PlacementService } from '../services/placement.service';

// --- Sub-Components from Reference ---

const MainStatCard = ({ value }) => (
  <Box
    bg="#20343c"
    color="white"
    p={8}
    borderRadius="xl"
    boxShadow="lg"
    position="relative"
    overflow="hidden"
  >
    <Flex justify="space-between" align="center">
      <Box>
        <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={2} opacity={0.9}>
          Total Placement Seeking Students
        </Text>
        <Heading size="3xl" fontWeight="extrabold">
          {value}
        </Heading>
      </Box>
      <Icon as={FiUsers} boxSize={12} color="yellow.400" opacity={0.8} />
    </Flex>
  </Box>
);

const MetricCard = ({ title, value, subtitle, subtitleColor, icon, iconColor, trend }) => (
  <Box
    bg="white"
    p={5}
    borderRadius="xl"
    boxShadow="sm"
    border="1px solid"
    borderColor="gray.100"
    height="100%"
    transition="all 0.3s"
    _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
  >
    <Flex justify="space-between" align="start" mb={4}>
      <Box>
        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={1}>
          {title}
        </Text>
        <Heading size="lg" color="gray.800" fontWeight="bold">
          {value}
        </Heading>
      </Box>
      {icon && (
        <Box 
          p={2} 
          bg={`${iconColor || 'blue'}.50`} 
          borderRadius="lg" 
          color={`${iconColor || 'blue'}.500`}
        >
          <Icon as={icon} boxSize={5} />
        </Box>
      )}
    </Flex>
    
    {(subtitle || trend) && (
      <Flex align="center" mt={2}>
        {trend && (
          <Badge colorScheme={trend > 0 ? "green" : "red"} mr={2} borderRadius="full" px={2}>
            {trend > 0 ? "+" : ""}{trend}%
          </Badge>
        )}
        {subtitle && (
          <Text fontSize="xs" fontWeight="semibold" color={subtitleColor || "gray.500"}>
            {subtitle}
          </Text>
        )}
      </Flex>
    )}
  </Box>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await PlacementService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Container maxW="7xl" py={8}>
            <Center h="50vh">
                <Spinner size="xl" thickness='4px' speed='0.65s' emptyColor='gray.200' color='blue.500' />
            </Center>
        </Container>
      </AdminLayout>
    );
  }

  // Calculate percentages
  const placementSeeking = stats?.placementSeeking || 0;
  const totalOffers = stats?.totalOffers || 0;
  const totalPlaced = stats?.totalPlaced || 0;
  const totalInternship = stats?.totalInternship || 0;
  const totalInternshipCumFullTime = stats?.totalInternshipCumFullTime || 0;

  const placedPercentage = placementSeeking > 0 
    ? ((totalPlaced / placementSeeking) * 100).toFixed(1) + '%' 
    : '0%';

  const offersPerStudent = placementSeeking > 0
    ? (totalOffers / placementSeeking).toFixed(2)
    : '0';

  return (
    <AdminLayout>
      <Box bg="#f4f6f8" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          <VStack spacing={8} align="stretch">
            
            {/* Header */}
            <Box>
              <Heading as="h1" size="lg" color="gray.800" mb={1}>
                Placement Dashboard
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Key metrics and placement statistics.
              </Text>
            </Box>

            {/* 1. Main Stat Card */}
            <MainStatCard value={placementSeeking} />

            {/* 2. Placement Stats Grid */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                Offer Statistics
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {/* Total Offers */}
                <MetricCard 
                  title="TOTAL OFFERS" 
                  value={totalOffers} 
                  icon={FiBriefcase} 
                  iconColor="blue"
                  subtitle={`Avg ${offersPerStudent} offers/student`}
                  subtitleColor="blue.600"
                />
                
                {/* Total Placed */}
                <MetricCard 
                  title="TOTAL PLACED" 
                  value={totalPlaced} 
                  icon={FiCheckSquare} 
                  iconColor="green"
                  subtitle={`Placement Rate: ${placedPercentage}`}
                  subtitleColor="green.600"
                />

                {/* Total Internship */}
                <MetricCard 
                  title="TOTAL INTERNSHIP" 
                  value={totalInternship} 
                  icon={FiActivity} 
                  iconColor="orange"
                  subtitle="Internship Only"
                />

                {/* Internship + Full Time */}
                <MetricCard 
                  title="INTERNSHIP + FULL TIME" 
                  value={totalInternshipCumFullTime} 
                  icon={FiLayers} 
                  iconColor="purple"
                  subtitle="Dual Offers (PPO)"
                />
              </SimpleGrid>
            </Box>

          </VStack>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard;
