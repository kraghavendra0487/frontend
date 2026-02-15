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
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, StarIcon, SearchIcon } from '@chakra-ui/icons';
import { FaExternalLinkAlt, FaGithub, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaUser, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';
import { getFileUrl } from '../../utils/fileUrl';

// Color palette
const colors = {
  accent: '#d3a75c',
  accentHover: '#c4983f',
  dark: '#1e293b',
  secondary: '#64748b',
  cardBg: '#f8fafc',
  pageBg: '#e2e8f0',
  border: '#cbd5e1',
};

const CARD_RADIUS = '16px';
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';

function formatCount(n) {
  if (n == null) return '0';
  const num = Number(n);
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

const AlumniProjects = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailSnapIndex, setDetailSnapIndex] = useState(0);
  const [likingId, setLikingId] = useState(null);
  const [favoritingId, setFavoritingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const heroCarouselRef = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAlumniProjects();
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

  const openDetail = async (project) => {
    setSelectedProject(project);
    setDetailSnapIndex(0);
    onOpen();
    
    // Increment view count
    try {
      await PlacementService.incrementProjectView(project.id);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, views_count: (p.views_count || 0) + 1 } : p
        )
      );
    } catch (err) {
      // Silently fail
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
          p.id === projectId
            ? { ...p, is_liked: result.is_liked, likes_count: result.likes_count }
            : p
        )
      );
      if (selectedProject?.id === projectId) {
        setSelectedProject((prev) => ({
          ...prev,
          is_liked: result.is_liked,
          likes_count: result.likes_count,
        }));
      }
    } catch (err) {
      toast({ title: 'Failed to update like', status: 'error', isClosable: true });
    } finally {
      setLikingId(null);
    }
  };

  const handleFavorite = async (projectId, e) => {
    if (e) e.stopPropagation();
    if (favoritingId) return;
    setFavoritingId(projectId);
    try {
      const result = await PlacementService.toggleProjectFavorite(projectId);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, is_favorited: result.is_favorited, favorites_count: result.favorites_count }
            : p
        )
      );
      if (selectedProject?.id === projectId) {
        setSelectedProject((prev) => ({
          ...prev,
          is_favorited: result.is_favorited,
          favorites_count: result.favorites_count,
        }));
      }
    } catch (err) {
      toast({ title: 'Failed to update favorite', status: 'error', isClosable: true });
    } finally {
      setFavoritingId(null);
    }
  };

  const snaps = selectedProject?.project_snaps || [];
  const techList = useMemo(() => {
    const p = selectedProject;
    if (!p) return [];
    if (Array.isArray(p.technologies)) return p.technologies.filter(Boolean);
    if (typeof p.technologies === 'string')
      return p.technologies.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [selectedProject]);

  if (loading && projects.length === 0) {
    return (
      <AlumniLayout>
        <Box py={16} display="flex" justifyContent="center" alignItems="center" bg={colors.pageBg} minH="80vh">
          <Spinner size="xl" color={colors.accent} thickness="3px" />
        </Box>
      </AlumniLayout>
    );
  }

  return (
    <AlumniLayout>
      <Box bg={colors.pageBg} minH="100vh" py={6}>
        <Container maxW="5xl">
          {/* Header */}
          <Box mb={6}>
            <Heading size="lg" mb={1} color={colors.dark}>
              Student Projects
            </Heading>
            <Text color={colors.secondary}>
              Discover innovative projects from students. Like and support their work.
            </Text>
          </Box>

          {/* Search */}
          <Box mb={6}>
            <InputGroup maxW={{ md: '400px' }} bg="white" borderRadius="xl" boxShadow="sm">
              <InputLeftElement pointerEvents="none" color={colors.secondary}>
                <SearchIcon />
              </InputLeftElement>
              <Input
                placeholder="Search by title, genre, tech stack…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="xl"
                border="1px solid"
                borderColor={colors.border}
                _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
              />
            </InputGroup>
          </Box>

          {/* Featured Carousel */}
          {featuredProjects.length > 0 && (
            <Box mb={10}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" fontWeight="600" color={colors.dark}>
                  Featured Projects
                </Heading>
                <HStack gap={2}>
                  <IconButton
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    borderColor={colors.border}
                    icon={<Icon as={FaChevronLeft} boxSize={3} />}
                    onClick={() => scrollHero(-1)}
                    _hover={{ bg: 'white' }}
                    aria-label="Previous"
                  />
                  <IconButton
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    borderColor={colors.border}
                    icon={<Icon as={FaChevronRight} boxSize={3} />}
                    onClick={() => scrollHero(1)}
                    _hover={{ bg: 'white' }}
                    aria-label="Next"
                  />
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
                          filter="brightness(0.7)"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <Box w="100%" h="100%" bg={colors.secondary} borderRadius="2xl" />
                      )}
                      {/* Like & Favorite buttons on carousel */}
                      <HStack position="absolute" top={4} right={4} spacing={2}>
                        <IconButton
                          icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                          size="md"
                          borderRadius="full"
                          bg="whiteAlpha.900"
                          color={p.is_favorited ? 'orange.500' : colors.secondary}
                          _hover={{ bg: 'white' }}
                          onClick={(e) => handleFavorite(p.id, e)}
                          isLoading={favoritingId === p.id}
                          aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                        />
                        <IconButton
                          icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                          size="md"
                          borderRadius="full"
                          bg="whiteAlpha.900"
                          color={p.is_liked ? 'red.500' : colors.secondary}
                          _hover={{ bg: 'white' }}
                          onClick={(e) => handleLike(p.id, e)}
                          isLoading={likingId === p.id}
                          aria-label={p.is_liked ? 'Unlike' : 'Like'}
                        />
                      </HStack>
                      <Box position="absolute" bottom={6} left={6} color="white" maxW="md">
                        <Text fontWeight="bold" fontSize="xl" lineHeight="tight" mb={1}>
                          {p.title}
                        </Text>
                        <Text fontSize="sm" opacity={0.9}>
                          {p.usn} • {p.genre || '—'}
                        </Text>
                        <HStack mt={2} spacing={4}>
                          <HStack spacing={1}>
                            <Icon as={FaBookmark} boxSize={3} />
                            <Text fontSize="sm">{formatCount(p.favorites_count)}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaHeart} boxSize={3} />
                            <Text fontSize="sm">{formatCount(p.likes_count)}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <ViewIcon boxSize={3} />
                            <Text fontSize="sm">{formatCount(p.views_count)}</Text>
                          </HStack>
                        </HStack>
                      </Box>
                    </Box>
                  );
                })}
              </Flex>
            </Box>
          )}

          {/* Top Liked */}
          {topByLikes.length > 0 && (
            <Box mb={10}>
              <Heading size="md" fontWeight="600" color={colors.dark} mb={4}>
                Most Liked
              </Heading>
              <Box
                display="grid"
                gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
                gap={4}
              >
                {topByLikes.map((p, i) => {
                  const icon = (p.project_snaps || [])[0];
                  return (
                    <Flex
                      key={p.id}
                      align="center"
                      gap={3}
                      p={3}
                      bg="white"
                      borderRadius="xl"
                      cursor="pointer"
                      border="1px solid"
                      borderColor={colors.border}
                      _hover={{ borderColor: colors.accent, boxShadow: 'sm' }}
                      transition="all 0.2s"
                      onClick={() => openDetail(p)}
                    >
                      <Text fontWeight="bold" fontSize="lg" color={colors.secondary} w={5}>
                        {i + 1}
                      </Text>
                      {icon ? (
                        <Box boxSize="56px" flexShrink={0} borderRadius="lg" overflow="hidden">
                          <Image
                            src={getFileUrl(icon)}
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </Box>
                      ) : (
                        <Box boxSize="56px" flexShrink={0} borderRadius="lg" bg={colors.cardBg} />
                      )}
                      <Box flex={1} minW={0}>
                        <Text fontWeight="500" color={colors.dark} noOfLines={1} fontSize="sm">
                          {p.title}
                        </Text>
                        <Text fontSize="xs" color={colors.secondary}>
                          {p.genre || '—'}
                        </Text>
                        <HStack mt={1} spacing={3}>
                          <HStack spacing={1}>
                            <Icon as={FaBookmark} boxSize={2.5} color={p.is_favorited ? 'orange.500' : colors.secondary} />
                            <Text fontSize="xs" color={colors.secondary}>{formatCount(p.favorites_count)}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Icon as={FaHeart} boxSize={2.5} color={p.is_liked ? 'red.500' : colors.secondary} />
                            <Text fontSize="xs" color={colors.secondary}>{formatCount(p.likes_count)}</Text>
                          </HStack>
                        </HStack>
                      </Box>
                      <HStack spacing={1}>
                        <IconButton
                          icon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                          size="sm"
                          variant="ghost"
                          color={p.is_favorited ? 'orange.500' : colors.secondary}
                          _hover={{ color: 'orange.500' }}
                          onClick={(e) => handleFavorite(p.id, e)}
                          isLoading={favoritingId === p.id}
                          aria-label={p.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                        />
                        <IconButton
                          icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                          size="sm"
                          variant="ghost"
                          color={p.is_liked ? 'red.500' : colors.secondary}
                          _hover={{ color: 'red.500' }}
                          onClick={(e) => handleLike(p.id, e)}
                          isLoading={likingId === p.id}
                          aria-label={p.is_liked ? 'Unlike' : 'Like'}
                        />
                      </HStack>
                    </Flex>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* All Projects */}
          <Box>
            <Heading size="md" fontWeight="600" color={colors.dark} mb={4}>
              All Projects
            </Heading>

            {filteredProjects.length === 0 ? (
              <Box bg="white" borderRadius={CARD_RADIUS} p={12} textAlign="center" boxShadow={CARD_SHADOW}>
                <Text color={colors.secondary} fontSize="lg">
                  {projects.length === 0
                    ? 'No projects available yet.'
                    : 'No projects match your search.'}
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {filteredProjects.map((p) => {
                  const icon = (p.project_snaps || [])[0];
                  const screenshots = p.project_snaps || [];
                  const desc = p.one_line_description || p.full_description || 'No description.';
                  return (
                    <Box
                      key={p.id}
                      p={5}
                      borderRadius={CARD_RADIUS}
                      boxShadow={CARD_SHADOW}
                      bg="white"
                      border="1px solid"
                      borderColor={colors.border}
                      _hover={{ borderColor: colors.accent }}
                      transition="all 0.2s"
                    >
                      {/* Card header */}
                      <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        gap={4}
                        mb={3}
                      >
                        <HStack align="center" spacing={4} flex={1} minW={0} cursor="pointer" onClick={() => openDetail(p)}>
                          {icon ? (
                            <Box boxSize="60px" flexShrink={0} borderRadius="lg" overflow="hidden" border="1px solid" borderColor={colors.border}>
                              <Image
                                src={getFileUrl(icon)}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </Box>
                          ) : (
                            <Box boxSize="60px" flexShrink={0} borderRadius="lg" bg={colors.cardBg} />
                          )}
                          <Box minW={0}>
                            <Text fontSize="lg" fontWeight="600" color={colors.dark}>
                              {p.title}
                            </Text>
                            <Text color={colors.accent} fontSize="sm" fontWeight="500">
                              {p.usn}
                            </Text>
                            <Text color={colors.secondary} fontSize="xs">
                              {p.genre || '—'}
                            </Text>
                          </Box>
                        </HStack>
                        <HStack spacing={2}>
                          <Button
                            leftIcon={<Icon as={p.is_favorited ? FaBookmark : FaRegBookmark} />}
                            variant={p.is_favorited ? 'solid' : 'outline'}
                            colorScheme={p.is_favorited ? 'orange' : 'gray'}
                            size="sm"
                            borderRadius="lg"
                            onClick={(e) => handleFavorite(p.id, e)}
                            isLoading={favoritingId === p.id}
                          >
                            {p.is_favorited ? 'Favorited' : 'Favorite'}
                          </Button>
                          <Button
                            leftIcon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                            variant={p.is_liked ? 'solid' : 'outline'}
                            colorScheme={p.is_liked ? 'red' : 'gray'}
                            size="sm"
                            borderRadius="lg"
                            onClick={(e) => handleLike(p.id, e)}
                            isLoading={likingId === p.id}
                          >
                            {p.is_liked ? 'Liked' : 'Like'}
                          </Button>
                          <Button
                            leftIcon={<Icon as={FaUser} />}
                            variant="outline"
                            size="sm"
                            borderRadius="lg"
                            colorScheme="teal"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/placement/alumni-student/${encodeURIComponent(p.usn)}`);
                            }}
                          >
                            View Student
                          </Button>
                          <Button
                            bg={colors.accent}
                            color="white"
                            size="sm"
                            borderRadius="lg"
                            _hover={{ bg: colors.accentHover }}
                            onClick={() => openDetail(p)}
                          >
                            View Details
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Stats */}
                      <Flex gap={6} py={2} flexWrap="wrap">
                        <HStack spacing={1}>
                          <ViewIcon boxSize={3} color={colors.secondary} />
                          <Text fontWeight="600" fontSize="sm" color={colors.dark}>{formatCount(p.views_count)}</Text>
                          <Text fontSize="xs" color={colors.secondary}>views</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FaBookmark} boxSize={3} color={p.is_favorited ? 'orange.500' : colors.secondary} />
                          <Text fontWeight="600" fontSize="sm" color={colors.dark}>{formatCount(p.favorites_count)}</Text>
                          <Text fontSize="xs" color={colors.secondary}>favorites</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FaHeart} boxSize={3} color={p.is_liked ? 'red.500' : colors.secondary} />
                          <Text fontWeight="600" fontSize="sm" color={colors.dark}>{formatCount(p.likes_count)}</Text>
                          <Text fontSize="xs" color={colors.secondary}>likes</Text>
                        </HStack>
                      </Flex>

                      {/* Description */}
                      <Text color={colors.secondary} fontSize="sm" noOfLines={2} mb={3}>
                        {desc}
                      </Text>

                      {/* Screenshots */}
                      {screenshots.length > 0 && (
                        <Flex
                          overflowX="auto"
                          gap={3}
                          py={1}
                          sx={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
                        >
                          {screenshots.slice(0, 4).map((s, i) => (
                            <Box
                              key={i}
                              flex="0 0 auto"
                              w="140px"
                              aspectRatio="16/9"
                              borderRadius="lg"
                              overflow="hidden"
                              border="1px solid"
                              borderColor={colors.border}
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

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedProject(null);
        }}
        size="xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius={CARD_RADIUS} overflow="hidden" maxH="90vh">
          <ModalHeader bg="white" borderBottom="1px" borderColor={colors.border} pb={4}>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between" align="start">
                <Heading size="md" color={colors.dark} noOfLines={2}>
                  {selectedProject?.title}
                </Heading>
                <HStack spacing={2}>
                  <IconButton
                    icon={<Icon as={selectedProject?.is_favorited ? FaBookmark : FaRegBookmark} />}
                    colorScheme={selectedProject?.is_favorited ? 'orange' : 'gray'}
                    variant={selectedProject?.is_favorited ? 'solid' : 'outline'}
                    size="sm"
                    borderRadius="full"
                    onClick={() => selectedProject && handleFavorite(selectedProject.id)}
                    isLoading={favoritingId === selectedProject?.id}
                    aria-label={selectedProject?.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                  />
                  <IconButton
                    icon={<Icon as={selectedProject?.is_liked ? FaHeart : FaRegHeart} />}
                    colorScheme={selectedProject?.is_liked ? 'red' : 'gray'}
                    variant={selectedProject?.is_liked ? 'solid' : 'outline'}
                    size="sm"
                    borderRadius="full"
                    onClick={() => selectedProject && handleLike(selectedProject.id)}
                    isLoading={likingId === selectedProject?.id}
                    aria-label={selectedProject?.is_liked ? 'Unlike' : 'Like'}
                  />
                </HStack>
              </HStack>
              <Text fontSize="sm" color={colors.secondary}>
                {selectedProject?.usn} · {selectedProject?.genre || '—'}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={4} overflowY="auto">
            {selectedProject && (
              <VStack align="stretch" spacing={6}>
                {/* Image Gallery */}
                {snaps.length > 0 && (
                  <Box>
                    <Box borderRadius="xl" overflow="hidden" bg={colors.cardBg} position="relative" aspectRatio="16/9">
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
                            w="70px"
                            aspectRatio="16/9"
                            borderRadius="lg"
                            overflow="hidden"
                            border="2px"
                            borderColor={i === detailSnapIndex ? colors.accent : 'transparent'}
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
                  <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2} textTransform="uppercase">
                    About this project
                  </Text>
                  <Text color={colors.dark} whiteSpace="pre-wrap" fontSize="sm" lineHeight="tall">
                    {selectedProject.full_description || selectedProject.one_line_description || 'No description.'}
                  </Text>
                </Box>

                {/* Stats */}
                <Flex gap={6} flexWrap="wrap">
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600">Rating</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600">Views</Text>
                    <Text fontWeight="600" color={colors.dark}>{selectedProject.views_count ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600">Favorites</Text>
                    <HStack>
                      <Icon as={FaBookmark} color={selectedProject.is_favorited ? 'orange.500' : colors.secondary} />
                      <Text fontWeight="600" color={colors.dark}>{selectedProject.favorites_count ?? 0}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600">Likes</Text>
                    <HStack>
                      <Icon as={FaHeart} color={selectedProject.is_liked ? 'red.500' : colors.secondary} />
                      <Text fontWeight="600" color={colors.dark}>{selectedProject.likes_count ?? 0}</Text>
                    </HStack>
                  </Box>
                </Flex>

                {/* Tech Stack */}
                {techList.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2} textTransform="uppercase">
                      Tech Stack
                    </Text>
                    <Wrap spacing={2}>
                      {techList.map((t, i) => (
                        <WrapItem key={i}>
                          <Tag bg={colors.cardBg} color={colors.dark} borderRadius="full" size="sm" border="1px solid" borderColor={colors.border}>
                            {t}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {selectedProject.mentor_name && (
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600">Mentor</Text>
                    <Text color={colors.dark}>{selectedProject.mentor_name}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg={colors.cardBg} borderTop="1px" borderColor={colors.border} flexWrap="wrap" gap={2}>
            {selectedProject?.hosted_link && (
              <Button
                as={Link}
                href={selectedProject.hosted_link}
                isExternal
                leftIcon={<Icon as={FaExternalLinkAlt} />}
                variant="outline"
                borderColor={colors.accent}
                color={colors.accent}
                size="sm"
                _hover={{ bg: colors.accent, color: 'white', textDecoration: 'none' }}
              >
                Live Demo
              </Button>
            )}
            {selectedProject?.github_repo && (
              <Button
                as={Link}
                href={selectedProject.github_repo}
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
                onClose();
                navigate(`/placement/alumni-student/${encodeURIComponent(selectedProject?.usn)}`);
              }}
            >
              View Student Profile
            </Button>
            <Button
              leftIcon={<Icon as={selectedProject?.is_favorited ? FaBookmark : FaRegBookmark} />}
              colorScheme={selectedProject?.is_favorited ? 'orange' : 'gray'}
              variant={selectedProject?.is_favorited ? 'solid' : 'outline'}
              onClick={() => selectedProject && handleFavorite(selectedProject.id)}
              isLoading={favoritingId === selectedProject?.id}
            >
              {selectedProject?.is_favorited ? 'Favorited' : 'Add to favorites'}
            </Button>
            <Button
              ml="auto"
              leftIcon={<Icon as={selectedProject?.is_liked ? FaHeart : FaRegHeart} />}
              colorScheme={selectedProject?.is_liked ? 'red' : 'gray'}
              variant={selectedProject?.is_liked ? 'solid' : 'outline'}
              onClick={() => selectedProject && handleLike(selectedProject.id)}
              isLoading={likingId === selectedProject?.id}
            >
              {selectedProject?.is_liked ? 'Liked' : 'Like this project'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AlumniLayout>
  );
};

export default AlumniProjects;
