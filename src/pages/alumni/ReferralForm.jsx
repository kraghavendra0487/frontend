import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  useToast,
  Container,
  SimpleGrid,
  Grid,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Select,
  Badge,
  Flex,
  Icon,
  Spinner,
  Avatar,
  Divider,
  Link,
} from '@chakra-ui/react';
import { 
  EmailIcon, 
  PhoneIcon, 
  CheckCircleIcon, 
  AddIcon,
} from '@chakra-ui/icons';
import { 
  FaBuilding, 
  FaBriefcase, 
  FaPaperPlane,
  FaUserTie,
  FaCalendarAlt,
  FaCheckCircle,
  FaListAlt,
  FaPlusCircle,
} from 'react-icons/fa';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';

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

const OPPORTUNITY_TYPES = [
  'Full-Time',
  'Internship',
  'Part-Time',
  'Contract',
  'Freelance',
  'Other',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_CODE_REGEX = /^\+\d{1,3}$/;
const PHONE_NUMBER_LENGTH = 10;

const ReferralForm = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRecommendations, setMyRecommendations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    hr_name: '',
    hr_email: '',
    hr_phone_country_code: '',
    hr_phone_number: '',
    hiring_role: '',
    opportunity_type: '',
    recommendation_note: '',
    consent_given: false,
  });
  const [fieldErrors, setFieldErrors] = useState({ hr_email: '', hr_phone_country_code: '', hr_phone_number: '' });

  useEffect(() => {
    loadMyRecommendations();
  }, []);

  const loadMyRecommendations = async () => {
    setLoadingHistory(true);
    try {
      const data = await PlacementService.getMyHrRecommendations();
      setMyRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === 'hr_phone_country_code') {
      if (value === '+') {
        finalValue = '+';
      } else if (value.startsWith('+')) {
        const digits = value.slice(1).replace(/\D/g, '').slice(0, 3);
        finalValue = '+' + digits;
      } else {
        const digits = value.replace(/\D/g, '').slice(0, 3);
        finalValue = digits ? '+' + digits : '';
      }
    }
    if (name === 'hr_phone_number') {
      finalValue = value.replace(/\D/g, '').slice(0, PHONE_NUMBER_LENGTH);
    }
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : finalValue 
    }));
    if (name === 'hr_email' || name === 'hr_phone_country_code' || name === 'hr_phone_number') {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name === 'hr_email' && formData.hr_email && !EMAIL_REGEX.test(formData.hr_email.trim())) {
      setFieldErrors((prev) => ({ ...prev, hr_email: 'Please enter a valid email address (e.g. name@company.com)' }));
    }
    if (name === 'hr_phone_country_code' && formData.hr_phone_number && formData.hr_phone_country_code) {
      if (!COUNTRY_CODE_REGEX.test(formData.hr_phone_country_code)) {
        setFieldErrors((prev) => ({ ...prev, hr_phone_country_code: 'Enter + followed by 1–3 digits (e.g. +91)' }));
      }
    }
    if (name === 'hr_phone_number' && formData.hr_phone_number) {
      if (formData.hr_phone_number.length !== PHONE_NUMBER_LENGTH) {
        setFieldErrors((prev) => ({ ...prev, hr_phone_number: `Phone number must be exactly ${PHONE_NUMBER_LENGTH} digits` }));
      }
    }
  };

  const validateEmail = (email) => !email || EMAIL_REGEX.test(email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.hr_name) {
      toast({ 
        title: 'Required fields missing', 
        description: 'Please fill in Company Name and HR Name.', 
        status: 'warning', 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }

    const errors = {};
    if (formData.hr_email && !validateEmail(formData.hr_email)) {
      errors.hr_email = 'Please enter a valid email address (e.g. name@company.com)';
    }
    const hasPhoneNumber = formData.hr_phone_number && formData.hr_phone_number.length > 0;
    if (hasPhoneNumber) {
      if (formData.hr_phone_country_code && !COUNTRY_CODE_REGEX.test(formData.hr_phone_country_code)) {
        errors.hr_phone_country_code = 'Enter + followed by 1–3 digits (e.g. +91)';
      }
      if (formData.hr_phone_number.length !== PHONE_NUMBER_LENGTH) {
        errors.hr_phone_number = `Phone number must be exactly ${PHONE_NUMBER_LENGTH} digits`;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      toast({ 
        title: 'Invalid input', 
        description: 'Please correct the email and/or phone number.', 
        status: 'warning', 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }

    if (!formData.consent_given) {
      toast({ 
        title: 'Consent Required', 
        description: 'Please confirm that you have consent to share this contact.', 
        status: 'warning', 
        duration: 3000, 
        isClosable: true 
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.hr_phone_number) {
        const countryCode = formData.hr_phone_country_code || '+91';
        payload.hr_phone = `${countryCode} ${formData.hr_phone_number}`;
      }
      delete payload.hr_phone_country_code;
      delete payload.hr_phone_number;
      await PlacementService.submitHrRecommendation(payload);
      toast({ 
        title: 'Recommendation Submitted!', 
        description: 'Thank you! The placement team will follow up.', 
        status: 'success', 
        duration: 5000, 
        isClosable: true 
      });
      
      setFormData({ 
        company_name: '', 
        hr_name: '', 
        hr_email: '', 
        hr_phone_country_code: '', 
        hr_phone_number: '', 
        hiring_role: '', 
        opportunity_type: '', 
        recommendation_note: '',
        consent_given: false,
      });
      setFieldErrors({ hr_email: '', hr_phone_country_code: '', hr_phone_number: '' });
      
      loadMyRecommendations();
      setActiveTab('list');
    } catch (error) {
      toast({ 
        title: 'Submission Failed', 
        description: error?.message || 'Please try again.', 
        status: 'error', 
        duration: 3000, 
        isClosable: true 
      });
    } finally {
      setIsSubmitting(false);
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

  const getOpportunityColor = (type) => {
    switch (type) {
      case 'Full-Time': return 'green';
      case 'Internship': return 'blue';
      case 'Part-Time': return 'purple';
      case 'Contract': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <AlumniLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="1000px">
          {/* Header */}
          <Flex 
            justify="space-between" 
            align="center" 
            mb={8}
            flexWrap="wrap"
            gap={4}
          >
            <Box>
              <Heading color={colors.dark} size="xl" fontWeight="700" mb={1}>
                HR Recommendations
              </Heading>
              <Text color={colors.secondary} fontSize="md">
                Connect the placement team with HR professionals from your network
              </Text>
            </Box>
            <HStack spacing={3}>
              <Badge 
                bg={colors.accentLight}
                color={colors.accent}
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
                fontWeight="600"
              >
                {myRecommendations.length} Recommendations
              </Badge>
            </HStack>
          </Flex>

          {/* Custom Tabs */}
          <Flex 
            bg="white" 
            borderRadius="2xl" 
            p={1.5}
            mb={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={colors.border}
          >
            <Button
              flex={1}
              size="lg"
              borderRadius="xl"
              bg={activeTab === 'list' ? colors.dark : 'transparent'}
              color={activeTab === 'list' ? 'white' : colors.secondary}
              _hover={{ 
                bg: activeTab === 'list' ? colors.dark : colors.pageBg,
                color: activeTab === 'list' ? 'white' : colors.dark
              }}
              onClick={() => setActiveTab('list')}
              leftIcon={<Icon as={FaListAlt} boxSize={4} />}
              fontWeight="600"
              transition="all 0.2s"
            >
              My Recommendations
            </Button>
            <Button
              flex={1}
              size="lg"
              borderRadius="xl"
              bg={activeTab === 'new' ? colors.accent : 'transparent'}
              color={activeTab === 'new' ? 'white' : colors.secondary}
              _hover={{ 
                bg: activeTab === 'new' ? colors.accent : colors.pageBg,
                color: activeTab === 'new' ? 'white' : colors.dark
              }}
              onClick={() => setActiveTab('new')}
              leftIcon={<Icon as={FaPlusCircle} boxSize={4} />}
              fontWeight="600"
              transition="all 0.2s"
            >
              New Recommendation
            </Button>
          </Flex>

          {/* Content */}
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            overflow="hidden"
            border="1px solid"
            borderColor={colors.border}
          >
            {activeTab === 'list' ? (
              /* My Recommendations */
              loadingHistory ? (
                <Flex justify="center" align="center" py={20}>
                  <VStack spacing={4}>
                    <Spinner size="xl" color={colors.accent} thickness="4px" />
                    <Text color={colors.secondary}>Loading recommendations...</Text>
                  </VStack>
                </Flex>
              ) : myRecommendations.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={20} px={8}>
                  <Flex
                    w="120px"
                    h="120px"
                    borderRadius="full"
                    bg={`linear-gradient(135deg, ${colors.accentLight} 0%, #fff 100%)`}
                    align="center"
                    justify="center"
                    mb={6}
                    border="3px dashed"
                    borderColor={colors.border}
                  >
                    <Icon as={FaUserTie} boxSize={12} color={colors.accent} opacity={0.6} />
                  </Flex>
                  <Heading size="lg" color={colors.dark} mb={3}>No recommendations yet</Heading>
                  <Text color={colors.secondary} textAlign="center" mb={8} maxW="450px" fontSize="md" lineHeight="1.7">
                    Help students by referring HR contacts from your network. Your recommendations create valuable opportunities!
                  </Text>
                  <Button
                    leftIcon={<AddIcon />}
                    bg={colors.accent}
                    color="white"
                    size="lg"
                    borderRadius="xl"
                    px={8}
                    h="56px"
                    fontSize="md"
                    fontWeight="600"
                    _hover={{ bg: colors.accentHover, transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                    boxShadow="0 4px 14px rgba(212, 169, 96, 0.4)"
                    onClick={() => setActiveTab('new')}
                  >
                    Add Your First Recommendation
                  </Button>
                </Flex>
              ) : (
                <Box>
                  {/* Recommendations List */}
                  <VStack spacing={0} align="stretch">
                    {myRecommendations.map((rec, index) => (
                      <Box 
                        key={rec.id} 
                        p={6}
                        bg={index % 2 === 0 ? 'white' : colors.pageBg}
                        borderBottom="1px solid"
                        borderColor={colors.border}
                        _last={{ borderBottom: 'none' }}
                        _hover={{ bg: index % 2 === 0 ? 'gray.50' : '#e8ecf0' }}
                        transition="all 0.2s"
                      >
                        <Flex gap={5} align="start">
                          {/* Company Avatar */}
                          <Avatar
                            size="lg"
                            name={rec.company_name}
                            bg={`hsl(${(index * 47) % 360}, 55%, 50%)`}
                            color="white"
                            fontWeight="700"
                            fontSize="lg"
                          />

                          {/* Content */}
                          <Box flex="1">
                            <Flex justify="space-between" align="start" mb={3} flexWrap="wrap" gap={2}>
                              <Box>
                                <Heading size="md" color={colors.dark} mb={1} fontWeight="700">
                                  {rec.company_name}
                                </Heading>
                                <HStack spacing={4} flexWrap="wrap">
                                  <HStack spacing={2}>
                                    <Icon as={FaUserTie} color={colors.accent} boxSize={4} />
                                    <Text color={colors.dark} fontSize="sm" fontWeight="600">
                                      {rec.hr_name}
                                    </Text>
                                  </HStack>
                                  {rec.hiring_role && (
                                    <HStack spacing={2}>
                                      <Icon as={FaBriefcase} color={colors.secondary} boxSize={3.5} />
                                      <Text color={colors.secondary} fontSize="sm">
                                        {rec.hiring_role}
                                      </Text>
                                    </HStack>
                                  )}
                                </HStack>
                              </Box>
                              
                              {rec.opportunity_type && (
                                <Badge 
                                  colorScheme={getOpportunityColor(rec.opportunity_type)}
                                  fontSize="sm"
                                  px={4}
                                  py={1.5}
                                  borderRadius="full"
                                  fontWeight="600"
                                >
                                  {rec.opportunity_type}
                                </Badge>
                              )}
                            </Flex>

                            {/* Contact Info */}
                            <Flex gap={5} mb={3} flexWrap="wrap">
                              {rec.hr_email && (
                                <Link href={`mailto:${rec.hr_email}`} _hover={{ textDecoration: 'none' }}>
                                  <HStack 
                                    spacing={2} 
                                    bg={colors.pageBg} 
                                    px={3} 
                                    py={2} 
                                    borderRadius="lg"
                                    _hover={{ bg: colors.accentLight }}
                                    transition="all 0.2s"
                                  >
                                    <EmailIcon boxSize={4} color={colors.accent} />
                                    <Text fontSize="sm" color={colors.dark} fontWeight="500">{rec.hr_email}</Text>
                                  </HStack>
                                </Link>
                              )}
                              {rec.hr_phone && (
                                <HStack 
                                  spacing={2} 
                                  bg={colors.pageBg} 
                                  px={3} 
                                  py={2} 
                                  borderRadius="lg"
                                >
                                  <PhoneIcon boxSize={4} color={colors.accent} />
                                  <Text fontSize="sm" color={colors.dark} fontWeight="500">{rec.hr_phone}</Text>
                                </HStack>
                              )}
                            </Flex>

                            {/* Notes */}
                            {rec.recommendation_note && (
                              <Box 
                                p={4} 
                                bg="white"
                                borderRadius="xl"
                                borderLeft="4px solid"
                                borderColor={colors.accent}
                                boxShadow="sm"
                                mb={3}
                              >
                                <Text fontSize="sm" color={colors.secondary} lineHeight="1.6">
                                  "{rec.recommendation_note}"
                                </Text>
                              </Box>
                            )}

                            {/* Footer */}
                            <HStack spacing={4} flexWrap="wrap">
                              <HStack spacing={2}>
                                <Icon as={FaCalendarAlt} boxSize={3.5} color={colors.secondary} />
                                <Text fontSize="sm" color={colors.secondary}>
                                  {formatDate(rec.created_at)}
                                </Text>
                              </HStack>
                              {rec.consent_given && (
                                <Badge 
                                  bg="green.50"
                                  color="green.600"
                                  fontSize="xs"
                                  borderRadius="full"
                                  px={3}
                                  py={1}
                                >
                                  <HStack spacing={1}>
                                    <CheckCircleIcon boxSize={3} />
                                    <Text>Consent Verified</Text>
                                  </HStack>
                                </Badge>
                              )}
                            </HStack>
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>

                  {/* Add More Button */}
                  <Box p={6} bg={colors.accentLight}>
                    <Button
                      leftIcon={<AddIcon />}
                      bg={colors.accent}
                      color="white"
                      size="lg"
                      borderRadius="xl"
                      w="full"
                      h="56px"
                      fontSize="md"
                      fontWeight="600"
                      _hover={{ bg: colors.accentHover }}
                      onClick={() => setActiveTab('new')}
                    >
                      Add Another Recommendation
                    </Button>
                  </Box>
                </Box>
              )
            ) : (
              /* New Recommendation Form */
              <Box p={8}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={8} align="stretch">
                    {/* Company Section */}
                    <Box>
                      <HStack spacing={3} mb={5}>
                        <Flex 
                          w="40px" h="40px" 
                          bg={colors.accentLight}
                          borderRadius="xl" 
                          align="center" 
                          justify="center"
                        >
                          <Icon as={FaBuilding} color={colors.accent} boxSize={5} />
                        </Flex>
                        <Box>
                          <Text fontWeight="700" color={colors.dark} fontSize="lg">Company Details</Text>
                          <Text fontSize="sm" color={colors.secondary}>Where is this opportunity?</Text>
                        </Box>
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Company Name</FormLabel>
                          <Input 
                            name="company_name" 
                            value={formData.company_name} 
                            onChange={handleChange} 
                            placeholder="e.g. Google, Amazon" 
                            size="lg"
                            borderRadius="xl"
                            borderWidth="2px"
                            bg="white"
                            _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                            _hover={{ borderColor: 'gray.300' }}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Opportunity Type</FormLabel>
                          <Select 
                            name="opportunity_type" 
                            value={formData.opportunity_type} 
                            onChange={handleChange}
                            placeholder="Select type"
                            size="lg"
                            borderRadius="xl"
                            borderWidth="2px"
                            bg="white"
                            _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                          >
                            {OPPORTUNITY_TYPES.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Select>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl mt={5}>
                        <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Hiring Role / Position</FormLabel>
                        <Input 
                          name="hiring_role" 
                          value={formData.hiring_role} 
                          onChange={handleChange} 
                          placeholder="e.g. Software Engineer, Data Analyst" 
                          size="lg"
                          borderRadius="xl"
                          borderWidth="2px"
                          bg="white"
                          _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                        />
                      </FormControl>
                    </Box>

                    <Divider borderColor={colors.border} />

                    {/* HR Contact Section */}
                    <Box 
                      p={5} 
                      borderRadius="xl" 
                      bg={colors.accentLight}
                      borderWidth="1px"
                      borderColor={colors.border}
                    >
                      <HStack spacing={3} mb={5}>
                        <Flex 
                          w="44px" h="44px" 
                          bg="white"
                          borderRadius="xl" 
                          align="center" 
                          justify="center"
                          boxShadow="sm"
                        >
                          <Icon as={FaUserTie} color={colors.accent} boxSize={5} />
                        </Flex>
                        <Box>
                          <Text fontWeight="700" color={colors.dark} fontSize="lg">HR Contact</Text>
                          <Text fontSize="sm" color={colors.secondary}>Who should we reach out to?</Text>
                        </Box>
                      </HStack>

                      <Grid
                        templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) minmax(240px, 1.2fr) minmax(0, 1fr)' }}
                        gap={5}
                        alignItems="start"
                      >
                        <FormControl isRequired>
                          <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Contact Name</FormLabel>
                          <Input 
                            name="hr_name" 
                            value={formData.hr_name} 
                            onChange={handleChange} 
                            placeholder="Full name" 
                            size="lg"
                            h="48px"
                            borderRadius="lg"
                            borderWidth="1px"
                            borderColor={colors.border}
                            bg="white"
                            _placeholder={{ color: 'gray.400' }}
                            _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                          />
                        </FormControl>

                        <Box minW={0}>
                          <FormLabel fontWeight="600" color="gray.600" fontSize="sm" mb={2}>Phone Number</FormLabel>
                          <HStack spacing={2} align="stretch" flexWrap="nowrap">
                            <FormControl isInvalid={!!fieldErrors.hr_phone_country_code} w="88px" flexShrink={0}>
                              <Input 
                                name="hr_phone_country_code" 
                                value={formData.hr_phone_country_code} 
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="+91" 
                                maxLength={4}
                                size="lg"
                                h="48px"
                                borderRadius="lg"
                                borderWidth="1px"
                                borderColor={colors.border}
                                bg="white"
                                _placeholder={{ color: 'gray.400' }}
                                _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                                _invalid={{ borderColor: 'red.400' }}
                              />
                              <FormErrorMessage>{fieldErrors.hr_phone_country_code}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={!!fieldErrors.hr_phone_number} flex={1} minW={0}>
                              <InputGroup size="lg" h="48px">
                                <InputLeftElement pointerEvents="none" h="48px" pl={3}>
                                  <PhoneIcon color="gray.400" boxSize={4} />
                                </InputLeftElement>
                                <Input 
                                  name="hr_phone_number" 
                                  type="tel"
                                  inputMode="numeric"
                                  value={formData.hr_phone_number} 
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  placeholder="9876543210" 
                                  maxLength={PHONE_NUMBER_LENGTH}
                                  h="48px"
                                  borderRadius="lg"
                                  borderWidth="1px"
                                  borderColor={colors.border}
                                  bg="white"
                                  pl="44px"
                                  _placeholder={{ color: 'gray.400' }}
                                  _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                                  _invalid={{ borderColor: 'red.400' }}
                                />
                              </InputGroup>
                              <FormErrorMessage>{fieldErrors.hr_phone_number}</FormErrorMessage>
                            </FormControl>
                          </HStack>
                        </Box>

                        <FormControl isInvalid={!!fieldErrors.hr_email}>
                          <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Email Address</FormLabel>
                          <InputGroup size="lg" h="48px">
                            <InputLeftElement pointerEvents="none" h="48px" pl={3}>
                              <EmailIcon color="gray.400" boxSize={4} />
                            </InputLeftElement>
                            <Input 
                              name="hr_email" 
                              type="email" 
                              value={formData.hr_email} 
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="hr@company.com" 
                              maxLength={254}
                              h="48px"
                              borderRadius="lg"
                              borderWidth="1px"
                              borderColor={colors.border}
                              bg="white"
                              pl="44px"
                              _placeholder={{ color: 'gray.400' }}
                              _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                              _invalid={{ borderColor: 'red.400' }}
                            />
                          </InputGroup>
                          <FormErrorMessage>{fieldErrors.hr_email}</FormErrorMessage>
                        </FormControl>
                      </Grid>
                    </Box>

                    <Divider borderColor={colors.border} />

                    {/* Notes Section */}
                    <Box>
                      <FormControl>
                        <FormLabel fontWeight="600" color="gray.600" fontSize="sm">Additional Notes</FormLabel>
                        <Textarea 
                          name="recommendation_note" 
                          value={formData.recommendation_note} 
                          onChange={handleChange} 
                          placeholder="Any context - best time to reach out, how you know them, specific advice..." 
                          rows={4}
                          size="lg"
                          borderRadius="xl"
                          borderWidth="2px"
                          bg="white"
                          _focus={{ borderColor: colors.accent, boxShadow: `0 0 0 1px ${colors.accent}` }}
                        />
                      </FormControl>
                    </Box>

                    {/* Consent Checkbox */}
                    <Box 
                      bg={formData.consent_given ? 'green.50' : 'blue.50'}
                      p={5} 
                      borderRadius="xl" 
                      borderWidth="2px" 
                      borderColor={formData.consent_given ? 'green.200' : 'blue.100'}
                      transition="all 0.3s"
                    >
                      <Checkbox 
                        name="consent_given" 
                        isChecked={formData.consent_given} 
                        onChange={handleChange}
                        colorScheme={formData.consent_given ? 'green' : 'blue'}
                        size="lg"
                        spacing={4}
                      >
                        <Text fontSize="sm" color="gray.700">
                          I confirm that I have <Text as="span" fontWeight="700">consent</Text> from this contact to share their details with the placement team.
                        </Text>
                      </Checkbox>
                    </Box>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      size="lg" 
                      bg={colors.dark}
                      color="white" 
                      _hover={{ bg: colors.darkBlue, transform: 'translateY(-2px)' }}
                      _active={{ transform: 'translateY(0)' }}
                      isLoading={isSubmitting} 
                      loadingText="Submitting..." 
                      borderRadius="xl"
                      fontWeight="600"
                      h="60px"
                      fontSize="md"
                      leftIcon={<Icon as={FaPaperPlane} />}
                      isDisabled={!formData.consent_given}
                      _disabled={{ opacity: 0.5, cursor: 'not-allowed', _hover: { transform: 'none' } }}
                      boxShadow="0 4px 14px rgba(23, 46, 54, 0.3)"
                      transition="all 0.2s"
                    >
                      Submit Recommendation
                    </Button>
                  </VStack>
                </form>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </AlumniLayout>
  );
};

export default ReferralForm;
