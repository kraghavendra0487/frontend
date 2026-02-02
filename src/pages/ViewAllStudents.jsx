import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Spinner,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  Flex,
  Wrap,
  WrapItem,
  Avatar,
  IconButton,
  useBreakpointValue,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import { StudentProfileService } from '../services/studentProfile.service';
import { PlacementService } from '../services/placement.service';
import { getFileUrl } from '../utils/fileUrl';
import { useBackgroundRefresh } from '../hooks/useBackgroundRefresh';

// Placement Overview tab: table by school / program / year with batch strength and salary stats (exported for PlacementOverviewPage)
export const PlacementOverviewTab = ({ rows, salaryStats, academicYears, selectedYear, onYearChange }) => {
  const headerRowBg = '#fbeec8';
  const border = '#c2b38a';
  const palette = ['#e8f5e9', '#e3f2fd', '#fff8e1', '#e0f7fa', '#f1f8e9', '#ede7f6', '#fff3e0'];
  const sortedRows = [...(rows || [])].sort((a, b) => {
    const sc = (a.school || '').localeCompare(b.school || '');
    if (sc !== 0) return sc;
    const cc = (a.course || '').localeCompare(b.course || '');
    if (cc !== 0) return cc;
    return (a.currentYear || 0) - (b.currentYear || 0);
  });
  const schoolColors = {};
  const schoolRowCounts = {};
  sortedRows.forEach((row, i) => {
    const key = row.school || 'Unknown';
    schoolRowCounts[key] = (schoolRowCounts[key] || 0) + 1;
    if (!schoolColors[key]) schoolColors[key] = palette[Object.keys(schoolColors).length % palette.length];
  });
  const getRowBg = (school) => schoolColors[school || 'Unknown'] || '#e9f4dd';

  return (
    <Box>
      <Flex justify="flex-end" mb={4} align="center">
        <HStack>
          <Text fontSize="sm" fontWeight="bold" color="gray.600">Academic Year:</Text>
          <Select size="sm" w="150px" value={selectedYear} onChange={(e) => onYearChange(e.target.value)} bg="white" borderColor="gray.300">
            <option value="">All Years</option>
            {(academicYears || []).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </HStack>
      </Flex>
      <Box bg="white" shadow="sm" border="1px" borderColor={border} overflowX="auto">
        <Table size="sm" borderWidth="1px" borderColor={border}>
          <Thead>
            <Tr bg={headerRowBg}>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">School</Th>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">Course</Th>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">Current Year</Th>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">Batch Strength</Th>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">Mode</Th>
              <Th fontSize="xs" textTransform="none" borderColor={border} textAlign="center">Salary Range (LPA)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedRows.map((row, index) => {
              const key = row.school || 'Unknown';
              const isFirstOfSchool = index === 0 || (sortedRows[index - 1].school || 'Unknown') !== key;
              const stats = (salaryStats && salaryStats[key]) || { max: 0, min: 0, avg: 0, median: 0, paidInternships: 0 };
              return (
                <Tr key={`${row.school}-${row.course}-${row.currentYear}-${index}`} bg={getRowBg(row.school)}>
                  <Td fontSize="sm" fontWeight="bold" textAlign="center" borderColor={border}>{row.school}</Td>
                  <Td fontSize="sm" textAlign="center" borderColor={border}>{row.course}</Td>
                  <Td fontSize="sm" textAlign="center" borderColor={border}>{row.currentYearLabel}</Td>
                  <Td fontSize="sm" textAlign="center" borderColor={border}>{row.batchStrength}</Td>
                  <Td fontSize="sm" textAlign="center" borderColor={border}>{row.mode}</Td>
                  {isFirstOfSchool && (
                    <Td rowSpan={schoolRowCounts[key]} fontSize="sm" borderColor={border} textAlign="center" verticalAlign="middle" p={4}>
                      <SimpleGrid columns={2} spacingY={2} spacingX={4} textAlign="left" minW="140px">
                        <Box><Text fontSize="xs" color="gray.500">Max</Text><Text fontWeight="bold" fontSize="md" color="green.600">{stats.max} LPA</Text></Box>
                        <Box><Text fontSize="xs" color="gray.500">Avg</Text><Text fontWeight="bold" fontSize="md" color="blue.600">{stats.avg} LPA</Text></Box>
                        <Box><Text fontSize="xs" color="gray.500">Median</Text><Text fontWeight="bold" fontSize="md" color="purple.600">{stats.median} LPA</Text></Box>
                        <Box><Text fontSize="xs" color="gray.500">Min</Text><Text fontWeight="bold" fontSize="md" color="orange.600">{stats.min} LPA</Text></Box>
                        <Box gridColumn="span 2" borderTop="1px dashed" borderColor="gray.200" pt={2}>
                          <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Paid Internships</Text><Badge colorScheme="teal">{stats.paidInternships}</Badge></HStack>
                        </Box>
                      </SimpleGrid>
                    </Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
      {sortedRows.length === 0 && (
        <Box bg="white" p={8} borderRadius="lg" shadow="sm" textAlign="center">
          <Text color="gray.500">No placement overview data. Student and school data will populate this view.</Text>
        </Box>
      )}
    </Box>
  );
};

// Placement eligibility track: batch policies (exported for StudentEligibilityPage)
export const StudentEligibilityTab = () => {
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modifiedPolicies, setModifiedPolicies] = useState({});
  const [filters, setFilters] = useState({ year: '', school: '' });

  const fetchData = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    try {
      if (!silent) setLoading(true);
      const data = await PlacementService.getAllPolicies();
      setPolicies(Array.isArray(data) ? data : []);
      if (!silent) setModifiedPolicies({});
    } catch (e) {
      if (!silent) toast({ title: 'Error fetching policies', status: 'error' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useBackgroundRefresh(fetchData);

  const handleSyncPolicies = async () => {
    try {
      setLoading(true);
      const res = await PlacementService.syncPolicies();
      toast({ title: 'Sync successful', description: res.message, status: 'success' });
      fetchData();
    } catch (e) {
      toast({ title: 'Sync failed', description: e?.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePolicy = (policy, field) => {
    const updated = { ...policy, [field]: !policy[field] };
    setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
    setModifiedPolicies((prev) => ({ ...prev, [policy.id]: updated }));
  };

  const handleSaveChanges = async () => {
    const updates = Object.values(modifiedPolicies);
    if (updates.length === 0) {
      toast({ title: 'No changes to save', status: 'info' });
      return;
    }
    try {
      setLoading(true);
      await Promise.all(updates.map((p) => PlacementService.upsertPolicy(p)));
      toast({ title: 'Changes saved', status: 'success' });
      setModifiedPolicies({});
    } catch (e) {
      toast({ title: 'Error saving', description: e?.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uniqueYears = [...new Set(policies.map((p) => p.joining_year))].sort((a, b) => b - a);
  const uniqueSchools = [...new Set(policies.map((p) => p.school_name).filter(Boolean))].sort();
  const filteredPolicies = policies.filter((p) => {
    return (!filters.year || p.joining_year.toString() === filters.year) && (!filters.school || p.school_name === filters.school);
  });
  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    const schoolA = (a.school_name || '').localeCompare(b.school_name || '');
    if (schoolA !== 0) return schoolA;
    const programA = (a.program_name || '').localeCompare(b.program_name || '');
    if (programA !== 0) return programA;
    return (a.joining_year || 0) - (b.joining_year || 0);
  });
  const colors = ['#E3F2FD', '#E8F5E9', '#F3E5F5', '#FFF3E0', '#FFEBEE', '#E0F2F1', '#E0F7FA', '#FCE4EC', '#F1F8E9', '#FFF8E1'];
  const getSchoolColor = (name) => {
    if (!name) return 'white';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box p={4} bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100">
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={2}>
        <Heading size="md">Placement eligibility track</Heading>
        <HStack>
          <Select w="150px" value={filters.year} onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}>
            {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select placeholder="Filter School" w="200px" value={filters.school} onChange={(e) => setFilters((p) => ({ ...p, school: e.target.value }))}>
            {uniqueSchools.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Button colorScheme="purple" size="sm" onClick={handleSyncPolicies} isLoading={loading}>Sync All Programs</Button>
        </HStack>
      </HStack>
      {loading && policies.length === 0 ? (
        <Flex justify="center" py={8}><Spinner /></Flex>
      ) : (
        <>
          <TableContainer overflowX="auto" mb={4}>
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>School</Th>
                  <Th>Program</Th>
                  <Th>Joining Year</Th>
                  <Th textAlign="center">Immersion</Th>
                  <Th textAlign="center">Internship</Th>
                  <Th textAlign="center">Capstone</Th>
                  <Th textAlign="center">Placement</Th>
                  <Th textAlign="center">Alumni</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedPolicies.map((policy) => (
                  <Tr key={policy.id} bg={getSchoolColor(policy.school_name)}>
                    <Td>{policy.school_name || '—'}</Td>
                    <Td>{policy.program_name || '—'}</Td>
                    <Td>{policy.joining_year}</Td>
                    <Td textAlign="center">
                      <Button size="xs" colorScheme={policy.summer_immersion ? 'green' : 'red'} onClick={() => handleTogglePolicy(policy, 'summer_immersion')} variant="solid" w="60px">{policy.summer_immersion ? 'Yes' : 'No'}</Button>
                    </Td>
                    <Td textAlign="center">
                      <Button size="xs" colorScheme={policy.summer_internship ? 'green' : 'red'} onClick={() => handleTogglePolicy(policy, 'summer_internship')} variant="solid" w="60px">{policy.summer_internship ? 'Yes' : 'No'}</Button>
                    </Td>
                    <Td textAlign="center">
                      <Button size="xs" colorScheme={policy.capstone ? 'green' : 'red'} onClick={() => handleTogglePolicy(policy, 'capstone')} variant="solid" w="60px">{policy.capstone ? 'Yes' : 'No'}</Button>
                    </Td>
                    <Td textAlign="center">
                      <Button size="xs" colorScheme={policy.placement ? 'green' : 'red'} onClick={() => handleTogglePolicy(policy, 'placement')} variant="solid" w="60px">{policy.placement ? 'Yes' : 'No'}</Button>
                    </Td>
                    <Td textAlign="center">
                      <Button size="xs" colorScheme={policy.alumni ? 'green' : 'red'} onClick={() => handleTogglePolicy(policy, 'alumni')} variant="solid" w="60px">{policy.alumni ? 'Yes' : 'No'}</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex justify="flex-end">
            <Button colorScheme="blue" size="md" onClick={handleSaveChanges} isDisabled={Object.keys(modifiedPolicies).length === 0} isLoading={loading}>Save Changes</Button>
          </Flex>
        </>
      )}
      {!loading && policies.length === 0 && (
        <Text color="gray.500" py={4}>No policies yet. Use &quot;Sync All Programs&quot; to create policies from schools and programs.</Text>
      )}
    </Box>
  );
};

const ViewAllStudents = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [programId, setProgramId] = useState('');
  const [yearOfJoining, setYearOfJoining] = useState('');
  const [yearOfJoiningDebounced, setYearOfJoiningDebounced] = useState('');
  const [isActive, setIsActive] = useState('');

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const t = setTimeout(() => setYearOfJoiningDebounced((yearOfJoining || '').trim()), 400);
    return () => clearTimeout(t);
  }, [yearOfJoining]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchFilters = useCallback(async () => {
    try {
      const [schoolsData, programsData] = await Promise.all([
        StudentProfileService.getSchools(),
        StudentProfileService.getPrograms(),
      ]);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (e) {
      console.error('Error fetching filters:', e);
    }
  }, []);

  const fetchStudents = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    if (!silent) setLoading(true);
    try {
      const yojNum = yearOfJoiningDebounced ? parseInt(yearOfJoiningDebounced, 10) : NaN;
      const yearOfJoiningParam = yearOfJoiningDebounced && !Number.isNaN(yojNum) ? yojNum : undefined;
      const params = {
        page,
        limit,
        search: searchDebounced || undefined,
        school_id: schoolId ? parseInt(schoolId, 10) : undefined,
        program_id: programId ? parseInt(programId, 10) : undefined,
        year_of_joining: yearOfJoiningParam,
        is_active: isActive === '' ? undefined : isActive,
      };
      const data = await StudentProfileService.getStudentsList(params);
      setStudents(data.students || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      if (!silent) {
        toast({
          title: 'Failed to load students',
          description: e?.message || 'Please try again.',
          status: 'error',
          isClosable: true,
        });
        setStudents([]);
        setTotal(0);
        setTotalPages(0);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, limit, searchDebounced, schoolId, programId, yearOfJoiningDebounced, isActive, toast]);

  useBackgroundRefresh(fetchStudents);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleView = (usn) => {
    navigate(`/placement/students/${encodeURIComponent(usn)}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSchoolId('');
    setProgramId('');
    setYearOfJoining('');
    setIsActive('');
    setPage(1);
  };

  const hasActiveFilters = search || schoolId || programId || yearOfJoining || isActive;

  const schoolName = (s) => (s?.schools && (s.schools.name || s.schools.abbreviation)) || '—';
  const programName = (s) => (s?.programs && s.programs.name) || '—';

  return (
    <Box w="full">
          {/* Filters card */}
          <Card
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
            mb={6}
          >
            <CardBody py={4} px={{ base: 4, md: 6 }}>
              <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="600" color="gray.700" textTransform="uppercase" letterSpacing="wider">
                  Filters
                </Text>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    leftIcon={<Icon as={CloseIcon} />}
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                )}
              </Flex>
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 5 }}
                spacing={4}
                align="end"
              >
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Search
                  </FormLabel>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <SearchIcon />
                    </InputLeftElement>
                    <Input
                      placeholder="USN or name"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      bg="gray.50"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                      _placeholder={{ color: 'gray.400' }}
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    School
                  </FormLabel>
                  <Select
                    placeholder="All schools"
                    value={schoolId}
                    onChange={(e) => { setSchoolId(e.target.value); setPage(1); }}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="md"
                    _focus={{ borderColor: 'blue.400' }}
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name || s.abbreviation}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Program
                  </FormLabel>
                  <Select
                    placeholder="All programs"
                    value={programId}
                    onChange={(e) => { setProgramId(e.target.value); setPage(1); }}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="md"
                    _focus={{ borderColor: 'blue.400' }}
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Year of joining
                  </FormLabel>
                  <Input
                    placeholder="e.g. 2023"
                    value={yearOfJoining}
                    onChange={(e) => { setYearOfJoining(e.target.value); setPage(1); }}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="md"
                    _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.500" fontWeight="500" mb={1}>
                    Status
                  </FormLabel>
                  <Select
                    placeholder="All"
                    value={isActive}
                    onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    size="md"
                    _focus={{ borderColor: 'blue.400' }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          {loading ? (
            <Flex justify="center" align="center" minH="280px" bg="white" borderRadius="xl" shadow="sm">
              <Spinner size="xl" color="blue.500" thickness="3px" />
            </Flex>
          ) : isMobile ? (
            <SimpleGrid columns={1} spacing={4}>
              {students.length === 0 ? (
                <Box bg="white" p={10} borderRadius="xl" shadow="sm" textAlign="center" border="1px solid" borderColor="gray.100">
                  <Text color="gray.500" fontSize="md">No students found.</Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>Try adjusting your filters.</Text>
                </Box>
              ) : (
                students.map((s) => (
                  <Card
                    key={s.usn}
                    shadow="sm"
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="gray.100"
                    _hover={{ shadow: 'md', borderColor: 'gray.200', cursor: 'pointer' }}
                    transition="all 0.2s"
                    cursor="pointer"
                    onClick={() => handleView(s.usn)}
                  >
                    <CardHeader pb={0} pt={4} px={4}>
                      <Flex align="center" justify="space-between">
                        <HStack spacing={3}>
                          <Avatar
                            size="md"
                            name={s.full_name}
                            src={s.profile_image ? getFileUrl(s.profile_image) : undefined}
                            bg="blue.50"
                            color="blue.600"
                          />
                          <Box>
                            <Text fontWeight="bold" fontSize="md">{s.full_name}</Text>
                            <Text fontSize="sm" color="gray.500">{s.usn}</Text>
                          </Box>
                        </HStack>
                        <Button
                          size="sm"
                          leftIcon={<ViewIcon />}
                          colorScheme="blue"
                          borderRadius="lg"
                          onClick={(e) => { e.stopPropagation(); handleView(s.usn); }}
                        >
                          View
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={3} px={4} pb={4}>
                      <Text fontSize="sm" color="gray.600">{s.college_email}</Text>
                      <HStack mt={3} spacing={2} flexWrap="wrap" gap={1}>
                        <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} py={0.5}>{schoolName(s)}</Badge>
                        <Badge colorScheme="purple" variant="subtle" borderRadius="full" px={2} py={0.5}>{programName(s)}</Badge>
                        {s.year_of_joining && <Badge variant="subtle" borderRadius="full" px={2} py={0.5}>YJ {s.year_of_joining}</Badge>}
                        {s.is_active === false && <Badge colorScheme="red" variant="subtle" borderRadius="full">Inactive</Badge>}
                      </HStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </SimpleGrid>
          ) : (
            <TableContainer
              bg="white"
              borderRadius="xl"
              shadow="sm"
              overflowX="auto"
              border="1px solid"
              borderColor="gray.100"
            >
              <Table variant="simple" size="sm">
                <Thead bg="gray.50" borderBottom="2px solid" borderColor="gray.200">
                  <Tr>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Student</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">USN</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">School</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Program</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Year</Th>
                    <Th fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Status</Th>
                    <Th textAlign="right" fontWeight="600" color="gray.700" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {students.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={12} color="gray.500" fontSize="md">
                        No students found. Try adjusting your filters.
                      </Td>
                    </Tr>
                  ) : (
                    students.map((s) => (
                      <Tr
                        key={s.usn}
                        _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                        borderBottom="1px"
                        borderColor="gray.100"
                        cursor="pointer"
                        onClick={() => handleView(s.usn)}
                      >
                        <Td py={3}>
                          <HStack spacing={3}>
                            <Avatar
                              size="sm"
                              name={s.full_name}
                              src={s.profile_image ? getFileUrl(s.profile_image) : undefined}
                              bg="blue.50"
                              color="blue.600"
                            />
                            <Text fontWeight="medium">{s.full_name}</Text>
                          </HStack>
                        </Td>
                        <Td py={3} fontSize="sm">{s.usn}</Td>
                        <Td py={3} fontSize="sm" color="gray.600">{s.college_email}</Td>
                        <Td py={3} fontSize="sm">{schoolName(s)}</Td>
                        <Td py={3} fontSize="sm">{programName(s)}</Td>
                        <Td py={3} fontSize="sm">{s.year_of_joining ?? '—'}</Td>
                        <Td py={3}>
                          <Badge colorScheme={s.is_active !== false ? 'green' : 'red'} variant="subtle" borderRadius="full" px={2} py={0.5}>
                            {s.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td py={3} textAlign="right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            leftIcon={<ViewIcon />}
                            colorScheme="blue"
                            variant="outline"
                            borderRadius="lg"
                            onClick={() => handleView(s.usn)}
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {totalPages > 1 && (
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={4}
              mt={6}
              p={4}
              bg="white"
              borderRadius="xl"
              shadow="sm"
              border="1px solid"
              borderColor="gray.100"
            >
              <Text fontSize="sm" color="gray.600" fontWeight="500">
                Showing <strong>{(page - 1) * limit + 1}</strong>–<strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong>
              </Text>
              <HStack spacing={3}>
                <IconButton
                  aria-label="Previous page"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  borderRadius="lg"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isDisabled={page <= 1}
                />
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Page {page} of {totalPages}</Text>
                <IconButton
                  aria-label="Next page"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  borderRadius="lg"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  isDisabled={page >= totalPages}
                />
              </HStack>
            </Flex>
          )}
    </Box>
  );
};

export default ViewAllStudents;
