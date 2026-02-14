import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  useToast,
  HStack,
  VStack,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ViewIcon, StarIcon, SearchIcon, CheckIcon, TimeIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaUser, FaHeart, FaRegHeart, FaStar, FaRegStar, FaChevronDown, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { PlacementService } from '../../services/placement.service';
import { getFileUrl } from '../../utils/fileUrl';

const PLAY_GREEN = '#01875f';
const PLAY_GREEN_HOVER = '#01704f';
const CARD_RADIUS = '16px';
const CARD_SHADOW = '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)';

function avgRating(p) {
  if (p.average_rating != null) return p.average_rating;
  return p.admin_rating != null ? Number(p.admin_rating) : null;
}

function formatCount(n) {
  if (n == null) return '0';
  const num = Number(n);
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

function StarDisplay({ value, max = 5, stars = 5 }) {
  const filled = (value != null && typeof value === 'number' && max > 0) ? (value / max) * stars : 0;
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

const AdminProjects = ({ mode = 'showcase' }) => {
  const toast = useToast();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Showcase Tab State
  const [search, setSearch] = useState('');

  // Manage Tab State - read project & tab from URL (?project=8&tab=approved)
  const urlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const project = params.get('project');
    const tab = params.get('tab');
    return {
      projectId: project ? parseInt(project, 10) : null,
      tab: tab && ['not_approved', 'approved', 'rejected', 'archived'].includes(tab) ? tab : null,
    };
  }, [location.search]);
  const projectIdFromUrl = urlParams.projectId;
  const tabFromUrl = urlParams.tab;
  const [manageSearch, setManageSearch] = useState('');
  const [manageFilter, setManageFilter] = useState(tabFromUrl || 'not_approved');
  const highlightedProjectId = projectIdFromUrl;
  const highlightedProjectRef = useRef(null);

  const navigate = useNavigate();

  // Edit/Modal State (Manage tab uses inline edits; modal kept for backward compat)
  const [editingProject, setEditingProject] = useState(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [adminRating, setAdminRating] = useState(3);
  const [isApproved, setIsApproved] = useState(false);
  const [archiveMode, setArchiveMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Inline edits per project (Manage tab - no modal)
  const [projectEdits, setProjectEdits] = useState({});
  const [savingProjectId, setSavingProjectId] = useState(null);
  const [likingId, setLikingId] = useState(null);
  const [favoritingId, setFavoritingId] = useState(null);
  const heroCarouselRef = useRef(null);

  const handleFavorite = async (projectId, e) => {
    if (e) e.stopPropagation();
    if (favoritingId) return;
    setFavoritingId(projectId);
    try {
      const result = await PlacementService.toggleProjectFavorite(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_favorited: result.is_favorited, favorites_count: result.favorites_count } : p
        )
      );
      if (editingProject?.id === projectId) {
        setEditingProject((prev) => ({ ...prev, is_favorited: result.is_favorited, favorites_count: result.favorites_count }));
      }
      if (selectedDetailProject?.id === projectId) {
        setSelectedDetailProject((prev) => ({ ...prev, is_favorited: result.is_favorited, favorites_count: result.favorites_count }));
      }
    } catch (err) {
      toast({ title: 'Failed to update favorite', status: 'error', isClosable: true });
    } finally {
      setFavoritingId(null);
    }
  };

  const handleLike = async (projectId, e) => {
    if (e) e.stopPropagation();
    if (likingId) return;
    setLikingId(projectId);
    try {
      const result = await PlacementService.toggleProjectLike(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_liked: result.is_liked, likes_count: result.likes_count } : p
        )
      );
      if (editingProject?.id === projectId) {
        setEditingProject((prev) => ({ ...prev, is_liked: result.is_liked, likes_count: result.likes_count }));
      }
      if (selectedDetailProject?.id === projectId) {
        setSelectedDetailProject((prev) => ({ ...prev, is_liked: result.is_liked, likes_count: result.likes_count }));
      }
    } catch (err) {
      toast({ title: 'Failed to update like', status: 'error', isClosable: true });
    } finally {
      setLikingId(null);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (manageSearch.trim()) params.search = manageSearch.trim();
      const data = await PlacementService.getAllProjects(params);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: 'Failed to load projects', status: 'error', isClosable: true });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [manageSearch, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Sync tab from URL when in manage mode (handles direct navigation / refresh)
  useEffect(() => {
    if (mode === 'manage' && tabFromUrl) {
      setManageFilter(tabFromUrl);
    }
  }, [mode, tabFromUrl]);

  // Showcase Tab Filtered Projects (approved only)
  const filteredProjects = useMemo(() => {
    const isApproved = (p) => {
      const s = p.project_status || (p.is_approved ? 'approved' : 'not_approved');
      if (s === 'draft' || s === 'submitted') return false;
      return s === 'approved';
    };
    let res = projects.filter(isApproved);

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
  }, [projects, search]);

  const featuredProjects = useMemo(
    () => filteredProjects.slice(0, 6),
    [filteredProjects]
  );

  const topByLikes = useMemo(
    () => [...filteredProjects].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 6),
    [filteredProjects]
  );

  // Manage Tab: filter by project_status client-side (treat draft/submitted as not_approved for backward compat)
  const manageFilteredProjects = useMemo(() => {
    const norm = (p) => {
      const s = p.project_status || (p.is_approved ? 'approved' : 'not_approved');
      if (s === 'draft' || s === 'submitted') return 'not_approved';
      return s;
    };
    let res = projects.filter((p) => norm(p) === manageFilter);
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

  // Scroll to highlighted project when it's in the DOM (after projects load and tab is correct)
  const highlightedProjectInList = highlightedProjectId && manageFilteredProjects.some((p) => Number(p.id) === Number(highlightedProjectId));
  useEffect(() => {
    if (!highlightedProjectId || !highlightedProjectInList) return;
    const timer = setTimeout(() => {
      if (highlightedProjectRef.current) {
        highlightedProjectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [highlightedProjectId, highlightedProjectInList, manageFilter, manageFilteredProjects]);

  const scrollHero = (direction) => {
    const el = heroCarouselRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth + 16;
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  const openDetail = (project) => {
    setEditingProject(project);
    setAdminRating(project.admin_rating != null ? Number(project.admin_rating) : 3);
    setIsApproved(project.project_status === 'approved' || project.is_approved === true);
    setArchiveMode(project.project_status === 'archived');
    onOpen();
  };

  const goToManageProject = (project) => {
    const norm = (s) => {
      if (s === 'draft' || s === 'submitted') return 'not_approved';
      return s || (project.is_approved ? 'approved' : 'not_approved');
    };
    const status = norm(project.project_status || (project.is_approved ? 'approved' : 'not_approved'));
    navigate(`/placement/gallery/manage?project=${project.id}&tab=${status}`);
  };

  const openProjectDetailModal = (project) => {
    setSelectedDetailProject(project);
    onDetailOpen();
  };

  const handleSave = async () => {
    if (!editingProject?.id) return;
    setSaving(true);
    try {
      const status = archiveMode ? 'archived' : (isApproved ? 'approved' : 'rejected');
      await PlacementService.updateProject(editingProject.id, {
        admin_rating: Math.round(adminRating),
        is_approved: isApproved,
        project_status: status,
      });
      toast({ title: 'Project updated', status: 'success', isClosable: true });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? {
                ...p,
                admin_rating: Math.round(adminRating),
                is_approved: isApproved,
                average_rating: Math.round(adminRating),
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

  const getProjectEdits = (p) => {
    const norm = (s) => {
      if (s === 'draft' || s === 'submitted') return 'not_approved';
      return s || (p.is_approved ? 'approved' : 'not_approved');
    };
    const r = p.admin_rating;
    const hasRating = r != null && r !== '' && Number(r) > 0;
    const def = {
      adminRating: hasRating ? Number(r) : null,
      projectStatus: norm(p.project_status || (p.is_approved ? 'approved' : 'not_approved')),
    };
    return projectEdits[p.id] ? { ...def, ...projectEdits[p.id] } : def;
  };

  const setProjectEdit = (projectId, field, value) => {
    setProjectEdits((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), [field]: value },
    }));
  };

  const handleSaveForProject = async (p) => {
    const edits = getProjectEdits(p);
    setSavingProjectId(p.id);
    try {
      const status = edits.projectStatus;
      const rating = edits.adminRating != null && edits.adminRating > 0 ? Math.round(edits.adminRating) : null;
      await PlacementService.updateProject(p.id, {
        admin_rating: rating,
        is_approved: status === 'approved',
        project_status: status,
      });
      toast({ title: 'Project updated', status: 'success', isClosable: true });
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === p.id
            ? { ...proj, admin_rating: rating, is_approved: status === 'approved', project_status: status }
            : proj
        )
      );
      setProjectEdits((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
    } catch (err) {
      toast({ title: err.message || 'Update failed', status: 'error', isClosable: true });
    } finally {
      setSavingProjectId(null);
    }
  };

  const snaps = editingProject?.project_snaps || [];
  const detailSnaps = selectedDetailProject?.project_snaps || selectedDetailProject?.snaps || [];

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

  const notApprovedCount = projects.filter((p) => {
    const s = p.project_status || (p.is_approved ? 'approved' : 'not_approved');
    return s === 'draft' || s === 'submitted' || s === 'not_approved';
  }).length;
  const approvedCount = projects.filter((p) => (p.project_status || (p.is_approved ? 'approved' : '')) === 'approved').length;
  const rejectedCount = projects.filter((p) => (p.project_status || '') === 'rejected').length;
  const archivedCount = projects.filter((p) => (p.project_status || '') === 'archived').length;

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
          <Heading size="lg" mb={6} color="gray.800" fontFamily="inherit">
            {mode === 'showcase' ? 'Showcase Projects' : 'Manage Projects'}
          </Heading>

          {mode === 'showcase' && (
            <>
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
                  <HStack spacing={4} ml={{ md: 'auto' }} flexWrap="wrap">
                    <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">
                      {notApprovedCount} not approved
                    </Badge>
                    <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                      {approvedCount} approved
                    </Badge>
                    <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                      {rejectedCount} rejected
                    </Badge>
                    <Badge colorScheme="gray" px={3} py={1} borderRadius="full">
                      {archivedCount} archived
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
                            <Box position="absolute" top={4} right={4} display="flex" gap={2}>
                              <Tooltip label={p.is_liked ? 'Unlike' : 'Like'}>
                                <IconButton
                                  icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                                  size="sm"
                                  bg="whiteAlpha.800"
                                  color={p.is_liked ? 'red.500' : 'gray.600'}
                                  _hover={{ bg: 'white', color: 'red.500' }}
                                  onClick={(e) => handleLike(p.id, e)}
                                  isLoading={likingId === p.id}
                                  aria-label={p.is_liked ? 'Unlike' : 'Like'}
                                />
                              </Tooltip>
                              <Tooltip label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}>
                                <IconButton
                                  icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                                  size="sm"
                                  bg="whiteAlpha.800"
                                  color={p.is_favorited ? 'orange.500' : 'gray.600'}
                                  _hover={{ bg: 'white', color: 'orange.500' }}
                                  onClick={(e) => handleFavorite(p.id, e)}
                                  isLoading={favoritingId === p.id}
                                  aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                                />
                              </Tooltip>
                            </Box>
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
                                  {avg != null ? avg.toFixed(1) : '—'} <Icon as={StarIcon} boxSize={2} color={PLAY_GREEN} />
                                </Text>
                                <Text fontSize="10px" color="gray.400">
                                  | {formatCount(p.likes_count)} likes
                                </Text>
                              </HStack>
                            </Box>
                            <HStack ml="auto" spacing={1}>
                              <Tooltip label={p.is_liked ? 'Unlike' : 'Like'}>
                                <IconButton
                                  icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                                  size="sm"
                                  variant="ghost"
                                  color={p.is_liked ? 'red.500' : 'gray.500'}
                                  _hover={{ color: 'red.500' }}
                                  onClick={(e) => handleLike(p.id, e)}
                                  isLoading={likingId === p.id}
                                  aria-label={p.is_liked ? 'Unlike' : 'Like'}
                                />
                              </Tooltip>
                              <Tooltip label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}>
                                <IconButton
                                  icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                                  size="sm"
                                  variant="ghost"
                                  color={p.is_favorited ? 'orange.500' : 'gray.500'}
                                  _hover={{ color: 'orange.500' }}
                                  onClick={(e) => handleFavorite(p.id, e)}
                                  isLoading={favoritingId === p.id}
                                  aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                                />
                              </Tooltip>
                            </HStack>
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
                              <HStack spacing={2}>
                                <Tooltip label={p.is_liked ? 'Unlike' : 'Like'}>
                                  <IconButton
                                    icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                                    size="sm"
                                    variant="outline"
                                    color={p.is_liked ? 'red.500' : 'gray.500'}
                                    _hover={{ color: 'red.500' }}
                                    onClick={(e) => handleLike(p.id, e)}
                                    isLoading={likingId === p.id}
                                    aria-label={p.is_liked ? 'Unlike' : 'Like'}
                                  />
                                </Tooltip>
                                <Tooltip label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}>
                                  <IconButton
                                    icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                                    size="sm"
                                    variant="outline"
                                    color={p.is_favorited ? 'orange.500' : 'gray.500'}
                                    _hover={{ color: 'orange.500' }}
                                    onClick={(e) => handleFavorite(p.id, e)}
                                    isLoading={favoritingId === p.id}
                                    aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                                  />
                                </Tooltip>
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
                                  onClick={() => goToManageProject(p)}
                                >
                                  {(p.project_status === 'approved' || p.is_approved) ? 'Manage' : 'Rate & approve'}
                                </Button>
                              </HStack>
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
                                    {avg != null ? avg.toFixed(1) : '—'}
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
                                <Text fontWeight="bold" fontSize="sm">
                                  <Icon as={FaBookmark} boxSize={3} color={p.is_favorited ? 'orange.500' : 'gray.400'} /> {formatCount(p.favorites_count ?? 0)}
                                </Text>
                                <Text fontSize="10px" color="gray.500" textTransform="uppercase">
                                  Favorites
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
                              <SimpleGrid columns={4} spacing={3} py={2}>
                                {[0, 1, 2, 3].map((i) => {
                                  const snap = screenshots[i] || null;
                                  return (
                                    <Box
                                      key={i}
                                      aspectRatio="16/9"
                                      borderRadius="xl"
                                      overflow="hidden"
                                      border="1px solid"
                                      borderColor={snap ? 'gray.200' : 'transparent'}
                                      bg={snap ? '#000' : 'transparent'}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      cursor="pointer"
                                      onClick={() => openDetail(p)}
                                    >
                                      {snap ? (
                                        <Image
                                          src={getFileUrl(snap)}
                                          w="100%"
                                          h="100%"
                                          objectFit="contain"
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      ) : (
                                        <Box w="100%" h="100%" />
                                      )}
                                    </Box>
                                  );
                                })}
                              </SimpleGrid>
                            )}
                          </Box>
                        );
                      })}
                    </VStack>
                  )}
                </Box>
            </>
          )}

          {mode === 'manage' && (
                <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
                  <Flex gap={4} mb={4} flexWrap="wrap">
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
                  </Flex>

                  <Tabs variant="soft-rounded" colorScheme="green" index={['not_approved', 'approved', 'rejected', 'archived'].indexOf(manageFilter)} onChange={(i) => setManageFilter(['not_approved', 'approved', 'rejected', 'archived'][i])}>
                    <TabList mb={4} bg="gray.50" p={1} borderRadius="xl" display="flex" flexWrap="wrap">
                      <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Not Approved ({notApprovedCount})</Tab>
                      <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Approved ({approvedCount})</Tab>
                      <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Rejected ({rejectedCount})</Tab>
                      <Tab _selected={{ color: 'white', bg: PLAY_GREEN }}>Archived ({archivedCount})</Tab>
                    </TabList>
                    <TabPanels>
                      {['not_approved', 'approved', 'rejected', 'archived'].map((status) => (
                        <TabPanel key={status} p={0}>
                          {manageFilteredProjects.length === 0 ? (
                            <Text textAlign="center" color="gray.500" mt={8}>
                              No projects found.
                            </Text>
                          ) : (
                            <VStack spacing={6} align="stretch">
                              {manageFilteredProjects.map((p) => {
                                const icon = (p.project_snaps || [])[0];
                                const screenshots = p.project_snaps || [];
                                const desc = p.full_description || p.one_line_description || 'No description.';
                                const edits = getProjectEdits(p);
                                const avg = avgRating(p);
                                const isHighlighted = highlightedProjectId && Number(p.id) === Number(highlightedProjectId);
                                return (
                                  <Box
                                    key={p.id}
                                    ref={isHighlighted ? highlightedProjectRef : null}
                                    p={5}
                                    borderRadius={CARD_RADIUS}
                                    shadow={CARD_SHADOW}
                                    bg="white"
                                    borderWidth={isHighlighted ? '3px' : 0}
                                    borderColor={PLAY_GREEN}
                                    borderStyle="solid"
                                    boxShadow={isHighlighted ? `0 0 0 3px ${PLAY_GREEN}40, ${CARD_SHADOW}` : CARD_SHADOW}
                                    transition="all 0.3s ease"
                                  >
                                    <Flex
                                      direction={{ base: 'column', md: 'row' }}
                                      justify="space-between"
                                      align={{ base: 'stretch', md: 'flex-start' }}
                                      gap={4}
                                      flexWrap="wrap"
                                      mb={2}
                                    >
                                      <HStack align="center" spacing={4} flex={1} minW={0}>
                                        {icon ? (
                                          <Box boxSize="64px" flexShrink={0} borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.100">
                                            <Image src={getFileUrl(icon)} w="100%" h="100%" objectFit="cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                          </Box>
                                        ) : (
                                          <Box boxSize="64px" flexShrink={0} borderRadius="lg" bg="gray.100" />
                                        )}
                                        <Box minW={0}>
                                          <Text fontSize="lg" fontWeight="bold" color="gray.900">{p.title}</Text>
                                          <Text color={PLAY_GREEN} fontSize="sm" fontWeight="medium">{p.usn}</Text>
                                          <Text color="gray.500" fontSize="xs">
                                            {p.genre || '—'} • {p.project_status || (p.is_approved ? 'approved' : 'not approved')}
                                          </Text>
                                        </Box>
                                      </HStack>
                                      <VStack align={{ base: 'stretch', md: 'flex-end' }} spacing={3} minW={{ md: '280px' }}>
                                        <HStack spacing={4} flexWrap="wrap" align="center">
                                          <HStack spacing={2} align="center">
                                            <Text fontSize="xs" fontWeight="500" whiteSpace="nowrap">Rating</Text>
                                            <HStack spacing={0.5} role="group">
                                              {[1, 2, 3, 4, 5].map((star) => {
                                                const filled = edits.adminRating != null && edits.adminRating > 0 && star <= Math.round(edits.adminRating);
                                                return (
                                                  <Box
                                                    key={star}
                                                    as="button"
                                                    type="button"
                                                    onClick={() => setProjectEdit(p.id, 'adminRating', star)}
                                                    _hover={{ transform: 'scale(1.15)' }}
                                                    _active={{ transform: 'scale(0.95)' }}
                                                    transition="transform 0.15s ease"
                                                    cursor="pointer"
                                                    aria-label={`Rate ${star} stars`}
                                                    outline="none"
                                                    border="none"
                                                    bg="transparent"
                                                    p={0}
                                                    minW="auto"
                                                    _focus={{ outline: 'none', boxShadow: 'none' }}
                                                  >
                                                    <Icon
                                                      as={filled ? FaStar : FaRegStar}
                                                      boxSize={5}
                                                      color={filled ? 'yellow.400' : 'gray.300'}
                                                      transition="color 0.15s ease"
                                                    />
                                                  </Box>
                                                );
                                              })}
                                            </HStack>
                                          </HStack>
                                          <Menu>
                                            <MenuButton
                                              as={Button}
                                              size="sm"
                                              variant="outline"
                                              rightIcon={<Icon as={FaChevronDown} boxSize={3} />}
                                              minW="140px"
                                            >
                                              <Badge
                                                colorScheme={edits.projectStatus === 'approved' ? 'green' : edits.projectStatus === 'not_approved' ? 'yellow' : edits.projectStatus === 'rejected' ? 'red' : 'gray'}
                                                variant="subtle"
                                                textTransform="capitalize"
                                              >
                                                {edits.projectStatus.replace('_', ' ')}
                                              </Badge>
                                            </MenuButton>
                                            <MenuList>
                                              <MenuItem onClick={() => setProjectEdit(p.id, 'projectStatus', 'not_approved')}>
                                                <Badge colorScheme="yellow" mr={2}>Not approved</Badge>
                                              </MenuItem>
                                              <MenuItem onClick={() => setProjectEdit(p.id, 'projectStatus', 'approved')}>
                                                <Badge colorScheme="green" mr={2}>Approved</Badge>
                                              </MenuItem>
                                              <MenuItem onClick={() => setProjectEdit(p.id, 'projectStatus', 'rejected')}>
                                                <Badge colorScheme="red" mr={2}>Rejected</Badge>
                                              </MenuItem>
                                              <MenuItem onClick={() => setProjectEdit(p.id, 'projectStatus', 'archived')}>
                                                <Badge colorScheme="gray" mr={2}>Archived</Badge>
                                              </MenuItem>
                                            </MenuList>
                                          </Menu>
                                        </HStack>
                                        <HStack spacing={2} flexWrap="wrap">
                                          <Tooltip label={p.is_liked ? 'Unlike' : 'Like'}>
                                            <IconButton
                                              icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                                              size="sm"
                                              variant="outline"
                                              color={p.is_liked ? 'red.500' : 'gray.500'}
                                              _hover={{ color: 'red.500' }}
                                              onClick={(e) => { e.stopPropagation(); handleLike(p.id, e); }}
                                              isLoading={likingId === p.id}
                                              aria-label={p.is_liked ? 'Unlike' : 'Like'}
                                            />
                                          </Tooltip>
                                          <Tooltip label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}>
                                            <IconButton
                                              icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                                              size="sm"
                                              variant="outline"
                                              color={p.is_favorited ? 'orange.500' : 'gray.500'}
                                              _hover={{ color: 'orange.500' }}
                                              onClick={(e) => { e.stopPropagation(); handleFavorite(p.id, e); }}
                                              isLoading={favoritingId === p.id}
                                              aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                                            />
                                          </Tooltip>
                                          <Button
                                            size="sm"
                                            bg={PLAY_GREEN}
                                            color="white"
                                            _hover={{ bg: PLAY_GREEN_HOVER }}
                                            leftIcon={<StarIcon />}
                                            onClick={() => handleSaveForProject(p)}
                                            isLoading={savingProjectId === p.id}
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            leftIcon={<Icon as={FaUser} />}
                                            onClick={() => navigate(`/placement/students/${p.usn}`)}
                                          >
                                            View Profile
                                          </Button>
                                          {p.hosted_link && (
                                            <Button as={Link} href={p.hosted_link} isExternal size="sm" variant="outline" leftIcon={<Icon as={FaExternalLinkAlt} />}>
                                              Demo
                                            </Button>
                                          )}
                                          {p.github_repo && (
                                            <Button as={Link} href={p.github_repo} isExternal size="sm" variant="outline" leftIcon={<Icon as={FaGithub} />}>
                                              Code
                                            </Button>
                                          )}
                                        </HStack>
                                      </VStack>
                                    </Flex>

                                    <Flex gap={8} py={3} overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                                      <Box textAlign="center" minW={14}>
                                        <HStack justify="center" spacing={0.5}>
                                          <Text fontWeight="bold" fontSize="sm">{avg != null ? avg.toFixed(1) : '—'}</Text>
                                          <Icon as={StarIcon} boxSize={3} />
                                        </HStack>
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase">Rating</Text>
                                      </Box>
                                      <Box borderLeft="1px" borderColor="gray.200" />
                                      <Box textAlign="center" minW={14}>
                                        <Text fontWeight="bold" fontSize="sm"><Icon as={ViewIcon} boxSize={3} mr={0.5} />{formatCount(p.views_count)}</Text>
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase">Views</Text>
                                      </Box>
                                      <Box borderLeft="1px" borderColor="gray.200" />
                                      <Box textAlign="center" minW={14}>
                                        <Text fontWeight="bold" fontSize="sm">♥ {formatCount(p.likes_count)}</Text>
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase">Likes</Text>
                                      </Box>
                                      <Box borderLeft="1px" borderColor="gray.200" />
                                      <Box textAlign="center" minW={14}>
                                        <Badge colorScheme={p.project_status === 'approved' ? 'green' : p.project_status === 'not_approved' ? 'yellow' : p.project_status === 'rejected' ? 'red' : 'gray'} borderRadius="md" fontSize="10px">
                                          {p.project_status || (p.is_approved ? 'approved' : 'not approved')}
                                        </Badge>
                                        <Text fontSize="10px" color="gray.500" textTransform="uppercase" mt={0.5}>Status</Text>
                                      </Box>
                                    </Flex>

                                    <Text color="gray.600" fontSize="sm" lineHeight="relaxed" noOfLines={{ base: 2, md: 3 }} mb={3}>
                                      {desc}
                                    </Text>

                                    {screenshots.length > 0 && (
                                      <SimpleGrid columns={4} spacing={3}>
                                        {[0, 1, 2, 3].map((i) => {
                                          const snap = screenshots[i] || null;
                                          return (
                                            <Box
                                              key={i}
                                              aspectRatio="16/9"
                                              borderRadius="xl"
                                              overflow="hidden"
                                              border="1px solid"
                                              borderColor={snap ? 'gray.200' : 'transparent'}
                                              bg={snap ? '#000' : 'transparent'}
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="center"
                                            >
                                              {snap ? (
                                                <Image src={getFileUrl(snap)} w="100%" h="100%" objectFit="contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                              ) : (
                                                <Box w="100%" h="100%" />
                                              )}
                                            </Box>
                                          );
                                        })}
                                      </SimpleGrid>
                                    )}
                                  </Box>
                                );
                              })}
                            </VStack>
                          )}
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </Box>
          )}

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
                    <Badge colorScheme={editingProject.project_status === 'approved' ? 'green' : editingProject.project_status === 'archived' ? 'gray' : editingProject.project_status === 'not_approved' ? 'yellow' : 'red'}>
                      {editingProject.project_status || (editingProject.is_approved ? 'approved' : 'not approved')}
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

                    {/* Image gallery: 4 tiles (filled + empty transparent) */}
                    <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="600" mb={2} textTransform="uppercase">
                          Project images
                        </Text>
                        <SimpleGrid columns={4} spacing={3}>
                          {[0, 1, 2, 3].map((i) => {
                            const snap = snaps[i] || null;
                            return (
                              <Box
                                key={i}
                                aspectRatio="16/9"
                                borderRadius="xl"
                                overflow="hidden"
                                border="1px solid"
                                borderColor={snap ? 'gray.200' : 'transparent'}
                                bg={snap ? '#000' : 'transparent'}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {snap ? (
                                  <Image
                                    src={getFileUrl(snap)}
                                    w="100%"
                                    h="100%"
                                    objectFit="contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <Box w="100%" h="100%" />
                                )}
                              </Box>
                            );
                          })}
                        </SimpleGrid>
                    </Box>

                    <Box bg="gray.50" p={4} borderRadius="xl">
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel fontSize="sm">Admin rating (1–5)</FormLabel>
                          <Slider
                            value={adminRating}
                            min={1}
                            max={5}
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
                            Archived
                          </FormLabel>
                          <Switch
                            isChecked={archiveMode}
                            onChange={(e) => {
                              setArchiveMode(e.target.checked);
                              if (e.target.checked) setIsApproved(false);
                            }}
                            colorScheme="gray"
                          />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb={0} fontSize="sm">
                            Approved
                          </FormLabel>
                          <Switch
                            isChecked={isApproved}
                            onChange={(e) => {
                              setIsApproved(e.target.checked);
                              if (e.target.checked) setArchiveMode(false);
                            }}
                            colorScheme="green"
                            isDisabled={archiveMode}
                          />
                        </FormControl>
                        <Text fontSize="sm" color="gray.600">
                          Admin rating: {Math.round(adminRating)}
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
                    {/* Image Gallery: 4 tiles (filled + empty transparent) like student view */}
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontWeight="600" mb={2} textTransform="uppercase">
                        Project images
                      </Text>
                      <SimpleGrid columns={4} spacing={3}>
                        {[0, 1, 2, 3].map((i) => {
                          const snap = detailSnaps[i] || null;
                          return (
                            <Box
                              key={i}
                              aspectRatio="16/9"
                              borderRadius="xl"
                              overflow="hidden"
                              border="1px solid"
                              borderColor={snap ? 'gray.200' : 'transparent'}
                              bg={snap ? '#000' : 'transparent'}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {snap ? (
                                <Image
                                  src={getFileUrl(snap)}
                                  w="100%"
                                  h="100%"
                                  objectFit="contain"
                                  alt=""
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <Box w="100%" h="100%" />
                              )}
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </Box>

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
