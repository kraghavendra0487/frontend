import React, { useState, useEffect } from 'react';
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
  Avatar,
  Link,
  Image,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { 
  ArrowBackIcon,
  ExternalLinkIcon,
  DownloadIcon,
  StarIcon,
} from '@chakra-ui/icons';
import { 
  FaUserGraduate, 
  FaGraduationCap,
  FaBriefcase,
  FaProjectDiagram,
  FaCertificate,
  FaGithub,
  FaExternalLinkAlt,
  FaFilePdf,
  FaBook,
  FaLightbulb,
  FaBuilding,
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

const SectionCard = ({ icon, title, children, isEmpty }) => (
  <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
    <CardBody p={6}>
      <HStack spacing={3} mb={5}>
        <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
          <Icon as={icon} color={colors.accent} boxSize={5} />
        </Flex>
        <Text fontWeight="700" color={colors.dark} fontSize="lg">{title}</Text>
      </HStack>
      {isEmpty ? (
        <Text color={colors.secondary} fontSize="sm" textAlign="center" py={4}>
          No information available
        </Text>
      ) : children}
    </CardBody>
  </Card>
);

const CompanyStudentView = () => {
  const { usn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [usn]);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.getStudentProfile(usn);
      setStudent(data);
    } catch (err) {
      toast({
        title: 'Failed to load student profile',
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

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </CompanyLayout>
    );
  }

  if (!student) {
    return (
      <CompanyLayout>
        <Container maxW="1200px" py={8}>
          <VStack spacing={4}>
            <Text>Student not found</Text>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </VStack>
        </Container>
      </CompanyLayout>
    );
  }

  const profileImageUrl = student.profile_image ? getFileUrl(student.profile_image) : null;
  const resumeUrl = student.profile?.resume_file ? getFileUrl(student.profile.resume_file) : null;

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1200px">
          {/* Header */}
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            size="sm"
            mb={4}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          {/* Profile Header Card */}
          <Card bg="white" borderRadius="2xl" boxShadow="md" border="1px solid" borderColor={colors.border} mb={6}>
            <CardBody p={8}>
              <Flex gap={6} align="start" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                <Avatar
                  size="2xl"
                  name={student.full_name}
                  src={profileImageUrl}
                  bg={colors.dark}
                  color="white"
                  border="4px solid white"
                  boxShadow="lg"
                />
                <Box flex="1">
                  <Heading size="xl" color={colors.dark} mb={2}>
                    {student.full_name}
                  </Heading>
                  <HStack spacing={3} mb={3} flexWrap="wrap">
                    <Badge bg={colors.accentLight} color={colors.accent} fontSize="sm" px={3} py={1} borderRadius="full">
                      {student.program_name || 'Program'}
                    </Badge>
                    {student.specialization_name && (
                      <Badge colorScheme="purple" fontSize="sm" borderRadius="full">
                        {student.specialization_name}
                      </Badge>
                    )}
                    <Badge colorScheme="blue" fontSize="sm" borderRadius="full">
                      Year {student.current_year}
                    </Badge>
                  </HStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={colors.secondary}>
                      <Icon as={FaGraduationCap} mr={2} />
                      {student.school_name || 'School'}
                    </Text>
                    <Text fontSize="sm" color={colors.secondary}>
                      Joined {student.year_of_joining}
                    </Text>
                  </VStack>
                </Box>
                {resumeUrl && (
                  <Button
                    as="a"
                    href={resumeUrl}
                    target="_blank"
                    leftIcon={<Icon as={FaFilePdf} />}
                    bg={colors.dark}
                    color="white"
                    _hover={{ bg: colors.darkBlue }}
                    size="lg"
                    borderRadius="xl"
                  >
                    View Resume
                  </Button>
                )}
              </Flex>
            </CardBody>
          </Card>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Profile Summary */}
            <SectionCard 
              icon={FaLightbulb} 
              title="Profile Summary"
              isEmpty={!student.profile?.brief_summary && !student.profile?.career_objective}
            >
              {student.profile?.brief_summary && (
                <Box mb={4}>
                  <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2}>ABOUT</Text>
                  <Text fontSize="sm" color={colors.dark} lineHeight="1.7">
                    {student.profile.brief_summary}
                  </Text>
                </Box>
              )}
              {student.profile?.key_expertise && (
                <Box mb={4}>
                  <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2}>KEY EXPERTISE</Text>
                  <Text fontSize="sm" color={colors.dark} lineHeight="1.7">
                    {student.profile.key_expertise}
                  </Text>
                </Box>
              )}
              {student.profile?.career_objective && (
                <Box>
                  <Text fontSize="xs" color={colors.secondary} fontWeight="600" mb={2}>CAREER OBJECTIVE</Text>
                  <Text fontSize="sm" color={colors.dark} lineHeight="1.7">
                    {student.profile.career_objective}
                  </Text>
                </Box>
              )}
            </SectionCard>

            {/* Education */}
            <SectionCard 
              icon={FaBook} 
              title="Education History"
              isEmpty={!student.education || student.education.length === 0}
            >
              <VStack spacing={4} align="stretch">
                {student.education?.map((edu, idx) => (
                  <Box key={idx} p={4} bg={colors.pageBg} borderRadius="xl">
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme="blue" borderRadius="full">
                        {edu.education_level}
                      </Badge>
                      <Text fontSize="sm" color={colors.secondary}>{edu.year_of_passing}</Text>
                    </HStack>
                    <Text fontWeight="600" color={colors.dark} fontSize="sm">{edu.institute_name}</Text>
                    {edu.result && (
                      <Text fontSize="sm" color={colors.accent} fontWeight="600">
                        {edu.result} {edu.result_type}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </SectionCard>

            {/* Projects - Full Width */}
            <Box gridColumn={{ lg: 'span 2' }}>
              <SectionCard 
                icon={FaProjectDiagram} 
                title={`Projects (${student.projects?.length || 0})`}
                isEmpty={!student.projects || student.projects.length === 0}
              >
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {student.projects?.map((project) => (
                    <Card 
                      key={project.id} 
                      border="1px solid" 
                      borderColor={colors.border} 
                      borderRadius="xl"
                      _hover={{ borderColor: colors.accent, transform: 'translateY(-2px)' }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        {/* Project Snapshot */}
                        {project.project_snaps && project.project_snaps.length > 0 && (
                          <Image
                            src={getFileUrl(project.project_snaps[0])}
                            alt={project.title}
                            borderRadius="lg"
                            mb={3}
                            h="150px"
                            w="100%"
                            objectFit="cover"
                          />
                        )}
                        <Heading size="sm" color={colors.dark} mb={2}>{project.title}</Heading>
                        <Text fontSize="sm" color={colors.secondary} mb={3} noOfLines={2}>
                          {project.one_line_description}
                        </Text>
                        
                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                          <Wrap spacing={1} mb={3}>
                            {project.technologies.slice(0, 4).map((tech, idx) => (
                              <WrapItem key={idx}>
                                <Badge size="sm" colorScheme="gray" borderRadius="full">
                                  {tech}
                                </Badge>
                              </WrapItem>
                            ))}
                            {project.technologies.length > 4 && (
                              <WrapItem>
                                <Badge size="sm" colorScheme="gray" borderRadius="full">
                                  +{project.technologies.length - 4}
                                </Badge>
                              </WrapItem>
                            )}
                          </Wrap>
                        )}

                        {/* Rating & Links */}
                        <HStack justify="space-between" mt={2}>
                          <HStack spacing={1}>
                            <StarIcon color={colors.accent} boxSize={3} />
                            <Text fontSize="sm" fontWeight="600" color={colors.dark}>
                              {project.self_rating}/10
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            {project.github_repo && (
                              <Link href={project.github_repo} isExternal>
                                <Icon as={FaGithub} color={colors.secondary} _hover={{ color: colors.dark }} />
                              </Link>
                            )}
                            {project.hosted_link && (
                              <Link href={project.hosted_link} isExternal>
                                <Icon as={FaExternalLinkAlt} color={colors.secondary} _hover={{ color: colors.accent }} />
                              </Link>
                            )}
                          </HStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </SectionCard>
            </Box>

            {/* Internships */}
            <SectionCard 
              icon={FaBriefcase} 
              title={`Internships (${(student.internships?.length || 0) + (student.summer_internships?.length || 0)})`}
              isEmpty={(!student.internships || student.internships.length === 0) && (!student.summer_internships || student.summer_internships.length === 0)}
            >
              <VStack spacing={4} align="stretch">
                {student.internships?.map((intern, idx) => (
                  <Box key={`int-${idx}`} p={4} bg={colors.pageBg} borderRadius="xl">
                    <Heading size="sm" color={colors.dark} mb={1}>{intern.job_role}</Heading>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaBuilding} color={colors.accent} boxSize={3} />
                      <Text fontSize="sm" fontWeight="500" color={colors.dark}>{intern.organization}</Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.secondary}>
                      {formatDate(intern.start_date)} - {formatDate(intern.end_date)}
                      {intern.duration_months && ` (${intern.duration_months} months)`}
                    </Text>
                    {intern.skills && (
                      <Text fontSize="xs" color={colors.secondary} mt={2}>
                        <strong>Skills:</strong> {intern.skills}
                      </Text>
                    )}
                  </Box>
                ))}
                {student.summer_internships?.map((intern, idx) => (
                  <Box key={`summer-${idx}`} p={4} bg={colors.pageBg} borderRadius="xl">
                    <HStack justify="space-between" mb={1}>
                      <Heading size="sm" color={colors.dark}>{intern.job_role}</Heading>
                      <Badge colorScheme="orange" fontSize="xs">Summer</Badge>
                    </HStack>
                    <HStack spacing={2} mb={2}>
                      <Icon as={FaBuilding} color={colors.accent} boxSize={3} />
                      <Text fontSize="sm" fontWeight="500" color={colors.dark}>{intern.organization}</Text>
                    </HStack>
                    <Text fontSize="xs" color={colors.secondary}>
                      {formatDate(intern.start_date)} - {formatDate(intern.end_date)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </SectionCard>

            {/* Certifications */}
            <SectionCard 
              icon={FaCertificate} 
              title={`Certifications (${student.certifications?.length || 0})`}
              isEmpty={!student.certifications || student.certifications.length === 0}
            >
              <VStack spacing={3} align="stretch">
                {student.certifications?.map((cert, idx) => (
                  <Box key={idx} p={4} bg={colors.pageBg} borderRadius="xl">
                    <Heading size="sm" color={colors.dark} mb={1}>{cert.title}</Heading>
                    <Text fontSize="sm" color={colors.secondary}>{cert.organization}</Text>
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="xs" color={colors.secondary}>
                        Issued: {formatDate(cert.issue_date)}
                      </Text>
                      {cert.score && (
                        <Badge colorScheme="green" fontSize="xs">{cert.score}</Badge>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </SectionCard>

            {/* Capstone */}
            {student.capstone && student.capstone.length > 0 && (
              <SectionCard icon={FaGraduationCap} title="Capstone / Final Year Project">
                <VStack spacing={4} align="stretch">
                  {student.capstone.map((cap, idx) => (
                    <Box key={idx} p={4} bg={colors.pageBg} borderRadius="xl">
                      <HStack spacing={2} mb={2}>
                        <Icon as={FaBuilding} color={colors.accent} />
                        <Heading size="sm" color={colors.dark}>{cap.company_name}</Heading>
                      </HStack>
                      <Text fontSize="sm" fontWeight="500" color={colors.dark}>{cap.designation}</Text>
                      <Text fontSize="xs" color={colors.secondary} mt={1}>
                        {cap.internship_duration_months} months • {cap.academic_year}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </SectionCard>
            )}
          </SimpleGrid>
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyStudentView;
