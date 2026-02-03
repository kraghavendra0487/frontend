import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Flex,
  Avatar,
  Icon,
  Badge,
  Divider,
  Spinner,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  EditIcon, 
  CheckIcon, 
  CloseIcon,
  LinkIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { 
  FaBuilding, 
  FaGlobe, 
  FaLinkedin, 
  FaMapMarkerAlt,
  FaInfoCircle,
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

const CompanyProfile = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    website: '',
    linkedin: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.getMyProfile();
      setProfile(data);
      setFormData({
        description: data?.description || '',
        website: data?.website || '',
        linkedin: data?.linkedin || '',
        address: data?.address || '',
      });
    } catch (err) {
      toast({
        title: 'Failed to load profile',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await CompanyService.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to update profile',
        description: err?.message || 'Please try again',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      description: profile?.description || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      address: profile?.address || '',
    });
    setIsEditing(false);
  };

  const logoUrl = profile?.company_logo_link ? getFileUrl(profile.company_logo_link) : null;

  if (loading) {
    return (
      <CompanyLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={colors.accent} thickness="4px" />
        </Flex>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1000px">
          {/* Header */}
          <Flex justify="space-between" align="start" mb={8} flexWrap="wrap" gap={4}>
            <HStack spacing={5} align="start">
              <Avatar
                size="2xl"
                name={profile?.company_name}
                src={logoUrl}
                bg={colors.dark}
                color="white"
                icon={<Icon as={FaBuilding} boxSize={12} />}
                border="4px solid white"
                boxShadow="lg"
              />
              <Box>
                <Heading size="xl" color={colors.dark} mb={1}>
                  {profile?.company_name || 'Company'}
                </Heading>
                {profile?.company_type && (
                  <Badge 
                    bg={colors.accentLight} 
                    color={colors.accent} 
                    fontSize="sm" 
                    px={3} 
                    py={1} 
                    borderRadius="full"
                    fontWeight="600"
                  >
                    {profile.company_type}
                  </Badge>
                )}
                <Text color={colors.secondary} mt={2} fontSize="sm">
                  Company Profile & Information
                </Text>
              </Box>
            </HStack>

            {!isEditing ? (
              <Button
                leftIcon={<EditIcon />}
                bg={colors.accent}
                color="white"
                _hover={{ bg: colors.accentHover }}
                onClick={() => setIsEditing(true)}
                size="md"
                borderRadius="lg"
              >
                Edit Profile
              </Button>
            ) : (
              <HStack spacing={3}>
                <Button
                  leftIcon={<CloseIcon />}
                  variant="outline"
                  colorScheme="gray"
                  onClick={handleCancel}
                  size="md"
                  borderRadius="lg"
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<CheckIcon />}
                  bg={colors.dark}
                  color="white"
                  _hover={{ bg: colors.darkBlue }}
                  onClick={handleSave}
                  isLoading={isSaving}
                  size="md"
                  borderRadius="lg"
                >
                  Save Changes
                </Button>
              </HStack>
            )}
          </Flex>

          {/* Profile Content */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Left Column - Basic Info (Read-only) */}
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={6}>
                <HStack spacing={3} mb={5}>
                  <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                    <Icon as={FaInfoCircle} color={colors.accent} boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" color={colors.dark} fontSize="lg">Basic Information</Text>
                    <Text fontSize="xs" color={colors.secondary}>Read-only details</Text>
                  </Box>
                </HStack>

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={colors.secondary} mb={1}>Company Name</Text>
                    <Text fontSize="md" color={colors.dark} fontWeight="500">
                      {profile?.company_name || '—'}
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={colors.secondary} mb={1}>Company Type</Text>
                    <Text fontSize="md" color={colors.dark} fontWeight="500">
                      {profile?.company_type || '—'}
                    </Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={colors.secondary} mb={1}>Member Since</Text>
                    <Text fontSize="md" color={colors.dark} fontWeight="500">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : '—'}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Right Column - Quick Links */}
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody p={6}>
                <HStack spacing={3} mb={5}>
                  <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                    <Icon as={FaGlobe} color={colors.accent} boxSize={5} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" color={colors.dark} fontSize="lg">Quick Links</Text>
                    <Text fontSize="xs" color={colors.secondary}>External resources</Text>
                  </Box>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {profile?.website && (
                    <HStack 
                      as="a" 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      p={3}
                      bg={colors.pageBg}
                      borderRadius="xl"
                      _hover={{ bg: colors.accentLight }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaGlobe} color={colors.accent} boxSize={5} />
                      <Text flex="1" fontSize="sm" fontWeight="500" color={colors.dark} isTruncated>
                        {profile.website}
                      </Text>
                      <ExternalLinkIcon color={colors.secondary} />
                    </HStack>
                  )}
                  {profile?.linkedin && (
                    <HStack 
                      as="a" 
                      href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      p={3}
                      bg={colors.pageBg}
                      borderRadius="xl"
                      _hover={{ bg: colors.accentLight }}
                      transition="all 0.2s"
                    >
                      <Icon as={FaLinkedin} color="#0A66C2" boxSize={5} />
                      <Text flex="1" fontSize="sm" fontWeight="500" color={colors.dark} isTruncated>
                        LinkedIn Profile
                      </Text>
                      <ExternalLinkIcon color={colors.secondary} />
                    </HStack>
                  )}
                  {!profile?.website && !profile?.linkedin && (
                    <Text color={colors.secondary} fontSize="sm" textAlign="center" py={4}>
                      No external links added yet
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Editable Section */}
          <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border} mt={6}>
            <CardBody p={6}>
              <HStack spacing={3} mb={6}>
                <Flex w="40px" h="40px" bg={colors.accentLight} borderRadius="xl" align="center" justify="center">
                  <Icon as={FaBuilding} color={colors.accent} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontWeight="700" color={colors.dark} fontSize="lg">Company Details</Text>
                  <Text fontSize="xs" color={colors.secondary}>
                    {isEditing ? 'Edit your company information' : 'Additional information about your company'}
                  </Text>
                </Box>
              </HStack>

              <VStack spacing={5} align="stretch">
                {/* Description */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={colors.secondary}>
                    About / Description
                  </FormLabel>
                  {isEditing ? (
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell us about your company..."
                      rows={4}
                      borderRadius="xl"
                      borderWidth="2px"
                      _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                    />
                  ) : (
                    <Text 
                      p={4} 
                      bg={colors.pageBg} 
                      borderRadius="xl" 
                      fontSize="sm" 
                      color={profile?.description ? colors.dark : colors.secondary}
                      lineHeight="1.7"
                    >
                      {profile?.description || 'No description provided'}
                    </Text>
                  )}
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  {/* Website */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color={colors.secondary}>Website</FormLabel>
                    {isEditing ? (
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaGlobe} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://www.company.com"
                          borderRadius="xl"
                          borderWidth="2px"
                          _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                        />
                      </InputGroup>
                    ) : (
                      <HStack p={3} bg={colors.pageBg} borderRadius="xl">
                        <Icon as={FaGlobe} color={colors.accent} />
                        <Text fontSize="sm" color={profile?.website ? colors.dark : colors.secondary}>
                          {profile?.website || 'Not provided'}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>

                  {/* LinkedIn */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="600" color={colors.secondary}>LinkedIn</FormLabel>
                    {isEditing ? (
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FaLinkedin} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/company/..."
                          borderRadius="xl"
                          borderWidth="2px"
                          _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                        />
                      </InputGroup>
                    ) : (
                      <HStack p={3} bg={colors.pageBg} borderRadius="xl">
                        <Icon as={FaLinkedin} color="#0A66C2" />
                        <Text fontSize="sm" color={profile?.linkedin ? colors.dark : colors.secondary}>
                          {profile?.linkedin || 'Not provided'}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>
                </SimpleGrid>

                {/* Address */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={colors.secondary}>Address</FormLabel>
                  {isEditing ? (
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaMapMarkerAlt} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Company address"
                        borderRadius="xl"
                        borderWidth="2px"
                        _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                      />
                    </InputGroup>
                  ) : (
                    <HStack p={3} bg={colors.pageBg} borderRadius="xl">
                      <Icon as={FaMapMarkerAlt} color={colors.accent} />
                      <Text fontSize="sm" color={profile?.address ? colors.dark : colors.secondary}>
                        {profile?.address || 'Not provided'}
                      </Text>
                    </HStack>
                  )}
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyProfile;
