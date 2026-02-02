import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  useToast,
  HStack,
  Button,
  Flex,
  Badge,
  Wrap,
  Icon,
  Image,
  Link,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tag,
  WrapItem,
  IconButton,
  Container,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ViewIcon, StarIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  FaPhone,
  FaEnvelope,
  FaFileAlt,
  FaExternalLinkAlt,
  FaGithub,
  FaLinkedin,
  FaHeart,
  FaRegHeart,
  FaGlobe,
  FaTwitter,
  FaInstagram,
  FaDownload,
} from 'react-icons/fa';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';
import { getFileUrl } from '../../utils/fileUrl';

// Color palette
const colors = {
  accent: '#d4a960',
  accentHover: '#c4983f',
  dark: '#1a202c',
  darkBlue: '#172e36',
  secondary: '#64748b',
  cardBg: '#ffffff',
  pageBg: '#f1f5f9',
  border: '#e2e8f0',
  lightAccent: '#fef7e7',
};

const CARD_RADIUS = '20px';
const CARD_SHADOW = '0 4px 20px rgba(0,0,0,0.08)';

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
          color={i <= Math.round(filled) ? 'yellow.400' : 'gray.300'}
        />
      ))}
      <Text fontSize="sm" fontWeight="600" ml={1} color={colors.dark}>
        {typeof value === 'number' ? value.toFixed(1) : '—'}
      </Text>
    </HStack>
  );
}

