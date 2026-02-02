import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  Container,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Badge,
  Flex,
  Divider,
  Link,
  SimpleGrid,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import AlumniLayout from '../../components/AlumniLayout';
import { PlacementService } from '../../services/placement.service';

const FIELD_LABELS = {
  full_name: 'Full name',
  graduation_year: 'Graduation year',
  institution_name: 'Institution',
  current_company: 'Current company',
  current_designation: 'Designation',
  current_work_location: 'Location',
  personal_email: 'Email',
  phone_number: 'Phone',
  linkedin: 'LinkedIn URL',
  other_links: 'Portfolio / other link',
  alumni_remark: 'Bio / note',
};

const initialForm = {
  full_name: '',
  graduation_year: '',
  institution_name: '',
  current_company: '',
  current_designation: '',
  current_work_location: '',
  personal_email: '',
  phone_number: '',
  linkedin: '',
  other_links: '',
  alumni_remark: '',
};

const AlumniProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const toast = useToast();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await PlacementService.getAlumniMe();
      setProfile(data);
      setForm({
        full_name: data.full_name || '',
        graduation_year: data.graduation_year ?? '',
        institution_name: data.institution_name || '',
        current_company: data.current_company || '',
        current_designation: data.current_designation || '',
        current_work_location: data.current_work_location || '',
        personal_email: data.personal_email || '',
        phone_number: data.phone_number || '',
        linkedin: data.linkedin || '',
        other_links: typeof data.other_links === 'object' && data.other_links?.url
          ? data.other_links.url
          : (data.other_links && typeof data.other_links === 'string' ? data.other_links : ''),
        alumni_remark: data.alumni_remark || '',
      });
    } catch (err) {
      toast({
        title: 'Could not load profile',
        description: err.message || 'Please try again.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year, 10) : null,
        other_links: form.other_links ? (form.other_links.trim() ? { url: form.other_links.trim() } : null) : null,
      };
      const updated = await PlacementService.updateAlumniMe(payload);
      setProfile(updated);
      setEditing(false);
      toast({ title: 'Profile updated', status: 'success', isClosable: true });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.message || 'Please try again.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      full_name: profile?.full_name || '',
      graduation_year: profile?.graduation_year ?? '',
      institution_name: profile?.institution_name || '',
      current_company: profile?.current_company || '',
      current_designation: profile?.current_designation || '',
      current_work_location: profile?.current_work_location || '',
      personal_email: profile?.personal_email || '',
      phone_number: profile?.phone_number || '',
      linkedin: profile?.linkedin || '',
      other_links:
        typeof profile?.other_links === 'object' && profile?.other_links?.url
          ? profile.other_links.url
          : (profile?.other_links && typeof profile.other_links === 'string' ? profile.other_links : ''),
      alumni_remark: profile?.alumni_remark || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <AlumniLayout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color="brand.gold" thickness="3px" />
        </Flex>
      </AlumniLayout>
    );
  }

  if (!profile) {
    return (
      <AlumniLayout>
        <Container maxW="2xl" py={8}>
          <Card bg="white" borderRadius="xl" boxShadow="md">
            <CardBody>
              <Text color="gray.600">Profile not found. If you just registered, try logging in again.</Text>
            </CardBody>
          </Card>
        </Container>
      </AlumniLayout>
    );
  }

  const isVerified = profile.is_verified === true;

  return (
    <AlumniLayout>
      <Container maxW="3xl" py={{ base: 4, md: 8 }}>
        {/* Header */}
        <Box mb={8}>
          <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
            <HStack spacing={3} align="baseline" flexWrap="wrap">
              <Heading size="lg" color="#172e36">
                My Profile
              </Heading>
              {isVerified && (
                <Badge
                  colorScheme="green"
                  fontSize="sm"
                  px={2}
                  py={1}
                  borderRadius="md"
                  display="inline-flex"
                  alignItems="center"
                  gap={1}
                >
                  <CheckIcon /> Alumni verified
                </Badge>
              )}
            </HStack>
            {!editing ? (
              <Button
                leftIcon={<EditIcon />}
                bg="#d4a960"
                color="#172e36"
                _hover={{ bg: '#c49a50' }}
                onClick={() => setEditing(true)}
              >
                Edit profile
              </Button>
            ) : (
              <HStack>
                <Button variant="ghost" leftIcon={<CloseIcon />} onClick={handleCancel} isDisabled={saving}>
                  Cancel
                </Button>
                <Button
                  leftIcon={<CheckIcon />}
                  bg="#172e36"
                  color="white"
                  _hover={{ bg: '#1e3a47' }}
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                >
                  Save
                </Button>
              </HStack>
            )}
          </Flex>
          <Text color="gray.500" fontSize="sm" mt={2}>
            Control what juniors and the network see. Keep your info up to date for credibility.
          </Text>
        </Box>

        {editing ? (
          <Card bg="white" borderRadius="xl" boxShadow="md" overflow="hidden">
            <CardBody p={{ base: 5, md: 8 }}>
              <VStack align="stretch" spacing={5}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.full_name}</FormLabel>
                    <Input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.graduation_year}</FormLabel>
                    <Input
                      name="graduation_year"
                      type="number"
                      value={form.graduation_year}
                      onChange={handleChange}
                      placeholder="e.g. 2022"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel fontWeight="500">{FIELD_LABELS.institution_name}</FormLabel>
                  <Input
                    name="institution_name"
                    value={form.institution_name}
                    onChange={handleChange}
                    placeholder="College / university name"
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>

                <Divider borderColor="gray.200" />

                <Heading size="sm" color="gray.600">
                  Current role
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.current_company}</FormLabel>
                    <Input
                      name="current_company"
                      value={form.current_company}
                      onChange={handleChange}
                      placeholder="Company name"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.current_designation}</FormLabel>
                    <Input
                      name="current_designation"
                      value={form.current_designation}
                      onChange={handleChange}
                      placeholder="Job title"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.current_work_location}</FormLabel>
                    <Input
                      name="current_work_location"
                      value={form.current_work_location}
                      onChange={handleChange}
                      placeholder="City / remote"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                </SimpleGrid>

                <Divider borderColor="gray.200" />

                <Heading size="sm" color="gray.600">
                  Contact & links
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.personal_email}</FormLabel>
                    <Input
                      name="personal_email"
                      type="email"
                      value={form.personal_email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="500">{FIELD_LABELS.phone_number}</FormLabel>
                    <Input
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      placeholder="Phone number"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel fontWeight="500">{FIELD_LABELS.linkedin}</FormLabel>
                  <Input
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="500">{FIELD_LABELS.other_links}</FormLabel>
                  <Input
                    name="other_links"
                    value={form.other_links}
                    onChange={handleChange}
                    placeholder="Portfolio or personal website URL"
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                  <FormHelperText>Optional. One URL for portfolio or personal site.</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="500">{FIELD_LABELS.alumni_remark}</FormLabel>
                  <Input
                    name="alumni_remark"
                    value={form.alumni_remark}
                    onChange={handleChange}
                    placeholder="Short bio or note for juniors"
                    bg="gray.50"
                    borderColor="gray.200"
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Card bg="white" borderRadius="xl" boxShadow="md" overflow="hidden">
            <CardBody p={{ base: 5, md: 8 }}>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Name & batch
                  </Text>
                  <Text fontWeight="600" fontSize="lg">
                    {profile.full_name || '—'}
                  </Text>
                  <Text color="gray.600">
                    {profile.graduation_year ? `Batch of ${profile.graduation_year}` : ''}
                    {profile.institution_name ? ` • ${profile.institution_name}` : ''}
                  </Text>
                </Box>

                <Divider borderColor="gray.200" />

                <Box>
                  <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
                    Current role
                  </Text>
                  <Text fontWeight="600" color="#172e36" fontSize="lg">
                    {profile.current_company || '—'}
                  </Text>
                  <Text fontWeight="500">{profile.current_designation || '—'}</Text>
                  <Text color="gray.600">{profile.current_work_location || '—'}</Text>
                </Box>

                <Divider borderColor="gray.200" />

                <Box>
                  <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
                    Contact & links
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {profile.personal_email && (
                      <Text>
                        <Text as="span" color="gray.500" mr={2}>
                          Email:
                        </Text>
                        {profile.personal_email}
                      </Text>
                    )}
                    {profile.phone_number && (
                      <Text>
                        <Text as="span" color="gray.500" mr={2}>
                          Phone:
                        </Text>
                        {profile.phone_number}
                      </Text>
                    )}
                    {profile.linkedin && (
                      <Link href={profile.linkedin} isExternal color="blue.600" fontSize="sm">
                        LinkedIn →
                      </Link>
                    )}
                    {profile.other_links && (
                      <Link
                        href={
                          typeof profile.other_links === 'object' && profile.other_links?.url
                            ? profile.other_links.url
                            : profile.other_links
                        }
                        isExternal
                        color="blue.600"
                        fontSize="sm"
                      >
                        Portfolio / website →
                      </Link>
                    )}
                    {!profile.personal_email && !profile.phone_number && !profile.linkedin && !profile.other_links && (
                      <Text color="gray.400">No contact or links added yet.</Text>
                    )}
                  </VStack>
                </Box>

                {profile.alumni_remark && (
                  <>
                    <Divider borderColor="gray.200" />
                    <Box>
                      <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Bio / note
                      </Text>
                      <Text color="gray.700">{profile.alumni_remark}</Text>
                    </Box>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </Container>
    </AlumniLayout>
  );
};

export default AlumniProfile;
