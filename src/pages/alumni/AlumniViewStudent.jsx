import React, { useState, useEffect } from 'react';
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
  SimpleGrid,
  Grid,
  Select,
  Wrap,
  Icon,
  Image,
  Link,
  Avatar,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import {
  FaUser,
  FaAddressBook,
  FaBriefcase,
  FaGraduationCap,
  FaProjectDiagram,
  FaChalkboardTeacher,
  FaCertificate,
  FaBook,
  FaMedal,
  FaList,
  FaFileAlt,
  FaChartPie,
  FaExternalLinkAlt,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';
import { getFileUrl } from '../../utils/fileUrl';

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: FaChartPie },
  { id: 'personal', label: 'Basic Info', icon: FaUser },
  { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
  { id: 'internships', label: 'Internships', icon: FaBriefcase },
  { id: 'education', label: 'Education', icon: FaGraduationCap },
  { id: 'trainings', label: 'Trainings', icon: FaChalkboardTeacher },
  { id: 'certifications', label: 'Certifications', icon: FaCertificate },
  { id: 'publications', label: 'Publications', icon: FaBook },
  { id: 'extra', label: 'Extra-Curricular', icon: FaMedal },
  { id: 'other', label: 'Other Experiences', icon: FaList },
  { id: 'resume', label: 'Resume', icon: FaFileAlt },
];