// Get icon for social link
function getSocialIcon(url, name) {
  const lowerUrl = (url || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();
  if (lowerUrl.includes('linkedin') || lowerName.includes('linkedin')) return FaLinkedin;
  if (lowerUrl.includes('github') || lowerName.includes('github')) return FaGithub;
  if (lowerUrl.includes('twitter') || lowerName.includes('twitter')) return FaTwitter;
  if (lowerUrl.includes('instagram') || lowerName.includes('instagram')) return FaInstagram;
  return FaGlobe;
}

// Get color for social link
function getSocialColor(url, name) {
  const lowerUrl = (url || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();
  if (lowerUrl.includes('linkedin') || lowerName.includes('linkedin')) return '#0077b5';
  if (lowerUrl.includes('github') || lowerName.includes('github')) return '#333';
  if (lowerUrl.includes('twitter') || lowerName.includes('twitter')) return '#1DA1F2';
  if (lowerUrl.includes('instagram') || lowerName.includes('instagram')) return '#E4405F';
  return colors.accent;
}

const AlumniViewStudent = () => {
  const { usn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailSnapIndex, setDetailSnapIndex] = useState(0);
  const [likingId, setLikingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!usn) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await PlacementService.getStudentProfileForAlumni(decodeURIComponent(usn));
        if (!cancelled) setProfile(data);
      } catch (e) {
        if (!cancelled) {
          toast({
            title: 'Failed to load student',
            description: e?.message || 'Student not found.',
            status: 'error',
            isClosable: true,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [usn, toast]);

  const openDetail = async (project) => {
    setSelectedProject(project);
    setDetailSnapIndex(0);
    onOpen();
    
    try {
      await PlacementService.incrementProjectView(project.id);
      setProfile((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === project.id ? { ...p, views_count: (p.views_count || 0) + 1 } : p
        ),
      }));
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
      setProfile((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? { ...p, is_liked: result.is_liked, likes_count: result.likes_count }
            : p
        ),
      }));
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

  const snaps = selectedProject?.project_snaps || [];
  const techList = useMemo(() => {
    const p = selectedProject;
    if (!p) return [];
    if (Array.isArray(p.technologies)) return p.technologies.filter(Boolean);
    if (typeof p.technologies === 'string')
      return p.technologies.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [selectedProject]);

  if (loading) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="calc(100vh - 72px)" bg={colors.pageBg}>
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </AlumniLayout>
    );
  }

  if (!profile) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="calc(100vh - 72px)" bg={colors.pageBg} direction="column" gap={4}>
          <Text color="gray.500" fontSize="lg">Student not found.</Text>
          <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate('/placement/alumni-projects')} bg={colors.accent} color="white" _hover={{ bg: colors.accentHover }}>
            Back to Projects
          </Button>
        </Flex>
      </AlumniLayout>
    );
  }

  const personal = profile.personal || {};
  const projects = profile.projects || [];
  const career = profile.career || {};
  const resumeFile = profile.resume_file || career?.resume_file;

  // Parse social links
  const socialLinks = [];
  if (personal.social_links) {
    if (Array.isArray(personal.social_links)) {
      personal.social_links.forEach((item, idx) => {
        if (typeof item === 'string') {
          socialLinks.push({ key: idx, url: item, name: '' });
        } else if (item?.url) {
          socialLinks.push({ key: idx, url: item.url, name: item.name || '' });
        }
      });
    } else if (typeof personal.social_links === 'object') {
      Object.entries(personal.social_links).forEach(([key, val]) => {
        const url = typeof val === 'string' ? val : val?.url;
        const name = typeof val === 'object' ? val?.name : key;
        if (url) socialLinks.push({ key, url, name });
      });
    }
  }

  return (
    <AlumniLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="950px">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeftIcon boxSize={5} />}
            onClick={() => navigate(-1)}
            mb={6}
            color={colors.secondary}
            fontWeight="500"
            _hover={{ color: colors.dark, bg: 'white' }}
          >
            Back to Projects
          </Button>

          {/* Student Profile Card */}
          <Box
            bg={colors.cardBg}
            borderRadius={CARD_RADIUS}
            boxShadow={CARD_SHADOW}
            overflow="hidden"
            mb={10}
          >
            {/* Header Banner */}
            <Box
              bgGradient={`linear(135deg, ${colors.darkBlue} 0%, #2c5261 100%)`}
              h="100px"
              position="relative"
            />

            {/* Profile Content */}
            <Box px={8} pb={8} mt="-50px">
              <Flex gap={6} align="flex-start" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                {/* Profile Image */}
                <Avatar
                  size="2xl"
                  name={personal.full_name}
                  src={personal.profile_image ? getFileUrl(personal.profile_image) : undefined}
                  bg={colors.accent}
                  color="white"
                  border="5px solid white"
                  boxShadow="0 4px 15px rgba(0,0,0,0.15)"
                  mt={0}
                />

                {/* Student Info */}
                <Box flex="1" minW="280px" pt={14}>
                  <Heading size="xl" color={colors.dark} mb={2} fontWeight="700">
                    {personal.full_name}
                  </Heading>
                  
                  {/* Program, School, Year Badges */}
                  <Flex gap={2} mb={5} flexWrap="wrap">
                    {personal.programName && (
                      <Badge 
                        bg="#e9d8fd" 
                        color="#6b46c1" 
                        fontSize="sm" 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        fontWeight="600"
                      >
                        {personal.programName}
                      </Badge>
                    )}
                    {personal.schoolName && (
                      <Badge 
                        bg="#c6f6d5" 
                        color="#276749" 
                        fontSize="sm" 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        fontWeight="600"
                      >
                        {personal.schoolName}
                      </Badge>
                    )}
                    {personal.year_of_joining && (
                      <Badge 
                        bg="#e2e8f0" 
                        color="#4a5568" 
                        fontSize="sm" 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        fontWeight="600"
                      >
                        Batch {personal.year_of_joining}
                      </Badge>
                    )}
                    {personal.current_year && (
                      <Badge 
                        bg="#bee3f8" 
                        color="#2b6cb0" 
                        fontSize="sm" 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        fontWeight="600"
                        border="1px solid #90cdf4"
                      >
                        Year {personal.current_year}
                      </Badge>
                    )}
                  </Flex>

                  {/* Contact Details Grid */}
                  <Box 
                    bg={colors.pageBg} 
                    borderRadius="xl" 
                    p={5} 
                    mb={5}
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Phone - Always show */}
                      <HStack spacing={4}>
                        <Flex 
                          w="36px" 
                          h="36px" 
                          bg={personal.phone_number ? colors.lightAccent : '#f0f0f0'} 
                          borderRadius="lg" 
                          align="center" 
                          justify="center"
                        >
                          <Icon as={FaPhone} color={personal.phone_number ? colors.accent : colors.secondary} boxSize={4} />
                        </Flex>
                        <Box>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="500">Phone</Text>
                          {personal.phone_number ? (
                            <Text color={colors.dark} fontSize="sm" fontWeight="600">
                              {personal.phone_country_code || '+91'} {personal.phone_number}
                            </Text>
                          ) : (
                            <Text color={colors.secondary} fontSize="sm" fontStyle="italic">
                              Not provided
                            </Text>
                          )}
                        </Box>
                      </HStack>
                      
                      {/* College Email */}
                      <HStack spacing={4}>
                        <Flex 
                          w="36px" 
                          h="36px" 
                          bg={colors.lightAccent} 
                          borderRadius="lg" 
                          align="center" 
                          justify="center"
                        >
                          <Icon as={FaEnvelope} color={colors.accent} boxSize={4} />
                        </Flex>
                        <Box flex="1" minW={0}>
                          <Text fontSize="xs" color={colors.secondary} fontWeight="500">College Email</Text>
                          {personal.college_email ? (
                            <Link 
                              href={`mailto:${personal.college_email}`} 
                              color={colors.dark} 
                              fontSize="sm" 
                              fontWeight="600" 
                              _hover={{ color: colors.accent }}
                              isTruncated
                              display="block"
                            >
                              {personal.college_email}
                            </Link>
                          ) : (
                            <Text color={colors.secondary} fontSize="sm" fontStyle="italic">
                              Not provided
                            </Text>
                          )}
                        </Box>
                      </HStack>

                      {/* Personal Email - Show if different from college email */}
                      {(personal.personal_email || !personal.college_email) && (
                        <HStack spacing={4}>
                          <Flex 
                            w="36px" 
                            h="36px" 
                            bg={personal.personal_email ? '#f0f0f0' : '#f5f5f5'} 
                            borderRadius="lg" 
                            align="center" 
                            justify="center"
                          >
                            <Icon as={FaEnvelope} color={colors.secondary} boxSize={4} />
                          </Flex>
                          <Box flex="1" minW={0}>
                            <Text fontSize="xs" color={colors.secondary} fontWeight="500">Personal Email</Text>
                            {personal.personal_email ? (
                              <Link 
                                href={`mailto:${personal.personal_email}`} 
                                color={colors.dark} 
                                fontSize="sm" 
                                fontWeight="600" 
                                _hover={{ color: colors.accent }}
                                isTruncated
                                display="block"
                              >
                                {personal.personal_email}
                              </Link>
                            ) : (
                              <Text color={colors.secondary} fontSize="sm" fontStyle="italic">
                                Not provided
                              </Text>
                            )}
                          </Box>
                        </HStack>
                      )}
                    </VStack>
                  </Box>

                  {/* Social Links */}
                  {socialLinks.length > 0 && (
                    <Box mb={5}>
                      <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={3} textTransform="uppercase" letterSpacing="wider">
                        Connect
                      </Text>
                      <Flex gap={3} flexWrap="wrap">
                        {socialLinks.map(({ key, url, name }) => {
                          const IconComponent = getSocialIcon(url, name);
                          const iconColor = getSocialColor(url, name);
                          const displayName = name && !name.startsWith('http') && isNaN(Number(name)) 
                            ? name.charAt(0).toUpperCase() + name.slice(1) 
                            : url.includes('linkedin') ? 'LinkedIn' 
                            : url.includes('github') ? 'GitHub' 
                            : url.includes('twitter') ? 'Twitter'
                            : 'Website';
                          return (
                            <Link key={key} href={url} isExternal _hover={{ textDecoration: 'none' }}>
                              <HStack
                                spacing={2}
                                px={4}
                                py={2}
                                bg="white"
                                borderRadius="full"
                                borderWidth="2px"
                                borderColor={colors.border}
                                _hover={{ 
                                  borderColor: iconColor, 
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'md'
                                }}
                                transition="all 0.2s"
                              >
                                <Icon as={IconComponent} boxSize={4} color={iconColor} />
                                <Text fontSize="sm" fontWeight="600" color={colors.dark}>{displayName}</Text>
                                <Icon as={ExternalLinkIcon} boxSize={3} color={colors.secondary} />
                              </HStack>
                            </Link>
                          );
                        })}
                      </Flex>
                    </Box>
                  )}

                  {/* Resume Button */}
                  <Box>
                    {resumeFile ? (
                      <Button
                        as="a"
                        href={getFileUrl(resumeFile)}
                        target="_blank"
                        leftIcon={<FaDownload />}
                        bg={colors.darkBlue}
                        color="white"
                        size="lg"
                        borderRadius="xl"
                        px={8}
                        fontWeight="600"
                        _hover={{ 
                          bg: '#1e3a47',
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg'
                        }}
                        transition="all 0.2s"
                      >
                        Download Resume
                      </Button>
                    ) : (
                      <HStack 
                        spacing={3} 
                        bg={colors.pageBg} 
                        px={5} 
                        py={3} 
                        borderRadius="xl"
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor={colors.border}
                      >
                        <Icon as={FaFileAlt} color={colors.secondary} boxSize={5} />
                        <Text fontSize="sm" color={colors.secondary} fontWeight="500">
                          No resume uploaded yet
                        </Text>
                      </HStack>
                    )}
                  </Box>
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* Projects Section */}
          <Box>
            <HStack justify="space-between" align="center" mb={6}>
              <Heading size="lg" fontWeight="700" color={colors.dark}>
                Projects
              </Heading>
              {projects.length > 0 && (
                <Badge 
                  bg={colors.accent} 
                  color="white" 
                  fontSize="md" 
                  px={4} 
                  py={1} 
                  borderRadius="full"
                >
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </Badge>
              )}
            </HStack>

            {projects.length === 0 ? (
              <Box 
                bg="white" 
                borderRadius={CARD_RADIUS} 
                p={16} 
                textAlign="center" 
                boxShadow={CARD_SHADOW}
              >
                <Icon as={FaFileAlt} boxSize={12} color={colors.border} mb={4} />
                <Text color={colors.secondary} fontSize="lg" fontWeight="500">
                  No public projects available
                </Text>
              </Box>
            ) : (
              <VStack spacing={5} align="stretch">
                {projects.map((p) => {
                  const icon = (p.project_snaps || [])[0];
                  const screenshots = p.project_snaps || [];
                  const avg = avgRating(p);
                  const desc = p.one_line_description || p.full_description || 'No description.';
                  return (
                    <Box
                      key={p.id}
                      p={6}
                      borderRadius={CARD_RADIUS}
                      boxShadow={CARD_SHADOW}
                      bg="white"
                      border="2px solid"
                      borderColor="transparent"
                      _hover={{ borderColor: colors.accent, transform: 'translateY(-2px)' }}
                      transition="all 0.25s"
                      cursor="pointer"
                      onClick={() => openDetail(p)}
                    >
                      {/* Card header */}
                      <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        gap={4}
                        mb={4}
                      >
                        <HStack align="center" spacing={4} flex={1} minW={0}>
                          {icon ? (
                            <Box 
                              boxSize="70px" 
                              flexShrink={0} 
                              borderRadius="xl" 
                              overflow="hidden" 
                              boxShadow="md"
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
                            <Flex 
                              boxSize="70px" 
                              flexShrink={0} 
                              borderRadius="xl" 
                              bg={colors.pageBg}
                              align="center"
                              justify="center"
                            >
                              <Icon as={FaFileAlt} boxSize={6} color={colors.secondary} />
                            </Flex>
                          )}
                          <Box minW={0}>
                            <Text fontSize="xl" fontWeight="700" color={colors.dark} mb={1}>
                              {p.title}
                            </Text>
                            <Badge 
                              bg={colors.lightAccent} 
                              color={colors.accent} 
                              fontSize="xs"
                              px={2}
                              py={0.5}
                              borderRadius="md"
                              fontWeight="600"
                            >
                              {p.genre || 'Project'}
                            </Badge>
                          </Box>
                        </HStack>
                        <HStack spacing={3} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            icon={<Icon as={p.is_liked ? FaHeart : FaRegHeart} />}
                            variant={p.is_liked ? 'solid' : 'outline'}
                            colorScheme={p.is_liked ? 'red' : 'gray'}
                            size="md"
                            borderRadius="xl"
                            onClick={(e) => handleLike(p.id, e)}
                            isLoading={likingId === p.id}
                            aria-label={p.is_liked ? 'Unlike' : 'Like'}
                          />
                          <Button
                            bg={colors.accent}
                            color="white"
                            size="md"
                            borderRadius="xl"
                            px={6}
                            fontWeight="600"
                            _hover={{ bg: colors.accentHover }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(p);
                            }}
                          >
                            View Details
                          </Button>
                        </HStack>
                      </Flex>

                      {/* Stats */}
                      <Flex gap={8} py={3} flexWrap="wrap" borderBottomWidth="1px" borderColor={colors.border} mb={4}>
                        <HStack spacing={2}>
                          <StarIcon boxSize={4} color={colors.accent} />
                          <Text fontWeight="700" fontSize="md" color={colors.dark}>{avg.toFixed(1)}</Text>
                          <Text fontSize="sm" color={colors.secondary}>rating</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <ViewIcon boxSize={4} color={colors.secondary} />
                          <Text fontWeight="700" fontSize="md" color={colors.dark}>{formatCount(p.views_count)}</Text>
                          <Text fontSize="sm" color={colors.secondary}>views</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Icon as={FaHeart} boxSize={4} color={p.is_liked ? 'red.500' : colors.secondary} />
                          <Text fontWeight="700" fontSize="md" color={colors.dark}>{formatCount(p.likes_count)}</Text>
                          <Text fontSize="sm" color={colors.secondary}>likes</Text>
                        </HStack>
                      </Flex>

                      {/* Description */}
                      <Text color={colors.secondary} fontSize="md" noOfLines={2} mb={4} lineHeight="1.6">
                        {desc}
                      </Text>

                      {/* Screenshots */}
                      {screenshots.length > 0 && (
                        <Flex
                          overflowX="auto"
                          gap={3}
                          pb={2}
                          mb={3}
                          sx={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { bg: colors.border, borderRadius: 'full' } }}
                        >
                          {screenshots.slice(0, 5).map((s, i) => (
                            <Box
                              key={i}
                              flex="0 0 auto"
                              w="160px"
                              h="90px"
                              borderRadius="xl"
                              overflow="hidden"
                              boxShadow="sm"
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

                      {/* Tech Stack */}
                      {p.technologies && p.technologies.length > 0 && (
                        <Wrap spacing={2}>
                          {(Array.isArray(p.technologies) ? p.technologies : []).map((tech, idx) => (
                            <Tag 
                              key={idx} 
                              size="md" 
                              bg={colors.pageBg}
                              color={colors.dark}
                              borderRadius="full"
                              fontWeight="500"
                              px={3}
                            >
                              {tech}
                            </Tag>
                          ))}
                        </Wrap>
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
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" maxH="90vh">
          <ModalHeader bg="white" borderBottom="1px" borderColor={colors.border} pb={4}>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between" align="start">
                <Heading size="lg" color={colors.dark} noOfLines={2} fontWeight="700">
                  {selectedProject?.title}
                </Heading>
                <IconButton
                  icon={<Icon as={selectedProject?.is_liked ? FaHeart : FaRegHeart} boxSize={5} />}
                  colorScheme={selectedProject?.is_liked ? 'red' : 'gray'}
                  variant={selectedProject?.is_liked ? 'solid' : 'outline'}
                  size="md"
                  borderRadius="full"
                  onClick={() => selectedProject && handleLike(selectedProject.id)}
                  isLoading={likingId === selectedProject?.id}
                  aria-label={selectedProject?.is_liked ? 'Unlike' : 'Like'}
                />
              </HStack>
              <Badge 
                bg={colors.lightAccent} 
                color={colors.accent} 
                alignSelf="flex-start"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="600"
              >
                {selectedProject?.genre || 'Project'}
              </Badge>
            </VStack>
          </ModalHeader>
          <ModalCloseButton size="lg" />
          <ModalBody py={6} overflowY="auto">
            {selectedProject && (
              <VStack align="stretch" spacing={6}>
                {/* Image Gallery */}
                {snaps.length > 0 && (
                  <Box>
                    <Box borderRadius="xl" overflow="hidden" bg={colors.pageBg} position="relative" aspectRatio="16/9" boxShadow="md">
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
                      <HStack mt={3} spacing={2} overflowX="auto" py={1}>
                        {snaps.map((s, i) => (
                          <Box
                            key={i}
                            as="button"
                            flexShrink={0}
                            w="80px"
                            h="50px"
                            borderRadius="lg"
                            overflow="hidden"
                            border="3px solid"
                            borderColor={i === detailSnapIndex ? colors.accent : 'transparent'}
                            opacity={i === detailSnapIndex ? 1 : 0.7}
                            _hover={{ opacity: 1 }}
                            transition="all 0.2s"
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
                  <Text fontSize="sm" color={colors.secondary} fontWeight="700" mb={2} textTransform="uppercase" letterSpacing="wider">
                    About this project
                  </Text>
                  <Text color={colors.dark} whiteSpace="pre-wrap" fontSize="md" lineHeight="1.8">
                    {selectedProject.full_description || selectedProject.one_line_description || 'No description.'}
                  </Text>
                </Box>

                {/* Stats */}
                <Flex gap={8} flexWrap="wrap" bg={colors.pageBg} p={4} borderRadius="xl">
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>Rating</Text>
                    <StarDisplay value={avgRating(selectedProject)} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>Views</Text>
                    <Text fontWeight="700" fontSize="lg" color={colors.dark}>{selectedProject.views_count ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={1}>Likes</Text>
                    <HStack>
                      <Icon as={FaHeart} color={selectedProject.is_liked ? 'red.500' : colors.secondary} />
                      <Text fontWeight="700" fontSize="lg" color={colors.dark}>{selectedProject.likes_count ?? 0}</Text>
                    </HStack>
                  </Box>
                </Flex>

                {/* Tech Stack */}
                {techList.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color={colors.secondary} fontWeight="700" mb={3} textTransform="uppercase" letterSpacing="wider">
                      Tech Stack
                    </Text>
                    <Wrap spacing={2}>
                      {techList.map((t, i) => (
                        <WrapItem key={i}>
                          <Tag 
                            bg="white" 
                            color={colors.dark} 
                            borderRadius="full" 
                            size="lg" 
                            border="2px solid" 
                            borderColor={colors.border}
                            fontWeight="500"
                            px={4}
                          >
                            {t}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {selectedProject.mentor_name && (
                  <Box>
                    <Text fontSize="sm" color={colors.secondary} fontWeight="700" mb={1}>Mentor</Text>
                    <Text color={colors.dark} fontWeight="500">{selectedProject.mentor_name}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg={colors.pageBg} borderTop="1px" borderColor={colors.border} flexWrap="wrap" gap={3} py={4}>
            {selectedProject?.hosted_link && (
              <Button
                as={Link}
                href={selectedProject.hosted_link}
                isExternal
                leftIcon={<Icon as={FaExternalLinkAlt} />}
                bg={colors.accent}
                color="white"
                size="md"
                borderRadius="xl"
                _hover={{ bg: colors.accentHover, textDecoration: 'none' }}
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
                size="md"
                borderRadius="xl"
                borderWidth="2px"
                _hover={{ textDecoration: 'none', bg: 'white' }}
              >
                Source Code
              </Button>
            )}
            <Button
              ml="auto"
              leftIcon={<Icon as={selectedProject?.is_liked ? FaHeart : FaRegHeart} />}
              colorScheme={selectedProject?.is_liked ? 'red' : 'gray'}
              variant={selectedProject?.is_liked ? 'solid' : 'outline'}
              size="md"
              borderRadius="xl"
              onClick={() => selectedProject && handleLike(selectedProject.id)}
              isLoading={likingId === selectedProject?.id}
            >
              {selectedProject?.is_liked ? 'Liked' : 'Like'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AlumniLayout>
  );
};

export default AlumniViewStudent;
