import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  Flex,
  Icon,
  Badge,
  Spinner,
  Card,
  CardBody,
  SimpleGrid,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { 
  SearchIcon,
  CalendarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { 
  FaBriefcase, 
  FaMapMarkerAlt,
  FaUsers,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from 'react-icons/fa';
import CompanyLayout from '../../components/CompanyLayout';
import { CompanyService } from '../../services/company.service';

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

const getStatusConfig = (status) => {
  const statusLower = (status || '').toLowerCase();
  switch (statusLower) {
    case 'completed':
      return { color: 'green', icon: FaCheckCircle, label: 'Completed' };
    case 'ongoing':
    case 'in_progress':
    case 'active':
      return { color: 'blue', icon: FaHourglassHalf, label: 'Ongoing' };
    case 'scheduled':
    case 'upcoming':
      return { color: 'orange', icon: FaClock, label: 'Scheduled' };
    case 'cancelled':
      return { color: 'red', icon: FaTimesCircle, label: 'Cancelled' };
    default:
      return { color: 'gray', icon: FaClock, label: status || 'Unknown' };
  }
};

const CompanyDrives = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.getDrives();
      setDrives(data || []);
    } catch (err) {
      toast({
        title: 'Failed to load placement drives',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCTC = (ctcStructure) => {
    if (!ctcStructure) return null;
    try {
      const ctc = typeof ctcStructure === 'string' ? JSON.parse(ctcStructure) : ctcStructure;
      if (ctc.min && ctc.max) {
        return `${ctc.min} - ${ctc.max} LPA`;
      } else if (ctc.fixed) {
        return `${ctc.fixed} LPA`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const formatStipend = (stipendStructure) => {
    if (!stipendStructure) return null;
    try {
      const stipend = typeof stipendStructure === 'string' ? JSON.parse(stipendStructure) : stipendStructure;
      if (stipend.min && stipend.max) {
        return `₹${stipend.min} - ₹${stipend.max}/month`;
      } else if (stipend.fixed) {
        return `₹${stipend.fixed}/month`;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Filter drives
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = !search || 
      drive.job_description?.toLowerCase().includes(search.toLowerCase()) ||
      drive.job_type?.toLowerCase().includes(search.toLowerCase()) ||
      drive.job_location?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (drive.placement_status || '').toLowerCase() === statusFilter.toLowerCase();
    
    const matchesJobType = jobTypeFilter === 'all' || 
      (drive.job_type || '').toLowerCase() === jobTypeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesJobType;
  });

  // Stats
  const totalDrives = drives.length;
  const activeDrives = drives.filter(d => 
    !['completed', 'cancelled'].includes((d.placement_status || '').toLowerCase())
  ).length;
  const totalRegistrations = drives.reduce((sum, d) => sum + (d.number_of_registrations || 0), 0);

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1400px">
          {/* Header */}
          <Box mb={8}>
            <Heading size="xl" color={colors.dark} mb={1}>
              Placement Drives
            </Heading>
            <Text color={colors.secondary} fontSize="md">
              View and manage all your hiring drives
            </Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={5}>
                <HStack spacing={4}>
                  <Flex w="50px" h="50px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                    <Icon as={FaBriefcase} color={colors.accent} boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="2xl" fontWeight="700" color={colors.dark}>{totalDrives}</Text>
                    <Text fontSize="sm" color={colors.secondary}>Total Drives</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={5}>
                <HStack spacing={4}>
                  <Flex w="50px" h="50px" bg="blue.50" borderRadius="xl" align="center" justify="center">
                    <Icon as={FaHourglassHalf} color="blue.500" boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="2xl" fontWeight="700" color={colors.dark}>{activeDrives}</Text>
                    <Text fontSize="sm" color={colors.secondary}>Active Drives</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
            <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={5}>
                <HStack spacing={4}>
                  <Flex w="50px" h="50px" bg="green.50" borderRadius="xl" align="center" justify="center">
                    <Icon as={FaUsers} color="green.500" boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="2xl" fontWeight="700" color={colors.dark}>{totalRegistrations}</Text>
                    <Text fontSize="sm" color={colors.secondary}>Total Registrations</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filters */}
          <Card bg="white" borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={colors.border} mb={6}>
            <CardBody p={4}>
              <Flex gap={4} wrap="wrap" align="center">
                <InputGroup maxW="300px" size="md">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search drives..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    borderRadius="lg"
                    borderColor={colors.border}
                    _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                  />
                </InputGroup>
                <Select
                  w="160px"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  borderRadius="lg"
                  borderColor={colors.border}
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
                <Select
                  w="160px"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  borderRadius="lg"
                  borderColor={colors.border}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                </Select>
                <Text fontSize="sm" color={colors.secondary} ml="auto">
                  Showing {filteredDrives.length} of {totalDrives} drives
                </Text>
              </Flex>
            </CardBody>
          </Card>

          {/* Drives List */}
          {filteredDrives.length === 0 ? (
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody py={16}>
                <VStack spacing={4}>
                  <Flex
                    w="100px"
                    h="100px"
                    borderRadius="full"
                    bg={colors.accentLight}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaBriefcase} boxSize={12} color={colors.accent} opacity={0.6} />
                  </Flex>
                  <Heading size="md" color={colors.dark}>No placement drives found</Heading>
                  <Text color={colors.secondary} textAlign="center" maxW="400px">
                    {drives.length === 0 
                      ? "You don't have any placement drives yet. Contact the placement office to schedule your first drive."
                      : "No drives match your current filters. Try adjusting your search criteria."}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              {filteredDrives.map((drive) => {
                const statusConfig = getStatusConfig(drive.placement_status);
                const ctc = formatCTC(drive.ctc_structure);
                const stipend = formatStipend(drive.stipend_structure);
                const registrationProgress = drive.number_of_openings 
                  ? Math.min(100, ((drive.number_of_registrations || 0) / drive.number_of_openings) * 100)
                  : 0;

                return (
                  <Card 
                    key={drive.id} 
                    bg="white" 
                    borderRadius="2xl" 
                    boxShadow="sm" 
                    border="1px solid" 
                    borderColor={colors.border}
                    _hover={{ boxShadow: 'md', borderColor: colors.accent }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => navigate(`/company/drive/${drive.id}`)}
                  >
                    <CardBody p={6}>
                      <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
                        <Box flex="1">
                          <HStack spacing={3} mb={2} flexWrap="wrap">
                            <Badge 
                              colorScheme={statusConfig.color}
                              fontSize="sm"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              <HStack spacing={1}>
                                <Icon as={statusConfig.icon} boxSize={3} />
                                <Text>{statusConfig.label}</Text>
                              </HStack>
                            </Badge>
                            <Badge 
                              bg={colors.accentLight}
                              color={colors.accent}
                              fontSize="sm"
                              px={3}
                              py={1}
                              borderRadius="full"
                            >
                              {drive.job_type || 'Job'}
                            </Badge>
                            {drive.type_of_hiring && (
                              <Badge colorScheme="purple" fontSize="xs" borderRadius="full">
                                {drive.type_of_hiring}
                              </Badge>
                            )}
                          </HStack>
                          <Heading size="md" color={colors.dark} mb={2}>
                            {drive.job_description || 'Placement Drive'}
                          </Heading>
                          <HStack spacing={4} color={colors.secondary} fontSize="sm" flexWrap="wrap">
                            {drive.job_location && (
                              <HStack spacing={1}>
                                <Icon as={FaMapMarkerAlt} boxSize={3} />
                                <Text>{drive.job_location}</Text>
                              </HStack>
                            )}
                            <HStack spacing={1}>
                              <CalendarIcon boxSize={3} />
                              <Text>{drive.academic_year || '—'}</Text>
                            </HStack>
                          </HStack>
                        </Box>
                        <Button
                          leftIcon={<ViewIcon />}
                          variant="outline"
                          colorScheme="gray"
                          size="sm"
                          borderRadius="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/company/drive/${drive.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </Flex>

                      <Divider my={4} />

                      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                        {/* Compensation */}
                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>
                            {drive.job_type?.toLowerCase() === 'internship' ? 'STIPEND' : 'CTC'}
                          </Text>
                          <HStack spacing={1}>
                            <Icon as={FaRupeeSign} color={colors.accent} boxSize={4} />
                            <Text fontSize="sm" fontWeight="600" color={colors.dark}>
                              {drive.job_type?.toLowerCase() === 'internship' 
                                ? (stipend || 'Not specified')
                                : (ctc || 'Not specified')}
                            </Text>
                          </HStack>
                        </Box>

                        {/* Openings */}
                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>OPENINGS</Text>
                          <Text fontSize="sm" fontWeight="600" color={colors.dark}>
                            {drive.number_of_openings || '—'}
                          </Text>
                        </Box>

                        {/* Registrations */}
                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>REGISTRATIONS</Text>
                          <Text fontSize="sm" fontWeight="600" color={colors.dark}>
                            {drive.number_of_registrations || 0}
                          </Text>
                          {drive.number_of_openings && (
                            <Progress 
                              value={registrationProgress} 
                              size="xs" 
                              colorScheme={registrationProgress >= 100 ? 'green' : 'blue'}
                              borderRadius="full"
                              mt={1}
                            />
                          )}
                        </Box>

                        {/* Event Date */}
                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>EVENT DATE</Text>
                          <Text fontSize="sm" fontWeight="600" color={colors.dark}>
                            {formatDate(drive.event_datetime)}
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          )}
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyDrives;
