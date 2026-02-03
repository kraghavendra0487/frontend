import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Flex,
  Icon,
  Badge,
  Spinner,
  Card,
  CardBody,
  SimpleGrid,
  Avatar,
  Divider,
  Button,
} from '@chakra-ui/react';
import { 
  ArrowForwardIcon,
  CheckCircleIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { 
  FaBuilding, 
  FaBriefcase,
  FaUsers,
  FaHandshake,
  FaCheckCircle,
  FaUserGraduate,
  FaClock,
  FaChartLine,
} from 'react-icons/fa';
import CompanyLayout from '../../components/CompanyLayout';
import { CompanyService } from '../../services/company.service';
import { getFileUrl } from '../../utils/fileUrl';

const colors = {
  accent: '#d4a960',
  accentHover: '#c4983f',
  accentLight: '#f8f3e8',
  dark: '#172e36',
  darkBlue: '#1e3a47',
  secondary: '#64748b',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  border: '#e2e8f0',
};

const StatCard = ({ icon, label, value, color = colors.accent, bg = colors.accentLight, onClick }) => (
  <Card 
    bg="white" 
    borderRadius="xl" 
    boxShadow="sm" 
    border="1px solid" 
    borderColor={colors.border}
    cursor={onClick ? 'pointer' : 'default'}
    onClick={onClick}
    _hover={onClick ? { boxShadow: 'md', transform: 'translateY(-2px)' } : {}}
    transition="all 0.2s"
  >
    <CardBody p={5}>
      <HStack spacing={4}>
        <Flex w="56px" h="56px" bg={bg} borderRadius="xl" align="center" justify="center">
          <Icon as={icon} color={color} boxSize={7} />
        </Flex>
        <Box>
          <Text fontSize="3xl" fontWeight="700" color={colors.dark}>{value}</Text>
          <Text fontSize="sm" color={colors.secondary}>{label}</Text>
        </Box>
      </HStack>
    </CardBody>
  </Card>
);

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      toast({
        title: 'Failed to load dashboard',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </CompanyLayout>
    );
  }

  const { company, stats, recent_activity } = dashboardData || {};
  const logoUrl = company?.company_logo_link ? getFileUrl(company.company_logo_link) : null;

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1400px">
          {/* Welcome Header */}
          <Card 
            bg={`linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkBlue} 100%)`}
            borderRadius="2xl" 
            boxShadow="lg"
            mb={8}
            overflow="hidden"
          >
            <CardBody p={8}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <HStack spacing={5}>
                  <Avatar
                    size="xl"
                    name={company?.company_name}
                    src={logoUrl}
                    bg="whiteAlpha.200"
                    color="white"
                    icon={<Icon as={FaBuilding} boxSize={8} />}
                    border="3px solid"
                    borderColor={colors.accent}
                  />
                  <Box>
                    <Text color="whiteAlpha.700" fontSize="sm" mb={1}>Welcome back</Text>
                    <Heading color="white" size="xl" mb={1}>
                      {company?.company_name || 'Company'}
                    </Heading>
                    {company?.company_type && (
                      <Badge bg={colors.accent} color={colors.dark} fontSize="sm" borderRadius="full" px={3}>
                        {company.company_type}
                      </Badge>
                    )}
                  </Box>
                </HStack>
                <VStack align="end" spacing={1}>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {new Date().toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                  <HStack spacing={2}>
                    <Icon as={FaChartLine} color={colors.accent} />
                    <Text color="white" fontSize="sm" fontWeight="500">
                      Placement Portal
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
            <StatCard
              icon={FaBriefcase}
              label="Active Drives"
              value={stats?.active_drives || 0}
              color="blue.500"
              bg="blue.50"
              onClick={() => navigate('/company/drives')}
            />
            <StatCard
              icon={FaUsers}
              label="Total Registrations"
              value={stats?.total_registrations || 0}
              color="purple.500"
              bg="purple.50"
              onClick={() => navigate('/company/drives')}
            />
            <StatCard
              icon={FaHandshake}
              label="Offers Made"
              value={stats?.total_offers || 0}
              color={colors.accent}
              bg={colors.accentLight}
              onClick={() => navigate('/company/offers')}
            />
            <StatCard
              icon={FaCheckCircle}
              label="Offers Accepted"
              value={stats?.accepted_offers || 0}
              color="green.500"
              bg="green.50"
              onClick={() => navigate('/company/offers')}
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Recent Activity */}
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={6}>
                <HStack justify="space-between" mb={5}>
                  <HStack spacing={3}>
                    <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                      <Icon as={FaClock} color={colors.accent} boxSize={5} />
                    </Flex>
                    <Text fontWeight="700" color={colors.dark} fontSize="lg">Recent Activity</Text>
                  </HStack>
                </HStack>

                {(!recent_activity || recent_activity.length === 0) ? (
                  <Flex direction="column" align="center" py={8}>
                    <Icon as={FaClock} boxSize={10} color="gray.300" mb={3} />
                    <Text color={colors.secondary} fontSize="sm">No recent activity</Text>
                  </Flex>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {recent_activity.slice(0, 5).map((activity, idx) => (
                      <Box 
                        key={idx}
                        py={3}
                        borderBottom={idx < recent_activity.length - 1 ? '1px solid' : 'none'}
                        borderColor={colors.border}
                      >
                        <HStack spacing={3}>
                          <Avatar size="sm" name={activity.student_name} bg="blue.500" color="white" />
                          <Box flex="1">
                            <Text fontSize="sm" color={colors.dark}>
                              <Text as="span" fontWeight="600">{activity.student_name}</Text>
                              {activity.type === 'registration' && ' registered for a drive'}
                              {activity.type === 'status_change' && ' status updated'}
                              {activity.type === 'offer_accepted' && ' accepted an offer'}
                            </Text>
                            <Text fontSize="xs" color={colors.secondary}>
                              {formatTimeAgo(activity.timestamp)}
                            </Text>
                          </Box>
                          <Badge 
                            colorScheme={
                              activity.type === 'registration' ? 'blue' :
                              activity.type === 'offer_accepted' ? 'green' : 'gray'
                            }
                            fontSize="xs"
                            borderRadius="full"
                          >
                            {activity.type === 'registration' ? 'New' : 
                             activity.type === 'offer_accepted' ? 'Accepted' : 'Update'}
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={6}>
                <HStack spacing={3} mb={5}>
                  <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                    <Icon as={FaUserGraduate} color={colors.accent} boxSize={5} />
                  </Flex>
                  <Text fontWeight="700" color={colors.dark} fontSize="lg">Quick Actions</Text>
                </HStack>

                <VStack spacing={3} align="stretch">
                  <Button
                    variant="outline"
                    borderRadius="xl"
                    h="60px"
                    justifyContent="space-between"
                    px={5}
                    borderColor={colors.border}
                    _hover={{ bg: colors.pageBg, borderColor: colors.accent }}
                    onClick={() => navigate('/company/drives')}
                  >
                    <HStack spacing={3}>
                      <Icon as={FaBriefcase} color={colors.accent} boxSize={5} />
                      <Box textAlign="left">
                        <Text fontWeight="600" color={colors.dark}>View Placement Drives</Text>
                        <Text fontSize="xs" color={colors.secondary}>Manage your hiring pipelines</Text>
                      </Box>
                    </HStack>
                    <ArrowForwardIcon color={colors.secondary} />
                  </Button>

                  <Button
                    variant="outline"
                    borderRadius="xl"
                    h="60px"
                    justifyContent="space-between"
                    px={5}
                    borderColor={colors.border}
                    _hover={{ bg: colors.pageBg, borderColor: colors.accent }}
                    onClick={() => navigate('/company/offers')}
                  >
                    <HStack spacing={3}>
                      <Icon as={FaHandshake} color={colors.accent} boxSize={5} />
                      <Box textAlign="left">
                        <Text fontWeight="600" color={colors.dark}>Track Offers</Text>
                        <Text fontSize="xs" color={colors.secondary}>View offer status & acceptances</Text>
                      </Box>
                    </HStack>
                    <ArrowForwardIcon color={colors.secondary} />
                  </Button>

                  <Button
                    variant="outline"
                    borderRadius="xl"
                    h="60px"
                    justifyContent="space-between"
                    px={5}
                    borderColor={colors.border}
                    _hover={{ bg: colors.pageBg, borderColor: colors.accent }}
                    onClick={() => navigate('/company/contacts')}
                  >
                    <HStack spacing={3}>
                      <Icon as={FaUsers} color={colors.accent} boxSize={5} />
                      <Box textAlign="left">
                        <Text fontWeight="600" color={colors.dark}>Manage Contacts</Text>
                        <Text fontSize="xs" color={colors.secondary}>Update your team members</Text>
                      </Box>
                    </HStack>
                    <ArrowForwardIcon color={colors.secondary} />
                  </Button>

                  <Button
                    variant="outline"
                    borderRadius="xl"
                    h="60px"
                    justifyContent="space-between"
                    px={5}
                    borderColor={colors.border}
                    _hover={{ bg: colors.pageBg, borderColor: colors.accent }}
                    onClick={() => navigate('/company/profile')}
                  >
                    <HStack spacing={3}>
                      <Icon as={FaBuilding} color={colors.accent} boxSize={5} />
                      <Box textAlign="left">
                        <Text fontWeight="600" color={colors.dark}>Company Profile</Text>
                        <Text fontSize="xs" color={colors.secondary}>Update your company details</Text>
                      </Box>
                    </HStack>
                    <ArrowForwardIcon color={colors.secondary} />
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Summary Stats */}
          <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border} mt={6}>
            <CardBody p={6}>
              <HStack spacing={3} mb={5}>
                <Flex w="40px" h="40px" bg="blue.50" borderRadius="xl" align="center" justify="center">
                  <Icon as={FaChartLine} color="blue.500" boxSize={5} />
                </Flex>
                <Text fontWeight="700" color={colors.dark} fontSize="lg">Summary</Text>
              </HStack>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <Box textAlign="center" p={4} bg={colors.pageBg} borderRadius="xl">
                  <Text fontSize="2xl" fontWeight="700" color={colors.dark}>{stats?.total_drives || 0}</Text>
                  <Text fontSize="sm" color={colors.secondary}>Total Drives</Text>
                </Box>
                <Box textAlign="center" p={4} bg={colors.pageBg} borderRadius="xl">
                  <Text fontSize="2xl" fontWeight="700" color={colors.dark}>{stats?.active_drives || 0}</Text>
                  <Text fontSize="sm" color={colors.secondary}>Active Drives</Text>
                </Box>
                <Box textAlign="center" p={4} bg={colors.pageBg} borderRadius="xl">
                  <Text fontSize="2xl" fontWeight="700" color="green.500">
                    {stats?.total_offers ? Math.round((stats.accepted_offers / stats.total_offers) * 100) : 0}%
                  </Text>
                  <Text fontSize="sm" color={colors.secondary}>Offer Acceptance Rate</Text>
                </Box>
                <Box textAlign="center" p={4} bg={colors.pageBg} borderRadius="xl">
                  <Text fontSize="2xl" fontWeight="700" color={colors.accent}>{stats?.total_registrations || 0}</Text>
                  <Text fontSize="sm" color={colors.secondary}>Total Candidates</Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyDashboard;
