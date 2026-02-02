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
} from '@chakra-ui/react';
import { ViewIcon, StarIcon, SearchIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const [filterApproved, setFilterApproved] = useState('');
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [adminRating, setAdminRating] = useState(5);
  const [isApproved, setIsApproved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailSnapIndex, setDetailSnapIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const heroCarouselRef = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterApproved !== '') params.is_approved = filterApproved;
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
  }, [filterApproved]);

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
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
  const techList = useMemo(() => {
    const p = editingProject;
    if (!p) return [];
    if (Array.isArray(p.technologies)) return p.technologies.filter(Boolean);
    if (typeof p.technologies === 'string')
      return p.technologies.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [editingProject]);

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
      <Box bg="white" minH="100vh" py={6} color="gray.800">
        <Container maxW="5xl">
          <Heading size="lg" mb={1} color="gray.800" fontFamily="inherit">
            Student Projects
          </Heading>
          <Text color="gray.600" mb={6}>
            View student projects, approve and rate them. Average rating = (self + admin) / 2.
          </Text>

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
              placeholder="All"
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

          {/* Section 2: Top Charts – square cover thumbnails (normal size) */}
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

          {/* Section 3: Main feed (Recommended – detailed cards) */}
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
                      {/* Card header – small icon, title, status, button */}
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

                      {/* Stats bar */}
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

                      {/* Description */}
                      <Text
                        color="gray.600"
                        fontSize="sm"
                        lineHeight="relaxed"
                        noOfLines={{ base: 2, md: 3 }}
                      >
                        {desc}
                      </Text>

                      {/* Screenshot gallery – small 16:9 thumbnails */}
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
        </Container>
      </Box>

      {/* Detail & Rate modal (unchanged behavior) */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingProject(null);
        }}
        size="xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius={CARD_RADIUS} overflow="hidden" maxH="90vh">
          <ModalHeader bg="white" borderBottom="1px" borderColor="gray.100" pb={4}>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between" align="start">
                <Heading size="md" noOfLines={2}>
                  {editingProject?.title}
                </Heading>
                <Badge
                  colorScheme={editingProject?.is_approved ? 'green' : 'yellow'}
                  borderRadius="full"
                  flexShrink={0}
                >
                  {editingProject?.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {editingProject?.usn} · {editingProject?.genre || '—'}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4} overflowY="auto">
            {editingProject && (
              <VStack align="stretch" spacing={6}>
                {snaps.length > 0 && (
                  <Box>
                    <Box
                      borderRadius="xl"
                      overflow="hidden"
                      bg="gray.50"
                      position="relative"
                      aspectRatio="16/9"
                    >
                      <Image
                        src={getFileUrl(snaps[detailSnapIndex])}
                        w="100%"
                        h="100%"
                        objectFit="contain"
                        alt=""
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Box>
                    {snaps.length > 1 && (
                      <HStack mt={2} spacing={2} overflowX="auto" py={1}>
                        {snaps.map((s, i) => (
                          <Box
                            key={i}
                            as="button"
                            flexShrink={0}
                            w="80px"
                            aspectRatio="16/9"
                            borderRadius="lg"
                            overflow="hidden"
                            border="2px"
                            borderColor={i === detailSnapIndex ? PLAY_GREEN : 'transparent'}
                            onClick={() => setDetailSnapIndex(i)}
                          >
                            <Image
                              src={getFileUrl(s)}
                              w="100%"
                              h="100%"
                              objectFit="cover"
                              alt=""
                            />
                          </Box>
                        ))}
                      </HStack>
                    )}
                  </Box>
                )}

                <Box>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>
                    ABOUT THIS PROJECT
                  </Text>
                  <Text
                    color="gray.700"
                    whiteSpace="pre-wrap"
                    fontSize="sm"
                    lineHeight="tall"
                  >
                    {editingProject.full_description ||
                      editingProject.one_line_description ||
                      'No description.'}
                  </Text>
                </Box>

                <Flex gap={6} flexWrap="wrap">
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      AVERAGE RATING
                    </Text>
                    <StarDisplay
                      value={
                        editingProject.admin_rating != null
                          ? (editingProject.self_rating + editingProject.admin_rating) / 2
                          : editingProject.self_rating
                      }
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      SELF / ADMIN
                    </Text>
                    <Text fontWeight="600">
                      {editingProject.self_rating} / {editingProject.admin_rating ?? '—'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      VIEWS
                    </Text>
                    <Text fontWeight="600">{editingProject.views_count ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      LIKES
                    </Text>
                    <Text fontWeight="600">{editingProject.likes_count ?? 0}</Text>
                  </Box>
                </Flex>

                {techList.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={2}>
                      TECH STACK
                    </Text>
                    <Wrap spacing={2}>
                      {techList.map((t, i) => (
                        <WrapItem key={i}>
                          <Tag colorScheme="green" variant="subtle" borderRadius="full" size="sm">
                            {t}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                <Divider />

                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="xl"
                  border="1px dashed"
                  borderColor="gray.200"
                >
                  <Heading size="sm" mb={4} color="gray.800">
                    Admin evaluation
                  </Heading>
                  <VStack align="stretch" spacing={4}>
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
    </AdminLayout>
  );
};

export default AdminProjects;
