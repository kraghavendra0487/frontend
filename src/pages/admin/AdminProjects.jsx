import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  useToast,
  HStack,
  VStack,
  Select,
  Badge,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Image,
  Flex,
  Tag,
  Icon,
  Divider,
  Link,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ViewIcon, StarIcon, SearchIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaFilter, FaUser, FaHeart, FaRegHeart, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';
import { getFileUrl } from '../../utils/fileUrl';

const PLAY_GREEN = '#01875f';
const PLAY_GREEN_HOVER = '#01704f';
const CARD_RADIUS = '16px';
const CARD_SHADOW = '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)';

function avgRating(p) {
  if (p.average_rating != null) return p.average_rating;
  const self = Number(p.self_rating) || 0;
  const admin = p.admin_rating != null ? Number(p.admin_rating) : null;
  if (admin != null) return (self + admin) / 2;
  return self;
}

function formatCount(n) {
  if (n == null) return '0';
  const num = Number(n);
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function StarDisplay({ value, max = 10, stars = 5 }) {
  const filled = max > 0 ? (value / max) * stars : 0;
  return (
    <HStack spacing={0.5} align="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          as={StarIcon}
          boxSize={3}
          color={i <= Math.round(filled) ? 'yellow.400' : 'gray.200'}
        />
      ))}
      <Text fontSize="sm" fontWeight="600" ml={0.5}>
        {typeof value === 'number' ? value.toFixed(1) : '—'}
      </Text>
    </HStack>
  );
}

