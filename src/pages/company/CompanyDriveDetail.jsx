import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Avatar,
  Tooltip,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  Checkbox,
} from '@chakra-ui/react';
import { 
  ArrowBackIcon,
  SearchIcon,
  ViewIcon,
  CheckCircleIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { 
  FaBriefcase, 
  FaMapMarkerAlt,
  FaUsers,
  FaRupeeSign,
  FaCalendarAlt,
  FaClipboardList,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
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

const RoundStatusBadge = ({ status, label }) => {
  if (status === true) {
    return (
      <Badge colorScheme="green" fontSize="xs" borderRadius="full">
        <HStack spacing={1}>
          <Icon as={FaCheckCircle} boxSize={2.5} />
          <Text>{label || 'Pass'}</Text>
        </HStack>
      </Badge>
    );
  } else if (status === false) {
    return (
      <Badge colorScheme="red" fontSize="xs" borderRadius="full">
        <HStack spacing={1}>
          <Icon as={FaTimesCircle} boxSize={2.5} />
          <Text>Fail</Text>
        </HStack>
      </Badge>
    );
  }
  return (
    <Badge colorScheme="gray" fontSize="xs" borderRadius="full">
      Pending
    </Badge>
  );
};

const CompanyDriveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [drive, setDrive] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    loadDrive();
  }, [id]);

  useEffect(() => {
    if (drive) {
      loadCandidates();
    }
  }, [drive, statusFilter]);

  const loadDrive = async () => {
    setLoading(true);
    try {
      const [driveData, eligibilityData] = await Promise.all([
        CompanyService.getDriveById(id),
        CompanyService.getDriveEligibility(id),
      ]);
      setDrive(driveData);
      setEligibility(eligibilityData);
    } catch (err) {
      toast({
        title: 'Failed to load drive details',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await CompanyService.getDriveCandidates(id, params);
      setCandidates(data || []);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleUpdateStatus = async (usn, field, value) => {
    try {
      await CompanyService.updateCandidateStatus(id, usn, { [field]: value });
      setCandidates(prev => prev.map(c => 
        c.usn === usn ? { ...c, [field]: value } : c
      ));
      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to update status',
        description: err?.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
    if (!ctcStructure) return 'Not specified';
    try {
      const ctc = typeof ctcStructure === 'string' ? JSON.parse(ctcStructure) : ctcStructure;
      if (ctc.min && ctc.max) return `₹${ctc.min} - ₹${ctc.max} LPA`;
      if (ctc.fixed) return `₹${ctc.fixed} LPA`;
      return 'Not specified';
    } catch {
      return 'Not specified';
    }
  };

  const formatStipend = (stipendStructure) => {
    if (!stipendStructure) return 'Not specified';
    try {
      const stipend = typeof stipendStructure === 'string' ? JSON.parse(stipendStructure) : stipendStructure;
      if (stipend.min && stipend.max) return `₹${stipend.min} - ₹${stipend.max}/month`;
      if (stipend.fixed) return `₹${stipend.fixed}/month`;
      return 'Not specified';
    } catch {
      return 'Not specified';
    }
  };

  // Filter candidates by search
  const filteredCandidates = candidates.filter(c => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      c.usn?.toLowerCase().includes(searchLower) ||
      c.student_basic_details?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  // Count stats
  const registeredCount = candidates.filter(c => c.registration_status === 'registered').length;
  const selectedCount = candidates.filter(c => c.final_select_status === true).length;

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </CompanyLayout>
    );
  }

  if (!drive) {
    return (
      <CompanyLayout>
        <Container maxW="1200px" py={8}>
          <VStack spacing={4}>
            <Text>Drive not found</Text>
            <Button onClick={() => navigate('/company/drives')}>Back to Drives</Button>
          </VStack>
        </Container>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1400px">
          {/* Header */}
          <Flex justify="space-between" align="start" mb={6} flexWrap="wrap" gap={4}>
            <Box>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
                mb={2}
                onClick={() => navigate('/company/drives')}
              >
                Back to Drives
              </Button>
              <Heading size="xl" color={colors.dark} mb={2}>
                {drive.job_description || 'Placement Drive'}
              </Heading>
              <HStack spacing={3} flexWrap="wrap">
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
                {drive.placement_status && (
                  <Badge 
                    colorScheme={
                      drive.placement_status.toLowerCase() === 'completed' ? 'green' :
                      drive.placement_status.toLowerCase() === 'ongoing' ? 'blue' : 'orange'
                    }
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {drive.placement_status}
                  </Badge>
                )}
              </HStack>
            </Box>
          </Flex>

          <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" colorScheme="yellow">
            <TabList bg="white" borderRadius="xl" p={1} border="1px solid" borderColor={colors.border}>
              <Tab 
                borderRadius="lg" 
                _selected={{ bg: colors.dark, color: 'white' }}
                fontWeight="600"
              >
                <Icon as={FaClipboardList} mr={2} />
                Overview
              </Tab>
              <Tab 
                borderRadius="lg" 
                _selected={{ bg: colors.dark, color: 'white' }}
                fontWeight="600"
              >
                <Icon as={FaUserGraduate} mr={2} />
                Candidates ({registeredCount})
              </Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel p={0} pt={6}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Drive Overview */}
                  <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
                    <CardBody p={6}>
                      <HStack spacing={3} mb={5}>
                        <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                          <Icon as={FaBriefcase} color={colors.accent} boxSize={5} />
                        </Flex>
                        <Text fontWeight="700" color={colors.dark} fontSize="lg">Drive Details</Text>
                      </HStack>

                      <VStack spacing={4} align="stretch">
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="xs" color={colors.secondary} fontWeight="600">ACADEMIC YEAR</Text>
                            <Text fontSize="sm" fontWeight="500" color={colors.dark}>{drive.academic_year || '—'}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color={colors.secondary} fontWeight="600">HIRING TYPE</Text>
                            <Text fontSize="sm" fontWeight="500" color={colors.dark}>{drive.type_of_hiring || '—'}</Text>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color={colors.secondary} fontWeight="600">LOCATION</Text>
                            <HStack spacing={1}>
                              <Icon as={FaMapMarkerAlt} color={colors.accent} boxSize={3} />
                              <Text fontSize="sm" fontWeight="500" color={colors.dark}>{drive.job_location || '—'}</Text>
                            </HStack>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color={colors.secondary} fontWeight="600">OPENINGS</Text>
                            <Text fontSize="sm" fontWeight="500" color={colors.dark}>{drive.number_of_openings || '—'}</Text>
                          </Box>
                        </SimpleGrid>

                        <Divider />

                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2}>
                            {drive.job_type?.toLowerCase() === 'internship' ? 'STIPEND' : 'CTC STRUCTURE'}
                          </Text>
                          <HStack spacing={2}>
                            <Icon as={FaRupeeSign} color={colors.accent} />
                            <Text fontSize="md" fontWeight="600" color={colors.dark}>
                              {drive.job_type?.toLowerCase() === 'internship' 
                                ? formatStipend(drive.stipend_structure)
                                : formatCTC(drive.ctc_structure)}
                            </Text>
                          </HStack>
                        </Box>

                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2}>PROCESS ROUNDS</Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {(drive.process_rounds || []).map((round, idx) => (
                              <Badge key={idx} colorScheme="blue" borderRadius="full" px={3} py={1}>
                                {round}
                              </Badge>
                            ))}
                            {(!drive.process_rounds || drive.process_rounds.length === 0) && (
                              <Text fontSize="sm" color={colors.secondary}>Not specified</Text>
                            )}
                          </HStack>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Important Dates */}
                  <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
                    <CardBody p={6}>
                      <HStack spacing={3} mb={5}>
                        <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                          <Icon as={FaCalendarAlt} color={colors.accent} boxSize={5} />
                        </Flex>
                        <Text fontWeight="700" color={colors.dark} fontSize="lg">Important Dates</Text>
                      </HStack>

                      <VStack spacing={4} align="stretch">
                        <Box p={4} bg={colors.pageBg} borderRadius="xl">
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600">REGISTRATION DEADLINE</Text>
                          <Text fontSize="md" fontWeight="600" color={colors.dark}>
                            {formatDate(drive.last_date_to_registration)}
                          </Text>
                        </Box>
                        <Box p={4} bg={colors.pageBg} borderRadius="xl">
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600">EVENT DATE</Text>
                          <Text fontSize="md" fontWeight="600" color={colors.dark}>
                            {formatDate(drive.event_datetime)}
                          </Text>
                        </Box>
                        <Box p={4} bg={colors.pageBg} borderRadius="xl">
                          <Text fontSize="xs" color={colors.secondary} fontWeight="600">ONBOARDING DATE</Text>
                          <Text fontSize="md" fontWeight="600" color={colors.dark}>
                            {formatDate(drive.onboarded_date)}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Eligibility (Read-only) */}
                  {eligibility && (
                    <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
                      <CardBody p={6}>
                        <HStack spacing={3} mb={5}>
                          <Flex w="40px" h="40px" bg="blue.50" borderRadius="xl" align="center" justify="center">
                            <CheckCircleIcon color="blue.500" boxSize={5} />
                          </Flex>
                          <Box>
                            <Text fontWeight="700" color={colors.dark} fontSize="lg">Eligibility Criteria</Text>
                            <Text fontSize="xs" color={colors.secondary}>Set by placement office</Text>
                          </Box>
                        </HStack>

                        <SimpleGrid columns={2} spacing={4}>
                          {eligibility.min_cgpa && (
                            <Box>
                              <Text fontSize="xs" color={colors.secondary} fontWeight="600">MIN CGPA</Text>
                              <Text fontSize="sm" fontWeight="500" color={colors.dark}>{eligibility.min_cgpa}</Text>
                            </Box>
                          )}
                          {eligibility.max_active_backlogs !== undefined && (
                            <Box>
                              <Text fontSize="xs" color={colors.secondary} fontWeight="600">MAX ACTIVE BACKLOGS</Text>
                              <Text fontSize="sm" fontWeight="500" color={colors.dark}>{eligibility.max_active_backlogs}</Text>
                            </Box>
                          )}
                          {eligibility.eligible_years && (
                            <Box>
                              <Text fontSize="xs" color={colors.secondary} fontWeight="600">ELIGIBLE YEARS</Text>
                              <Text fontSize="sm" fontWeight="500" color={colors.dark}>
                                {eligibility.eligible_years.join(', ')}
                              </Text>
                            </Box>
                          )}
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  )}

                  {/* Stats */}
                  <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
                    <CardBody p={6}>
                      <HStack spacing={3} mb={5}>
                        <Flex w="40px" h="40px" bg="green.50" borderRadius="xl" align="center" justify="center">
                          <Icon as={FaUsers} color="green.500" boxSize={5} />
                        </Flex>
                        <Text fontWeight="700" color={colors.dark} fontSize="lg">Pipeline Stats</Text>
                      </HStack>

                      <SimpleGrid columns={2} spacing={4}>
                        <Box p={4} bg={colors.pageBg} borderRadius="xl" textAlign="center">
                          <Text fontSize="3xl" fontWeight="700" color={colors.dark}>{registeredCount}</Text>
                          <Text fontSize="sm" color={colors.secondary}>Registered</Text>
                        </Box>
                        <Box p={4} bg="green.50" borderRadius="xl" textAlign="center">
                          <Text fontSize="3xl" fontWeight="700" color="green.600">{selectedCount}</Text>
                          <Text fontSize="sm" color="green.600">Selected</Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>

              {/* Candidates Tab */}
              <TabPanel p={0} pt={6}>
                <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
                  <CardBody p={0}>
                    {/* Filters */}
                    <Flex p={4} gap={4} wrap="wrap" borderBottom="1px solid" borderColor={colors.border}>
                      <InputGroup maxW="300px">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search by name or USN..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          borderRadius="lg"
                        />
                      </InputGroup>
                      <Select
                        w="180px"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        borderRadius="lg"
                      >
                        <option value="all">All Candidates</option>
                        <option value="registered">Registered</option>
                        <option value="selected">Selected</option>
                      </Select>
                      <Text fontSize="sm" color={colors.secondary} ml="auto" alignSelf="center">
                        {filteredCandidates.length} candidate(s)
                      </Text>
                    </Flex>

                    {/* Candidates Table */}
                    {candidatesLoading ? (
                      <Flex justify="center" py={12}>
                        <Spinner size="lg" color={colors.accent} />
                      </Flex>
                    ) : filteredCandidates.length === 0 ? (
                      <Flex direction="column" align="center" py={16}>
                        <Icon as={FaUserGraduate} boxSize={12} color="gray.300" mb={4} />
                        <Text color={colors.secondary}>No candidates found</Text>
                      </Flex>
                    ) : (
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr bg={colors.dark}>
                              <Th color={colors.accent} fontSize="xs">Candidate</Th>
                              <Th color={colors.accent} fontSize="xs">Status</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">OA</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">GD</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">Technical</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">Interview</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">HR</Th>
                              <Th color={colors.accent} fontSize="xs" textAlign="center">Final</Th>
                              <Th color={colors.accent} fontSize="xs">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredCandidates.map((candidate) => (
                              <Tr 
                                key={candidate.id} 
                                _hover={{ bg: colors.pageBg }}
                                borderBottom="1px solid"
                                borderColor={colors.border}
                              >
                                <Td>
                                  <HStack spacing={3}>
                                    <Avatar 
                                      size="sm" 
                                      name={candidate.student_basic_details?.full_name || candidate.usn}
                                    />
                                    <Box>
                                      <Text fontWeight="600" fontSize="sm" color={colors.dark}>
                                        {candidate.student_basic_details?.full_name || '—'}
                                      </Text>
                                      <Text fontSize="xs" color={colors.secondary}>{candidate.usn}</Text>
                                    </Box>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Badge 
                                    colorScheme={candidate.registration_status === 'registered' ? 'green' : 'gray'}
                                    fontSize="xs"
                                    borderRadius="full"
                                  >
                                    {candidate.registration_status || 'Pending'}
                                  </Badge>
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.oa_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'oa_status', e.target.checked)}
                                    colorScheme="green"
                                  />
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.gd_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'gd_status', e.target.checked)}
                                    colorScheme="green"
                                  />
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.technical_round_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'technical_round_status', e.target.checked)}
                                    colorScheme="green"
                                  />
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.interview_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'interview_status', e.target.checked)}
                                    colorScheme="green"
                                  />
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.hr_round_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'hr_round_status', e.target.checked)}
                                    colorScheme="green"
                                  />
                                </Td>
                                <Td textAlign="center">
                                  <Checkbox
                                    isChecked={candidate.final_select_status === true}
                                    onChange={(e) => handleUpdateStatus(candidate.usn, 'final_select_status', e.target.checked)}
                                    colorScheme="green"
                                    size="lg"
                                  />
                                </Td>
                                <Td>
                                  <Tooltip label="View Profile">
                                    <IconButton
                                      aria-label="View profile"
                                      icon={<ViewIcon />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => navigate(`/company/student/${candidate.usn}`)}
                                    />
                                  </Tooltip>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyDriveDetail;