const AlumniViewStudent = () => {
  const { usn } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

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

  if (loading) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="calc(100vh - 72px)" bg="gray.50">
          <Spinner size="xl" color="#d4a960" thickness="3px" />
        </Flex>
      </AlumniLayout>
    );
  }

  if (!profile) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="calc(100vh - 72px)" bg="gray.50" direction="column" gap={4}>
          <Text color="gray.500">Student not found.</Text>
          <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate('/placement/alumni-projects')} colorScheme="blue">
            Back to Projects
          </Button>
        </Flex>
      </AlumniLayout>
    );
  }

  const personal = profile.personal || {};
  const education = profile.education || [];
  const projects = profile.projects || [];
  const internships = profile.internships || [];
  const trainings = profile.trainings || [];
  const certifications = profile.certifications || [];
  const publications = profile.publications || [];
  const extraCurricular = profile.extraCurricular || [];
  const otherExperiences = profile.otherExperiences || [];
  const career = profile.career || {};

  const InfoRow = ({ label, value }) => (
    <Flex py={1} borderBottomWidth="1px" borderColor="gray.100" justify="space-between" gap={4}>
      <Text fontWeight="medium" color="gray.600" minW="140px">{label}</Text>
      <Text textAlign="right" flex={1}>{value ?? '—'}</Text>
    </Flex>
  );

  const stats = [
    { label: 'Projects', value: projects.length, icon: FaProjectDiagram },
    { label: 'Internships', value: internships.length, icon: FaBriefcase },
    { label: 'Certifications', value: certifications.length, icon: FaCertificate },
    { label: 'Publications', value: publications.length, icon: FaBook },
    { label: 'Trainings', value: trainings.length, icon: FaChalkboardTeacher },
    { label: 'Extra-Curricular', value: extraCurricular.length, icon: FaMedal },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <Box>
            <Heading size="md" mb={6} color="#172e36" fontWeight="600">
              Student Profile Overview
            </Heading>
            
            {/* Profile Header Card */}
            <Box mb={8} p={6} bg="white" borderRadius="xl" shadow="sm" borderWidth="1px" borderColor="gray.100">
              <Flex gap={6} align="start" flexWrap="wrap">
                <Avatar
                  size="2xl"
                  name={personal.full_name}
                  src={personal.profile_image ? getFileUrl(personal.profile_image) : undefined}
                  bg="#d4a960"
                  color="white"
                />
                <Box flex="1" minW="250px">
                  <Heading size="lg" color="#172e36" mb={1}>{personal.full_name}</Heading>
                  <Text color="gray.600" fontSize="md" mb={2}>{personal.usn}</Text>
                  <Wrap spacing={2} mb={3}>
                    {personal.schoolName && <Badge colorScheme="teal" variant="subtle">{personal.schoolName}</Badge>}
                    {personal.programName && <Badge colorScheme="purple" variant="subtle">{personal.programName}</Badge>}
                    {personal.majorName && <Badge colorScheme="blue" variant="subtle">{personal.majorName}</Badge>}
                    {personal.year_of_joining && <Badge colorScheme="gray" variant="subtle">Joined {personal.year_of_joining}</Badge>}
                  </Wrap>
                  {career.brief_summary && (
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6" noOfLines={3}>
                      {career.brief_summary}
                    </Text>
                  )}
                  {personal.social_links && Object.keys(personal.social_links).length > 0 && (
                    <HStack mt={3} spacing={3}>
                      {Object.entries(personal.social_links).map(([key, val]) => {
                        const url = typeof val === 'string' ? val : val?.url;
                        if (!url) return null;
                        const isLinkedIn = url.includes('linkedin');
                        const isGithub = url.includes('github');
                        return (
                          <Link key={key} href={url} isExternal>
                            <Icon 
                              as={isLinkedIn ? FaLinkedin : isGithub ? FaGithub : FaExternalLinkAlt} 
                              boxSize={5} 
                              color="gray.500"
                              _hover={{ color: '#d4a960' }}
                            />
                          </Link>
                        );
                      })}
                    </HStack>
                  )}
                </Box>
              </Flex>
            </Box>

            {/* Stats Grid */}
            <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={4} mb={8}>
              {stats.map(({ label, value, icon: StatIcon }) => (
                <Box
                  key={label}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  borderColor="gray.100"
                  _hover={{ borderColor: '#d4a960', shadow: 'md' }}
                  transition="all 0.2s"
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => {
                    const sectionMap = {
                      'Projects': 'projects',
                      'Internships': 'internships',
                      'Certifications': 'certifications',
                      'Publications': 'publications',
                      'Trainings': 'trainings',
                      'Extra-Curricular': 'extra',
                    };
                    if (sectionMap[label]) setActiveSection(sectionMap[label]);
                  }}
                >
                  <Icon as={StatIcon} color="#d4a960" boxSize={6} mb={2} />
                  <Text fontSize="2xl" fontWeight="bold" color="#172e36">{value}</Text>
                  <Text fontSize="xs" color="gray.500">{label}</Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* Key Expertise & Career */}
            {(career.key_expertise || career.career_objective) && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {career.key_expertise && (
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" borderColor="gray.100">
                    <Text fontWeight="semibold" color="#172e36" mb={2}>Key Expertise</Text>
                    <Text fontSize="sm" color="gray.600">{career.key_expertise}</Text>
                  </Box>
                )}
                {career.career_objective && (
                  <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" borderColor="gray.100">
                    <Text fontWeight="semibold" color="#172e36" mb={2}>Career Objective</Text>
                    <Text fontSize="sm" color="gray.600">{career.career_objective}</Text>
                  </Box>
                )}
              </SimpleGrid>
            )}
          </Box>
        );

      case 'personal':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={5} color="#172e36" fontWeight="600" borderBottom="1px" borderColor="gray.200" pb={3}>
              Basic Information
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontWeight="bold" mb={3} color="gray.600" fontSize="sm" textTransform="uppercase" letterSpacing="wider">Personal</Text>
                <VStack align="stretch" spacing={0}>
                  <InfoRow label="Full name" value={personal.full_name} />
                  <InfoRow label="USN" value={personal.usn} />
                  <InfoRow label="School" value={personal.schoolName} />
                  <InfoRow label="Program" value={personal.programName} />
                  {personal.majorName && <InfoRow label="Major" value={personal.majorName} />}
                  <InfoRow label="Year of Joining" value={personal.year_of_joining} />
                  <InfoRow label="Current Year" value={personal.current_year} />
                </VStack>
              </Box>
              <Box>
                <Text fontWeight="bold" mb={3} color="gray.600" fontSize="sm" textTransform="uppercase" letterSpacing="wider">Contact</Text>
                <VStack align="stretch" spacing={0}>
                  <InfoRow label="College Email" value={personal.college_email} />
                  {personal.personal_email && <InfoRow label="Personal Email" value={personal.personal_email} />}
                </VStack>
                {personal.social_links && Object.keys(personal.social_links).length > 0 && (
                  <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Social Links</Text>
                    <VStack align="stretch" spacing={2}>
                      {Object.entries(personal.social_links).map(([key, val]) => {
                        const url = typeof val === 'string' ? val : val?.url;
                        const name = typeof val === 'object' ? val?.name : key;
                        return url ? (
                          <Box key={key} py={1.5} px={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.100">
                            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={0.5}>{name || 'Link'}</Text>
                            <Link href={url} isExternal fontSize="sm" color="#d4a960" wordBreak="break-all" _hover={{ textDecoration: 'underline' }}>
                              {url}
                            </Link>
                          </Box>
                        ) : null;
                      })}
                    </VStack>
                  </Box>
                )}
              </Box>
            </SimpleGrid>
          </Box>
        );

      case 'projects':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Projects</Heading>
            {projects.length === 0 ? (
              <Text color="gray.500">No projects available.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {projects.map((p, i) => {
                  const snaps = Array.isArray(p.project_snaps) ? p.project_snaps : (p.project_snaps ? [p.project_snaps] : []);
                  return (
                    <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                      <Flex justify="space-between" align="start" mb={2} flexWrap="wrap" gap={2}>
                        <Box flex="1" minW="200px">
                          <Text fontWeight="bold" fontSize="md">{p.title}</Text>
                          <Text fontSize="sm" color="gray.600" mt={1}>{p.one_line_description}</Text>
                        </Box>
                        <HStack spacing={2}>
                          {p.github_repo && (
                            <Button as="a" href={p.github_repo} target="_blank" size="xs" leftIcon={<FaGithub />} variant="outline">
                              Source Code
                            </Button>
                          )}
                          {p.hosted_link && (
                            <Button as="a" href={p.hosted_link} target="_blank" size="xs" leftIcon={<FaExternalLinkAlt />} colorScheme="yellow" bg="#d4a960" _hover={{ bg: '#c4983f' }}>
                              Live Demo
                            </Button>
                          )}
                        </HStack>
                      </Flex>
                      {snaps.length > 0 && (
                        <Box mt={3} mb={3}>
                          <HStack spacing={2} flexWrap="wrap">
                            {snaps.slice(0, 4).map((snap, idx) => {
                              const snapUrl = typeof snap === 'string' ? snap : (snap && snap.url);
                              return snapUrl ? (
                                <Box key={idx} w="80px" h="50px" flexShrink={0} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="gray.200" bg="white">
                                  <Image
                                    src={getFileUrl(snapUrl)}
                                    alt={`${p.title} snap ${idx + 1}`}
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </Box>
                              ) : null;
                            })}
                          </HStack>
                        </Box>
                      )}
                      <Wrap spacing={2} mt={2}>
                        {p.genre && <Badge colorScheme="purple">{p.genre}</Badge>}
                        {p.self_rating && <Badge colorScheme="orange">Rating: {p.self_rating}/10</Badge>}
                      </Wrap>
                      {p.technologies && p.technologies.length > 0 && (
                        <Wrap spacing={1} mt={2}>
                          {p.technologies.map((tech, idx) => (
                            <Badge key={idx} size="sm" colorScheme="teal" variant="subtle">{tech}</Badge>
                          ))}
                        </Wrap>
                      )}
                      {p.full_description && (
                        <Text fontSize="sm" color="gray.600" mt={2} noOfLines={3}>{p.full_description}</Text>
                      )}
                      {p.mentor_name && (
                        <Text fontSize="xs" color="gray.500" mt={1}>Mentor: {p.mentor_name}</Text>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        );

      case 'internships':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Internships</Heading>
            {internships.length === 0 ? (
              <Text color="gray.500">No internships.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {internships.map((int, i) => (
                  <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">{int.job_role}</Text>
                      <Text fontSize="sm" color="gray.700" mt={1}>{int.organization}</Text>
                      <HStack spacing={2} mt={2} flexWrap="wrap">
                        {int.duration_months && <Badge colorScheme="blue">{int.duration_months} months</Badge>}
                        {int.location && <Badge colorScheme="gray">{int.location}</Badge>}
                        {int.academic_year && <Badge colorScheme="purple">{int.academic_year}</Badge>}
                      </HStack>
                    </Box>
                    {int.description && (
                      <Text fontSize="sm" color="gray.600" mt={2}>{int.description}</Text>
                    )}
                    {int.skills && <Text fontSize="xs" color="gray.500" mt={1}>Skills: {int.skills}</Text>}
                    {int.start_date && int.end_date && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Duration: {new Date(int.start_date).toLocaleDateString()} - {new Date(int.end_date).toLocaleDateString()}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'education':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Education History</Heading>
            {education.length === 0 ? (
              <Text color="gray.500">No education history.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {education.map((e, i) => (
                  <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">{e.education_level}</Text>
                      <Text fontSize="sm" color="gray.700" mt={1}>{e.institute_name}</Text>
                      <HStack spacing={2} mt={1}>
                        {e.board && <Badge size="sm" colorScheme="blue">{e.board}</Badge>}
                        {e.year_of_passing && <Badge size="sm" colorScheme="gray">{e.year_of_passing}</Badge>}
                      </HStack>
                    </Box>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Result: {e.result} {e.result_type || ''}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'trainings':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Trainings</Heading>
            {trainings.length === 0 ? (
              <Text color="gray.500">No trainings.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {trainings.map((t, i) => (
                  <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">{t.title}</Text>
                      <Text fontSize="sm" color="gray.700" mt={1}>{t.institution}</Text>
                      <HStack spacing={2} mt={2}>
                        {t.training_type && <Badge colorScheme="purple">{t.training_type}</Badge>}
                      </HStack>
                    </Box>
                    {t.description && (
                      <Text fontSize="sm" color="gray.600" mt={2}>{t.description}</Text>
                    )}
                    {t.skills && <Text fontSize="xs" color="gray.500" mt={1}>Skills: {t.skills}</Text>}
                    {t.start_date && t.end_date && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Duration: {new Date(t.start_date).toLocaleDateString()} - {new Date(t.end_date).toLocaleDateString()}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'certifications':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Certifications</Heading>
            {certifications.length === 0 ? (
              <Text color="gray.500">No certifications.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {certifications.map((c, i) => (
                  <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Box flex="1">
                      <Text fontWeight="bold" fontSize="md">{c.title}</Text>
                      <Text fontSize="sm" color="gray.700" mt={1}>{c.organization}</Text>
                      <HStack spacing={2} mt={2}>
                        {c.certification_type && <Badge colorScheme="purple">{c.certification_type}</Badge>}
                        {c.score && <Badge colorScheme="green">Score: {c.score}</Badge>}
                        {c.issue_date && <Badge colorScheme="blue">{new Date(c.issue_date).toLocaleDateString()}</Badge>}
                      </HStack>
                    </Box>
                    {c.skills && Array.isArray(c.skills) && c.skills.length > 0 && (
                      <Wrap spacing={1} mt={2}>
                        {c.skills.map((skill, idx) => (
                          <Badge key={idx} size="sm" colorScheme="teal" variant="subtle">{skill}</Badge>
                        ))}
                      </Wrap>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'publications':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Publications</Heading>
            {publications.length === 0 ? (
              <Text color="gray.500">No publications.</Text>
            ) : (
              <VStack align="stretch" spacing={4}>
                {publications.map((p, i) => (
                  <Box key={i} p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                    <Flex justify="space-between" align="start" mb={2} flexWrap="wrap" gap={2}>
                      <Box flex="1">
                        <Text fontWeight="bold" fontSize="md">{p.title}</Text>
                        <Text fontSize="sm" color="gray.700" mt={1}>{p.publication_name}</Text>
                        <HStack spacing={2} mt={2}>
                          {p.publication_type && <Badge colorScheme="purple">{p.publication_type}</Badge>}
                          {p.author_count && <Badge colorScheme="blue">{p.author_count} authors</Badge>}
                          {p.publication_date && <Badge colorScheme="gray">{new Date(p.publication_date).toLocaleDateString()}</Badge>}
                        </HStack>
                      </Box>
                      {p.link && (
                        <Button as="a" href={p.link} target="_blank" size="xs" colorScheme="blue" variant="outline">
                          View Publication
                        </Button>
                      )}
                    </Flex>
                    {p.description && (
                      <Text fontSize="sm" color="gray.600" mt={2}>{p.description}</Text>
                    )}
                    {p.skills && <Text fontSize="xs" color="gray.500" mt={1}>Skills: {p.skills}</Text>}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'extra':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Extra-Curricular Activities</Heading>
            {extraCurricular.length === 0 ? (
              <Text color="gray.500">No extra-curricular activities.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {extraCurricular.map((e, i) => (
                  <Box key={i} p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold">{e.activity_name || e.activity}</Text>
                    <Text fontSize="sm" color="gray.600">{e.role}</Text>
                    {e.organization && <Text fontSize="sm" color="gray.500">{e.organization}</Text>}
                    {e.description && <Text fontSize="sm" mt={1}>{e.description}</Text>}
                    {e.achievements && <Text fontSize="xs" color="gray.500" mt={1}>Achievements: {e.achievements}</Text>}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'other':
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Other Experiences</Heading>
            {otherExperiences.length === 0 ? (
              <Text color="gray.500">No other experiences.</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {otherExperiences.map((e, i) => (
                  <Box key={i} p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="bold">{e.title}</Text>
                    {e.organization && <Text fontSize="sm" color="gray.600">{e.organization}</Text>}
                    {e.description && <Text fontSize="sm" mt={1}>{e.description}</Text>}
                    {e.skills && <Text fontSize="xs" color="gray.500" mt={1}>Skills: {e.skills}</Text>}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        );

      case 'resume': {
        const resumeFile = profile.resume_file || career?.resume_file;
        return (
          <Box bg="white" borderRadius="xl" shadow="sm" p={6} borderWidth="1px" borderColor="gray.100">
            <Heading size="md" mb={4} color="#172e36" borderBottom="1px" borderColor="gray.100" pb={3}>Resume</Heading>
            <Box p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.200" borderStyle="dashed" textAlign="center">
              <Icon as={FaFileAlt} w={10} h={10} color="gray.400" mb={4} />
              <Text fontSize="lg" fontWeight="medium" mb={2}>Student Resume</Text>
              <Text color="gray.500" fontSize="sm" mb={6}>
                {resumeFile ? 'Resume available for download.' : 'No resume uploaded by the student.'}
              </Text>
              {resumeFile && (
                <Button as="a" href={getFileUrl(resumeFile)} target="_blank" bg="#d4a960" color="white" _hover={{ bg: '#c4983f' }} leftIcon={<FaFileAlt />}>
                  View / Download Resume
                </Button>
              )}
            </Box>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  return (
    <AlumniLayout>
      <Box minH="calc(100vh - 72px)" display="flex" flexDirection="column">
        {/* Header */}
        <Box
          bg="#172e36"
          borderBottom="1px solid"
          borderColor="#2d4a54"
          px={{ base: 4, lg: 8 }}
          py={4}
          borderRadius={{ base: 0, lg: 'xl' }}
          mb={4}
        >
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <HStack spacing={4}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ChevronLeftIcon />}
                onClick={() => navigate(-1)}
                color="white"
                _hover={{ bg: 'whiteAlpha.200', color: '#d4a960' }}
              >
                Back
              </Button>
              <Box>
                <Heading size="md" color="white" fontWeight="600">
                  {personal.full_name || profile.firstName}
                </Heading>
                <Text fontSize="sm" color="whiteAlpha.800">USN: {profile.usn || personal.usn}</Text>
              </Box>
            </HStack>
            <Wrap spacing={2}>
              {personal.schoolName && <Badge colorScheme="teal" variant="subtle">{personal.schoolName}</Badge>}
              {personal.programName && <Badge colorScheme="purple" variant="subtle">{personal.programName}</Badge>}
              {personal.year_of_joining && <Badge colorScheme="gray" variant="subtle">Joined {personal.year_of_joining}</Badge>}
            </Wrap>
          </Flex>
        </Box>

        <Box flex="1" display="flex" flexDirection="column" minH="0" overflow="hidden">
          {/* Mobile Section Selector */}
          <Box
            px={{ base: 4, lg: 0 }}
            py={3}
            display={{ base: 'block', lg: 'none' }}
            bg="white"
            borderBottom="1px"
            borderColor="gray.200"
            flexShrink={0}
          >
            <Select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              size="sm"
              borderColor="gray.200"
              _focus={{ borderColor: '#d4a960', boxShadow: '0 0 0 1px #d4a960' }}
              borderRadius="md"
            >
              {SIDEBAR_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </Select>
          </Box>

          <Grid
            templateColumns={{ base: '1fr', lg: '240px 1fr' }}
            flex="1"
            minH="0"
          >
            {/* Sidebar */}
            <Box
              bg="#f8f9fa"
              borderRight="1px solid"
              borderColor="gray.200"
              py={6}
              overflowY="auto"
              display={{ base: 'none', lg: 'block' }}
              borderRadius="lg"
            >
              <VStack align="stretch" spacing={0} px={2}>
                {SIDEBAR_ITEMS.map((item) => (
                  <Box
                    key={item.id}
                    as="button"
                    w="100%"
                    textAlign="left"
                    px={4}
                    py={3}
                    borderRadius="lg"
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    gap={3}
                    bg={activeSection === item.id ? '#fef3c7' : 'transparent'}
                    color={activeSection === item.id ? '#92400e' : 'gray.600'}
                    fontWeight={activeSection === item.id ? 'bold' : 'medium'}
                    _hover={{ bg: activeSection === item.id ? '#fef3c7' : 'gray.100' }}
                    transition="all 0.2s"
                    border="none"
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon as={item.icon} color={activeSection === item.id ? '#d4a960' : 'gray.500'} boxSize={4} flexShrink={0} />
                    <Text fontSize="sm">{item.label}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Content */}
            <Box
              p={{ base: 4, lg: 6 }}
              overflowY="auto"
              bg="gray.50"
              minH="0"
            >
              <Box maxW="1000px">
                {renderSectionContent()}
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </AlumniLayout>
  );
};

export default AlumniViewStudent;
