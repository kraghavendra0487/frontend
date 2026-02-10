import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  Image,
  Button,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tag,
  Link,
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaGithub, FaStar, FaEye } from 'react-icons/fa';
import { PlacementService } from '../services/placement.service';
import { getFileUrl } from '../utils/fileUrl';

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  if (!project) return null;
  const snaps = project.project_snaps || project.snaps || [];
  const [aspect, setAspect] = React.useState('laptop');
  const [votes, setVotes] = React.useState({ phone: 0, laptop: 0 });
  let skills = [];
  if (typeof project.skills === 'string') skills = project.skills.split(',').map((s) => s.trim()).filter(Boolean);
  else if (Array.isArray(project.skills)) skills = project.skills;
  else if (Array.isArray(project.technologies)) skills = project.technologies;

  const rating = project.average_rating != null
    ? Number(project.average_rating).toFixed(1)
    : (() => {
        const self = Number(project.self_rating) || 0;
        const admin = project.admin_rating != null ? Number(project.admin_rating) : 0;
        const n = project.admin_rating != null ? 2 : 1;
        return ((self + admin) / n).toFixed(1);
      })();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
      <ModalContent borderRadius="xl" maxW="560px" maxH="85vh" display="flex" flexDirection="column" shadow="xl">
        <ModalHeader>
          <HStack>
            {snaps[0] ? (
              <Image src={getFileUrl(snaps[0])} boxSize="40px" borderRadius="md" objectFit="cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <Box boxSize="40px" bg="orange.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <Icon as={FaStar} color="orange.400" />
              </Box>
            )}
            <Text>{project.title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto" flex="1">
          <VStack align="stretch" spacing={6}>
            {snaps.length > 0 && (
              <Box overflowX="auto" whiteSpace="nowrap" pb={2}>
                <HStack spacing={4}>
                  {snaps.map((snap, i) => (
                    <Box
                      key={i}
                      w="240px"
                      // Same aspect rules as student showcase: phone vs laptop
                      aspectRatio={aspect === 'laptop' ? 16 / 9 : 9 / 16}
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="#020617"
                      bg="#000"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      shadow="sm"
                    >
                      <Image
                        src={getFileUrl(snap)}
                        maxH="100%"
                        maxW="100%"
                        objectFit="contain"
                        alt=""
                        onLoad={(e) => {
                          const img = e.target;
                          const w = img.naturalWidth || 0;
                          const h = img.naturalHeight || 0;
                          if (!w || !h) return;
                          const ratio = w / h;
                          let vote = 'laptop';
                          if (ratio < 1) vote = 'phone';
                          setVotes((prev) => {
                            const next = {
                              phone: prev.phone + (vote === 'phone' ? 1 : 0),
                              laptop: prev.laptop + (vote === 'laptop' ? 1 : 0),
                            };
                            // Majority wins; tie → laptop
                            setAspect(next.laptop >= next.phone ? 'laptop' : 'phone');
                            return next;
                          });
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Box>
                  ))}
                </HStack>
              </Box>
            )}
            <Box>
              <Heading size="sm" mb={2}>Description</Heading>
              <Text color="gray.600" whiteSpace="pre-wrap">
                {project.full_description || project.one_line_description || project.description || 'No description.'}
              </Text>
            </Box>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">VIEWED</Text>
                <HStack>
                  <Icon as={FaEye} color="orange.400" />
                  <Text fontWeight="bold" fontSize="lg">{project.views_count ?? project.view_count ?? 0}</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">GENRE</Text>
                <Text fontWeight="bold">{project.genre || '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="bold">RATING</Text>
                <HStack>
                  <Icon as={FaStar} color="orange.400" />
                  <Text fontWeight="bold">{rating}</Text>
                </HStack>
              </Box>
            </SimpleGrid>
            {skills.length > 0 && (
              <Box>
                <Heading size="sm" mb={2}>Tech Stack</Heading>
                <HStack wrap="wrap">
                  {skills.map((skill, i) => (
                    <Tag key={i} colorScheme="orange" variant="subtle">{skill}</Tag>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter bg="gray.50" borderBottomRadius="xl">
          <HStack w="full" spacing={4} justify="flex-end">
            {project.hosted_link && (
              <Button as={Link} href={project.hosted_link} isExternal colorScheme="green" leftIcon={<FaExternalLinkAlt />} _hover={{ textDecoration: 'none' }}>
                Live Demo
              </Button>
            )}
            {project.github_repo && (
              <Button as={Link} href={project.github_repo} isExternal variant="outline" leftIcon={<FaGithub />} _hover={{ textDecoration: 'none' }}>
                Source Code
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ProjectCard = ({ project, onView }) => {
  const snaps = project.project_snaps || project.snaps || [];
  const icon = snaps.length > 0 ? snaps[0] : null;
  const avg = project.average_rating ?? (project.admin_rating != null ? (Number(project.self_rating) + Number(project.admin_rating)) / 2 : Number(project.self_rating));

  return (
    <Card
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={onView}
    >
      <CardBody p={4}>
        <HStack align="start" spacing={4}>
          {icon ? (
            <Box boxSize="64px" flexShrink={0} borderRadius="xl" overflow="hidden" shadow="sm">
              <Image src={getFileUrl(icon)} w="100%" h="100%" objectFit="cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            </Box>
          ) : (
            <Box boxSize="64px" flexShrink={0} bg="gray.100" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
              <Icon as={FaStar} boxSize={6} color="gray.400" />
            </Box>
          )}
          <VStack align="start" spacing={1} flex={1}>
            <Heading size="sm" noOfLines={1}>{project.title}</Heading>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>{project.genre || '—'}</Text>
            <HStack spacing={2}>
              <HStack spacing={1}>
                <Icon as={FaStar} color="orange.400" boxSize={3} />
                <Text fontSize="xs">{avg.toFixed(1)}</Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">·</Text>
              <HStack spacing={1}>
                <Icon as={FaEye} boxSize={3} color="gray.400" />
                <Text fontSize="xs" color="gray.600">{project.views_count ?? 0} views</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>
        <Text fontSize="sm" color="gray.600" mt={3} noOfLines={2}>
          {project.one_line_description || project.full_description || 'No description available.'}
        </Text>
        <Button mt={4} w="full" size="sm" variant="outline" colorScheme="orange" onClick={(e) => { e.stopPropagation(); onView(); }}>
          View Details
        </Button>
      </CardBody>
    </Card>
  );
};

const ProjectsShowcase = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const all = await PlacementService.getPublicProjects({ limit: 100 });
        setAllProjects(Array.isArray(all) ? all : []);
      } catch (err) {
        console.error('Failed to load projects', err);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openDetail = (project) => {
    setSelectedProject(project);
    onOpen();
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
        <Center flex="1" py={20}>
          <Spinner size="xl" color="#d4a960" />
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="7xl">
        <Heading mb={2} textAlign="center" color="#172e36">Student Projects</Heading>
        <Text mb={10} textAlign="center" color="gray.600">Explore approved student projects</Text>

        {/* Projects grid – same as project page down part */}
        <Heading size="md" mb={4} color="#172e36">All Projects</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {allProjects.map((p) => (
            <ProjectCard key={p.id} project={p} onView={() => openDetail(p)} />
          ))}
        </SimpleGrid>

        {allProjects.length === 0 && !loading && (
          <Center py={16}>
            <Text color="gray.500">No approved projects to show yet.</Text>
          </Center>
        )}

        <ProjectDetailModal project={selectedProject} isOpen={isOpen} onClose={onClose} />
      </Container>
    </Box>
  );
};

export default ProjectsShowcase;