const AdminProjects = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Showcase Tab State
  const [filterApproved, setFilterApproved] = useState('');
  const [search, setSearch] = useState('');

  // Manage Tab State
  const [manageSearch, setManageSearch] = useState('');
  const [manageFilter, setManageFilter] = useState('all'); // 'all', 'pending', 'approved'

  const navigate = useNavigate();

  // Edit/Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [adminRating, setAdminRating] = useState(5);
  const [isApproved, setIsApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailSnapIndex, setDetailSnapIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const heroCarouselRef = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Fetch all projects initially, handle filtering client-side or per tab needs
      // Note: If backend supports more filters, we could use them. 
      // Current usage implies fetching all for manage tab logic.
      const params = {};
      // For Showcase, we might want to respect filterApproved if it was global, 
      // but now we have tabs. Let's fetch all and filter in memory for smooth tab switching.
      // If data is huge, we should move filter to backend. Assuming reasonable size for now.
      
      const data = await PlacementService.getAllProjects(params);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: 'Failed to load projects', status: 'error', isClosable: true });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Showcase Tab Filtered Projects
  const filteredProjects = useMemo(() => {
    let res = projects;
    
    // Apply Showcase specific approved filter if set (though usually Showcase shows all or approved)
    // The original code had a filterApproved state. We'll keep it for Showcase tab.
    if (filterApproved !== '') {
        // If filterApproved is 'true', show approved. If 'false', show pending.
        const isAppr = filterApproved === 'true';
        res = res.filter(p => p.is_approved === isAppr);
    }

    if (!search.trim()) return res;
    const q = search.trim().toLowerCase();
    return res.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const genre = (p.genre || '').toLowerCase();
      const usn = (p.usn || '').toLowerCase();
      const one = (p.one_line_description || '').toLowerCase();
      const tech = Array.isArray(p.technologies)
        ? p.technologies.join(' ').toLowerCase()
        : (p.technologies || '').toString().toLowerCase();
      return `${title} ${genre} ${usn} ${one} ${tech}`.includes(q);
    });
  }, [projects, search, filterApproved]);

  const featuredProjects = useMemo(
    () => filteredProjects.slice(0, 6),
    [filteredProjects]
  );

  const topByLikes = useMemo(
    () => [...filteredProjects].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 6),
    [filteredProjects]
  );

  // Manage Tab Filtered Projects
  const manageFilteredProjects = useMemo(() => {
    let res = projects;
    
    // Filter by status
    if (manageFilter === 'pending') {
      res = res.filter(p => !p.is_approved);
    } else if (manageFilter === 'approved') {
      res = res.filter(p => p.is_approved);
    }

    // Filter by search
    if (manageSearch.trim()) {
      const q = manageSearch.trim().toLowerCase();
      res = res.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const usn = (p.usn || '').toLowerCase();
        const genre = (p.genre || '').toLowerCase();
        return `${title} ${usn} ${genre}`.includes(q);
      });
    }
    
    return res;
  }, [projects, manageSearch, manageFilter]);

  const scrollHero = (direction) => {
    const el = heroCarouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth + 16;
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const openDetail = (project) => {
    setEditingProject(project);
    setAdminRating(project.admin_rating != null ? Number(project.admin_rating) : 5);
    setIsApproved(project.is_approved === true);
    setDetailSnapIndex(0);
    onOpen();
  };

  const openProjectDetailModal = (project) => {
    setSelectedDetailProject(project);
    setDetailSnapIndex(0);
    onDetailOpen();
  };

  const handleSave = async () => {
    if (!editingProject?.id) return;
    setSaving(true);
    try {
      await PlacementService.updateProject(editingProject.id, {
        admin_rating: Math.round(adminRating),
        is_approved: isApproved,
      });
      toast({ title: 'Project updated', status: 'success', isClosable: true });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                admin_rating: Math.round(adminRating),
                is_approved: isApproved,
                average_rating: (p.self_rating + Math.round(adminRating)) / 2,
              }
            : p
        )
      );
      onClose();
      setEditingProject(null);
    } catch (err) {
      toast({ title: err.message || 'Update failed', status: 'error', isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const snaps = editingProject?.project_snaps || [];
  const detailSnaps = selectedDetailProject?.project_snaps || [];

  const techList = useMemo(() => {
    const p = editingProject;
    if (!p) return [];
    if (Array.isArray(p.technologies)) return p.technologies.filter(Boolean);
    if (typeof p.technologies === 'string')
      return p.technologies.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [editingProject]);

  const detailTechList = useMemo(() => {
    const p = selectedDetailProject;
    if (!p) return [];
    if (Array.isArray(p.technologies)) return p.technologies.filter(Boolean);
    if (typeof p.technologies === 'string')
      return p.technologies.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [selectedDetailProject]);

  const approvedCount = projects.filter((p) => p.is_approved === true).length;
  const pendingCount = projects.filter((p) => p.is_approved !== true).length;

  if (loading && projects.length === 0) {
    return (
      <AdminLayout>
        <Box py={16} display="flex" justifyContent="center" alignItems="center">
          <Spinner size="xl" color={PLAY_GREEN} thickness="3px" />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box bg="#f0f0f0" minH="100vh" py={6} color="gray.800">
        <Container maxW="6xl">
          <Heading size="lg" mb={1} color="gray.800" fontFamily="inherit">
            Student Projects
          </Heading>
          <Text color="gray.600" mb={6}>
            View student projects, approve and rate them. Average rating = (self + admin) / 2.
          </Text>

          <Tabs variant="soft-rounded" colorScheme="green" isLazy>
            <TabList mb={6} bg="gray.50" p={1} borderRadius="xl" display="inline-flex">
              <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Showcase Projects</Tab>
              <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Manage Projects</Tab>
            </TabList>

            <TabPanels>
              {/* TAB 1: SHOWCASE */}
              <TabPanel p={0}>
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  gap={4}
                  mb={6}
                  align={{ base: 'stretch', md: 'center' }}
                  flexWrap="wrap"
                >
                  <InputGroup maxW={{ md: '320px' }} bg="white" borderRadius="xl" shadow="sm">
                    <InputLeftElement pointerEvents="none" color="gray.400">
                      <SearchIcon />
                    </InputLeftElement>
                    <Input
                      placeholder="Search by title, genre, USN, tech…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      borderRadius="xl"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: PLAY_GREEN, boxShadow: `0 0 0 1px ${PLAY_GREEN}` }}
                    />
                  </InputGroup>
                  <Select
                    w={{ base: '100%', md: '180px' }}
                    value={filterApproved}
                    onChange={(e) => setFilterApproved(e.target.value)}
                    bg="white"
                    borderRadius="xl"
                    shadow="sm"
                    placeholder="All Status"
                  >
                    <option value="false">Pending approval</option>
                    <option value="true">Approved</option>
                  </Select>
                  <HStack spacing={4} ml={{ md: 'auto' }} flexWrap="wrap">
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      {approvedCount} approved
                    </Badge>
                    <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">
                      {pendingCount} pending
                    </Badge>
                  </HStack>
                </Flex>

                {/* Section 1: Featured Student Work (Carousel) */}
                {featuredProjects.length > 0 && (
                  <Box mb={10}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md" fontWeight="bold">
                        Featured Student Work
                      </Heading>
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="full"
                          borderColor="gray.200"
                          onClick={() => scrollHero(-1)}
                          _hover={{ bg: 'gray.50' }}
                        >
                          <Icon as={FaChevronLeft} boxSize={3} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          borderRadius="full"
                          borderColor="gray.200"
                          onClick={() => scrollHero(1)}
                          _hover={{ bg: 'gray.50' }}
                        >
                          <Icon as={FaChevronRight} boxSize={3} />
                        </Button>
                      </HStack>
                    </Flex>
                    <Flex
                      ref={heroCarouselRef}
                      overflowX="auto"
                      gap={4}
                      py={2}
                      sx={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
                    >
                      {featuredProjects.map((p) => {
                        const heroImg = (p.project_snaps || [])[0];
                        const icon = (p.project_snaps || [])[0];
                        const desc = p.one_line_description || p.full_description || '';
                        return (
                          <Box
                            key={p.id}
                            flex="0 0 100%"
                            minW="100%"
                            scrollSnapAlign="start"
                            position="relative"
                            aspectRatio="16/9"
                            borderRadius="2xl"
                            overflow="hidden"
                            cursor="pointer"
                            onClick={() => openDetail(p)}
                          >
                            {heroImg ? (
                              <Image
                                src={getFileUrl(heroImg)}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                borderRadius="2xl"
                                filter="brightness(0.75)"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <Box
                                w="100%"
                                h="100%"
                                aspectRatio="16/9"
                                bg="gray.200"
                                borderRadius="2xl"
                              />
                            )}
                            <Box
                              position="absolute"
                              bottom={6}
                              left={6}
                              color="white"
                              maxW="md"
                            >
                              <HStack align="flex-start" spacing={3} mb={2}>
                                {icon ? (
                                  <Image
                                    src={getFileUrl(icon)}
                                    w={10}
                                    h={10}
                                    borderRadius="lg"
                                    border="1px solid"
                                    borderColor="whiteAlpha.300"
                                    shadow="lg"
                                    objectFit="cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Box w={10} h={10} borderRadius="lg" bg="whiteAlpha.300" />
                                )}
                                <Box>
                                  <Text fontWeight="bold" fontSize="lg" lineHeight="tight">
                                    {p.title}
                                  </Text>
                                  <Text fontSize="xs" opacity={0.9}>
                                    {p.usn} • {p.genre || '—'}
                                  </Text>
                                </Box>
                              </HStack>
                              <Text fontSize="sm" noOfLines={2} opacity={0.8} display={{ base: 'none', md: 'block' }}>
                                {desc}
                              </Text>
                            </Box>
                          </Box>
                        );
                      })}
                    </Flex>
                  </Box>
                )}

                {/* Section 2: Top Charts */}
                {topByLikes.length > 0 && (
                  <Box mb={10}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <Heading size="md" fontWeight="bold">
                        Top Charts
                      </Heading>
                      <Text color={PLAY_GREEN} fontWeight="medium" fontSize="sm" cursor="pointer">
                        View all
                      </Text>
                    </Flex>
                    <Box
                      display="grid"
                      gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                      gap={{ base: 2, md: 8 }}
                      gapY={4}
                    >
                      {topByLikes.map((p, i) => {
                        const icon = (p.project_snaps || [])[0];
                        const avg = avgRating(p);
                        return (
                          <Flex
                            key={p.id}
                            align="center"
                            gap={4}
                            py={2}
                            px={2}
                            borderRadius="xl"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            transition="background 0.2s"
                            onClick={() => openDetail(p)}
                          >
                            <Text fontWeight="bold" fontSize="lg" color="gray.400" w={4}>
                              {i + 1}
                            </Text>
                            {icon ? (
                              <Box
                                boxSize="64px"
                                flexShrink={0}
                                borderRadius="xl"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.100"
                              >
                                <Image
                                  src={getFileUrl(icon)}
                                  w="100%"
                                  h="100%"
                                  objectFit="cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </Box>
                            ) : (
                              <Box boxSize="64px" flexShrink={0} borderRadius="xl" bg="gray.100" />
                            )}
                            <Box flex={1} minW={0}>
                              <Text fontWeight="medium" color="gray.900" noOfLines={1}>
                                {p.title}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {p.genre || '—'}
                              </Text>
                              <HStack mt={1} spacing={2}>
                                <Text fontSize="10px" fontWeight="medium" color="gray.600">
                                  {avg.toFixed(1)} <Icon as={StarIcon} boxSize={2} color={PLAY_GREEN} />
                                </Text>
                                <Text fontSize="10px" color="gray.400">
                                  | {formatCount(p.likes_count)} likes
                                </Text>
                              </HStack>
                            </Box>
                          </Flex>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Section 3: Main feed */}
                <Box>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md" fontWeight="bold">
                      All Projects
                    </Heading>
                  </Flex>

                  {filteredProjects.length === 0 ? (
                    <Box
                      bg="white"
                      borderRadius={CARD_RADIUS}
                      p={12}
                      textAlign="center"
                      shadow={CARD_SHADOW}
                    >
                      <Text color="gray.500" fontSize="lg">
                        {projects.length === 0
                          ? 'No projects found.'
                          : 'No projects match your search. Try different keywords.'}
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={12} align="stretch">
                      {filteredProjects.map((p) => {
                        const icon = (p.project_snaps || [])[0];
                        const screenshots = p.project_snaps || [];
                        const avg = avgRating(p);
                        const desc = p.full_description || p.one_line_description || 'No description.';
                        return (
                          <Box
                            key={p.id}
                            p={5}
                            borderRadius={CARD_RADIUS}
                            shadow={CARD_SHADOW}
                            bg="white"
                          >
                            <Flex
                              direction={{ base: 'column', md: 'row' }}
                              justify="space-between"
                              align={{ base: 'stretch', md: 'center' }}
                              gap={4}
                              flexWrap="wrap"
                              mb={2}
                            >
                              <HStack align="center" spacing={4} flex={1} minW={0}>
                                {icon ? (
                                  <Box
                                    boxSize="64px"
                                    flexShrink={0}
                                    borderRadius="lg"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor="gray.100"
                                  >
                                    <Image
                                      src={getFileUrl(icon)}
                                      w="100%"
                                      h="100%"
                                      objectFit="cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </Box>
                                ) : (
                                  <Box boxSize="64px" flexShrink={0} borderRadius="lg" bg="gray.100" />
                                )}
                                <Box minW={0}>
                                  <Text fontSize="lg" fontWeight="bold" color="gray.900">
                                    {p.title}
                                  </Text>
                                  <Text color={PLAY_GREEN} fontSize="sm" fontWeight="medium">
                                    {p.usn}
                                  </Text>
                                  <Text color="gray.500" fontSize="xs">
                                    {p.genre || '—'} • {p.is_approved ? 'Approved' : 'Pending'}
                                  </Text>
                                </Box>
                              </HStack>
                              <Button
                                bg={PLAY_GREEN}
                                color="white"
                                px={6}
                                py={2}
                                borderRadius="lg"
                                fontWeight="medium"
                                fontSize="sm"
                                _hover={{ bg: PLAY_GREEN_HOVER }}
                                leftIcon={<StarIcon />}
                                onClick={() => openDetail(p)}
                              >
                                Rate & approve
                              </Button>
                            </Flex>

                            <Flex
                              gap={8}
                              py={3}
                              overflowX="auto"
                              sx={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
                            >
                              <Box textAlign="center" minW={14}>
                                <HStack justify="center" spacing={0.5}>
                                  <Text fontWeight="bold" fontSize="sm">
                                    {avg.toFixed(1)}
                                  </Text>
                                  <Icon as={StarIcon} boxSize={3} />
                                </HStack>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">
                                  Rating
                                </Text>
                              </Box>
                              <Box borderLeft="1px" borderColor="gray.200" />
                              <Box textAlign="center" minW={14}>
                                <Text fontWeight="bold" fontSize="sm">
                                  <Icon as={ViewIcon} boxSize={3} mr={0.5} />
                                  {formatCount(p.views_count)}
                                </Text>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">
                                  Views
                                </Text>
                              </Box>
                              <Box borderLeft="1px" borderColor="gray.200" />
                              <Box textAlign="center" minW={14}>
                                <Text fontWeight="bold" fontSize="sm">
                                  ♥ {formatCount(p.likes_count)}
                                </Text>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">
                                  Likes
                                </Text>
                              </Box>
                              <Box borderLeft="1px" borderColor="gray.200" />
                              <Box textAlign="center" minW={14}>
                                <Badge
                                  colorScheme={p.is_approved ? 'green' : 'yellow'}
                                  borderRadius="md"
                                  fontSize="10px"
                                >
                                  {p.is_approved ? 'Approved' : 'Pending'}
                                </Badge>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase" mt={0.5}>
                                  Status
                                </Text>
                              </Box>
                            </Flex>

                            <Text
                              color="gray.600"
                              fontSize="sm"
                              lineHeight="relaxed"
                              noOfLines={{ base: 2, md: 3 }}
                            >
                              {desc}
                            </Text>

                            {screenshots.length > 0 && (
                              <Flex
                                overflowX="auto"
                                gap={3}
                                py={2}
                                sx={{ scrollSnapType: 'x mandatory', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
                              >
                                {screenshots.map((s, i) => (
                                  <Box
                                    key={i}
                                    flex="0 0 auto"
                                    w={{ base: '120px', md: '160px' }}
                                    aspectRatio="16/9"
                                    scrollSnapAlign="start"
                                    borderRadius="xl"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    shadow="sm"
                                    cursor="pointer"
                                    onClick={() => openDetail(p)}
                                  >
                                    <Image
                                      src={getFileUrl(s)}
                                      w="100%"
                                      h="100%"
                                      objectFit="cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  </Box>
                                ))}
                              </Flex>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
              </TabPanel>

              {/* TAB 2: MANAGE PROJECTS */}
              <TabPanel p={0}>
                <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
                  <Flex gap={4} mb={6} flexWrap="wrap">
                    <InputGroup maxW="320px">
                      <InputLeftElement pointerEvents="none" color="gray.400">
                        <SearchIcon />
                      </InputLeftElement>
                      <Input
                        placeholder="Search USN, Title..."
                        value={manageSearch}
                        onChange={(e) => setManageSearch(e.target.value)}
                        borderRadius="xl"
                      />
                    </InputGroup>
                    <Select
                      w="200px"
                      value={manageFilter}
                      onChange={(e) => setManageFilter(e.target.value)}
                      borderRadius="xl"
                    >
                      <option value="all">All Projects</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                    </Select>
                  </Flex>

                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Project</Th>
                          <Th>USN</Th>
                          <Th>Status</Th>
                          <Th>Rating</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {manageFilteredProjects.map((p) => (
                          <Tr key={p.id}>
                            <Td>
                              <HStack>
                                {p.project_snaps?.[0] ? (
                                  <Image
                                    src={getFileUrl(p.project_snaps[0])}
                                    boxSize="40px"
                                    borderRadius="md"
                                    objectFit="cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Box boxSize="40px" bg="gray.100" borderRadius="md" />
                                )}
                                <Box>
                                  <Text fontWeight="bold" fontSize="sm">{p.title}</Text>
                                  <Text fontSize="xs" color="gray.500">{p.genre}</Text>
                                </Box>
                              </HStack>
                            </Td>
                            <Td fontSize="sm">{p.usn}</Td>
                            <Td>
                              <Badge colorScheme={p.is_approved ? 'green' : 'yellow'}>
                                {p.is_approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack>
                                <StarIcon color={PLAY_GREEN} boxSize={3} />
                                <Text fontSize="sm">{p.admin_rating || '-'}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Tooltip label="View Details">
                                  <IconButton
                                    icon={<ViewIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => openProjectDetailModal(p)}
                                    aria-label="View Details"
                                  />
                                </Tooltip>
                                <Tooltip label="Manage Project">
                                  <IconButton
                                    icon={<Icon as={FaEdit} />}
                                    size="sm"
                                    colorScheme="green"
                                    variant="outline"
                                    onClick={() => openDetail(p)}
                                    aria-label="Manage Project"
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                  
                  {manageFilteredProjects.length === 0 && (
                    <Text textAlign="center" color="gray.500" mt={8}>
                      No projects found.
                    </Text>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* EDIT/RATE MODAL */}
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            isCentered
          >
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="2xl" overflow="hidden">
              <ModalHeader borderBottom="1px" borderColor="gray.100" py={4}>
                <HStack>
                  <Text>Manage Project</Text>
                  {editingProject && (
                    <Badge colorScheme={editingProject.is_approved ? 'green' : 'yellow'}>
                      {editingProject.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  )}
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody py={6}>
                {editingProject && (
                  <VStack align="stretch" spacing={6}>
                    <Flex gap={4}>
                      <Box
                        w="120px"
                        h="80px"
                        borderRadius="lg"
                        overflow="hidden"
                        flexShrink={0}
                      >
                        {snaps.length > 0 ? (
                          <Image
                            src={getFileUrl(snaps[0])}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Box w="100%" h="100%" bg="gray.100" />
                        )}
                      </Box>
                      <Box>
                        <Heading size="md">{editingProject.title}</Heading>
                        <Text color="gray.600" fontSize="sm">
                          {editingProject.usn}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {editingProject.genre}
                        </Text>
                      </Box>
                    </Flex>

                    <Box bg="gray.50" p={4} borderRadius="xl">
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm">Admin rating (1–10)</FormLabel>
                          <Slider
                            value={adminRating}
                            min={1}
                            max={10}
                            step={1}
                            onChange={setAdminRating}
                            colorScheme="green"
                          >
                            <SliderTrack>
                              <SliderFilledTrack bg={PLAY_GREEN} />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {Math.round(adminRating)}
                          </Text>
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb={0} fontSize="sm">
                            Approved
                          </FormLabel>
                          <Switch
                            isChecked={isApproved}
                            onChange={(e) => setIsApproved(e.target.checked)}
                            colorScheme="green"
                          />
                        </FormControl>
                        <Text fontSize="sm" color="gray.600">
                          Average with self ({editingProject.self_rating}):{' '}
                          {((editingProject.self_rating + Math.round(adminRating)) / 2).toFixed(1)}
                        </Text>
                      </VStack>
                    </Box>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter
                bg="gray.50"
                borderTop="1px"
                borderColor="gray.100"
                flexWrap="wrap"
                gap={2}
              >
                {editingProject?.hosted_link && (
                  <Button
                    as={Link}
                    href={editingProject.hosted_link}
                    isExternal
                    leftIcon={<Icon as={FaExternalLinkAlt} />}
                    variant="outline"
                    colorScheme="green"
                    size="sm"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Live demo
                  </Button>
                )}
                {editingProject?.github_repo && (
                  <Button
                    as={Link}
                    href={editingProject.github_repo}
                    isExternal
                    leftIcon={<Icon as={FaGithub} />}
                    variant="outline"
                    size="sm"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Source code
                  </Button>
                )}
                <Button variant="ghost" mr="auto" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  bg={PLAY_GREEN}
                  _hover={{ bg: PLAY_GREEN_HOVER }}
                  color="white"
                  onClick={handleSave}
                  isLoading={saving}
                  leftIcon={<StarIcon />}
                >
                  Save rating & approval
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* VIEW DETAIL MODAL */}
          <Modal
            isOpen={isDetailOpen}
            onClose={() => {
              onDetailClose();
              setSelectedDetailProject(null);
            }}
            size="xl"
            isCentered
            scrollBehavior="inside"
          >
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius={CARD_RADIUS} overflow="hidden" maxH="90vh">
              <ModalHeader bg="white" borderBottom="1px" borderColor="gray.200" pb={4}>
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between" align="start">
                    <Heading size="md" color="gray.800" noOfLines={2}>
                      {selectedDetailProject?.title}
                    </Heading>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {selectedDetailProject?.usn} · {selectedDetailProject?.genre || '—'}
                  </Text>
                </VStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody py={4} overflowY="auto">
                {selectedDetailProject && (
                  <VStack align="stretch" spacing={6}>
                    {/* Image Gallery */}
                    {detailSnaps.length > 0 && (
                      <Box>
                        <Box borderRadius="xl" overflow="hidden" bg="gray.50" position="relative" aspectRatio="16/9">
                          <Image
                            src={getFileUrl(detailSnaps[detailSnapIndex])}
                            w="100%"
                            h="100%"
                            objectFit="contain"
                            alt=""
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </Box>
                        {detailSnaps.length > 1 && (
                          <HStack mt={2} spacing={2} overflowX="auto" py={1}>
                            {detailSnaps.map((s, i) => (
                              <Box
                                key={i}
                                as="button"
                                flexShrink={0}
                                w="70px"
                                aspectRatio="16/9"
                                borderRadius="lg"
                                overflow="hidden"
                                border="2px"
                                borderColor={i === detailSnapIndex ? PLAY_GREEN : 'transparent'}
                                onClick={() => setDetailSnapIndex(i)}
                              >
                                <Image src={getFileUrl(s)} w="100%" h="100%" objectFit="cover" alt="" />
                              </Box>
                            ))}
                          </HStack>
                        )}
                      </Box>
                    )}

                    {/* About */}
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="600" mb={2} textTransform="uppercase">
                        About this project
                      </Text>
                      <Text color="gray.800" whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
                        {selectedDetailProject.full_description || selectedDetailProject.one_line_description || 'No description.'}
                      </Text>
                    </Box>

                    {/* Stats */}
                    <Flex gap={6} flexWrap="wrap">
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">Rating</Text>
                        <StarDisplay value={avgRating(selectedDetailProject)} />
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">Views</Text>
                        <Text fontWeight="600" color="gray.800">{formatCount(selectedDetailProject.views_count)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">Likes</Text>
                        <HStack>
                          <Icon as={FaHeart} color="red.500" />
                          <Text fontWeight="600" color="gray.800">{formatCount(selectedDetailProject.likes_count)}</Text>
                        </HStack>
                      </Box>
                    </Flex>

                    {/* Tech Stack */}
                    {detailTechList.length > 0 && (
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600" mb={2} textTransform="uppercase">
                          Tech Stack
                        </Text>
                        <Wrap spacing={2}>
                          {detailTechList.map((t, i) => (
                            <WrapItem key={i}>
                              <Tag bg="gray.50" color="gray.800" borderRadius="full" size="sm" border="1px solid" borderColor="gray.200">
                                {t}
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Box>
                    )}
                    
                     {selectedDetailProject.mentor_name && (
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600">Mentor</Text>
                        <Text color="gray.800">{selectedDetailProject.mentor_name}</Text>
                      </Box>
                    )}
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter bg="gray.50" borderTop="1px" borderColor="gray.200" flexWrap="wrap" gap={2}>
                {selectedDetailProject?.hosted_link && (
                  <Button
                    as={Link}
                    href={selectedDetailProject.hosted_link}
                    isExternal
                    leftIcon={<Icon as={FaExternalLinkAlt} />}
                    variant="outline"
                    borderColor={PLAY_GREEN}
                    color={PLAY_GREEN}
                    size="sm"
                    _hover={{ bg: PLAY_GREEN, color: 'white', textDecoration: 'none' }}
                  >
                    Live Demo
                  </Button>
                )}
                {selectedDetailProject?.github_repo && (
                  <Button
                    as={Link}
                    href={selectedDetailProject.github_repo}
                    isExternal
                    leftIcon={<Icon as={FaGithub} />}
                    variant="outline"
                    size="sm"
                    _hover={{ textDecoration: 'none' }}
                  >
                    Source Code
                  </Button>
                )}
                <Button
                  leftIcon={<Icon as={FaUser} />}
                  variant="outline"
                  size="sm"
                  colorScheme="teal"
                  onClick={() => {
                    onDetailClose();
                    navigate(`/placement/students/${selectedDetailProject?.usn}`);
                  }}
                >
                  View Student Profile
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default AdminProjects;
