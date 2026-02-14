import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Image,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Container,
  Spinner,
  useToast,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';
import { CompanyLogo } from '../../components/CompanyLogo';
import { PlacementService } from '../../services/placement.service';
import { useAuth } from '../../context/AuthContext';

const emptyContact = () => ({ id: null, contact_name: '', email: '', phone_number: '', role_title: '', remarks: '' });
const toContactRow = (c) => ({ id: c.id || null, contact_name: c.contact_name || '', email: c.email || '', phone_number: c.phone_number || '', role_title: c.role_title || '', remarks: c.remarks || '' });

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { userRole } = useAuth();
  const isVc = (userRole || '').toLowerCase() === 'vc';
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [company, setCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [drives, setDrives] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [editContacts, setEditContacts] = useState([]);
  const [deletedContactIds, setDeletedContactIds] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [companyData, contactsData, drivesData, offersData] = await Promise.all([
        PlacementService.getCompanyById(id),
        PlacementService.getCompanyContacts(id),
        PlacementService.getCompanyDrives(id),
        PlacementService.getCompanyOffers(id),
      ]);
      if (!companyData) {
        toast({ title: 'Company not found', status: 'error' });
        navigate('/placement/companies');
        return;
      }
      setCompany(companyData);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
      setDrives(Array.isArray(drivesData) ? drivesData : []);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (err) {
      console.error('Error fetching company details:', err);
      toast({ title: 'Error loading data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setEditCompany({
      company_name: company.company_name || '',
      description: company.description || '',
      company_type: company.company_type || '',
      address: company.address || '',
      website: company.website || '',
      linkedin: company.linkedin || '',
      remarks: Array.isArray(company.remarks) ? company.remarks : (company.remarks ? [company.remarks] : []),
      company_logo_link: company.company_logo_link || company.logo || '',
    });
    setEditContacts((contacts || []).map(toContactRow));
    setDeletedContactIds([]);
    onEditOpen();
  };

  const handleEditCompanyChange = (field, value) => {
    setEditCompany((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditContactChange = (index, field, value) => {
    const updated = [...editContacts];
    if (!updated[index]) updated[index] = emptyContact();
    updated[index] = { ...updated[index], [field]: value };
    setEditContacts(updated);
  };
  const addEditContact = () => setEditContacts([...editContacts, emptyContact()]);
  const removeEditContact = (index) => {
    const c = editContacts[index];
    if (c && c.id) setDeletedContactIds((prev) => [...prev, c.id]);
    setEditContacts(editContacts.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async () => {
    const name = (editCompany.company_name || '').trim();
    if (!name) {
      toast({ title: 'Company name is required', status: 'warning' });
      return;
    }
    setEditSubmitting(true);
    try {
      const remarks = Array.isArray(editCompany.remarks) ? editCompany.remarks : (editCompany.remarks ? [editCompany.remarks] : []);
      await PlacementService.updateCompany(id, {
        company_name: name,
        description: editCompany.description || null,
        company_type: editCompany.company_type || null,
        address: editCompany.address || null,
        website: editCompany.website || null,
        linkedin: editCompany.linkedin || null,
        remarks: remarks.length ? remarks : null,
        company_logo_link: editCompany.company_logo_link || null,
      });
      for (const contactId of deletedContactIds) {
        await PlacementService.deleteCompanyContact(id, contactId);
      }
      for (const c of editContacts) {
        const payload = { contact_name: c.contact_name || null, email: c.email || null, phone_number: c.phone_number || null, role_title: c.role_title || null, remarks: c.remarks || null };
        if (!payload.contact_name && !payload.email && !payload.phone_number) continue;
        if (c.id) {
          await PlacementService.updateCompanyContact(id, c.id, payload);
        } else {
          await PlacementService.addCompanyContacts(id, [payload]);
        }
      }
      toast({ title: 'Profile updated', status: 'success' });
      onEditClose();
      fetchDetails();
    } catch (err) {
      toast({ title: err.message || 'Error saving', status: 'error' });
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Flex justify="center" align="center" minH="80vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </AdminLayout>
    );
  }

  if (!company) return null;

  return (
    <AdminLayout>
      <Box bg="#f0f0f0" minH="100vh" pb={10}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }} pt={8}>
          <Flex mb={6} justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="gray.800">Company Details</Heading>
              <Text color="gray.500" fontSize="sm">Full company info with placements and offers</Text>
            </Box>
            <HStack spacing={3}>
              {!isVc && (
                <Button
                  leftIcon={<EditIcon />}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={openEdit}
                >
                  Edit profile
                </Button>
              )}
              <Button
                leftIcon={<ArrowBackIcon />}
                size="sm"
                variant="outline"
                onClick={() => navigate('/placement/companies')}
                bg="white"
              >
                Back
              </Button>
            </HStack>
          </Flex>

          <Card mb={8} borderRadius="xl" shadow="sm" overflow="hidden">
            <CardBody p={6}>
              <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="start">
                <Box flexShrink={0} border="1px solid" borderColor="gray.100">
                  <CompanyLogo
                    src={company.logo || company.company_logo_link}
                    name={company.company_name}
                    boxSize="100px"
                    variant="square"
                  />
                </Box>
                <Box flex="1">
                  <Flex justify="space-between" align="start">
                    <Heading size="md" mb={2}>{company.company_name}</Heading>
                    {company.company_type && (
                      <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                        {company.company_type}
                      </Badge>
                    )}
                  </Flex>
                  <Text color="gray.600" mb={4} fontSize="sm">
                    {company.description || 'No description available.'}
                  </Text>
                  <HStack spacing={6} fontSize="sm">
                    {company.website && (
                      <Link href={company.website} isExternal color="blue.500" fontWeight="medium">
                        Website <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                    {company.linkedin && (
                      <Link href={company.linkedin} isExternal color="blue.600" fontWeight="medium">
                        LinkedIn <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                  </HStack>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {contacts.length > 0 && (
            <Card mb={8} borderRadius="xl" shadow="sm" overflow="hidden">
              <CardBody p={6}>
                <Heading size="md" mb={4} color="gray.700">Contacts</Heading>
                <VStack align="stretch" spacing={3}>
                  {contacts.map((c) => (
                    <Flex key={c.id} justify="space-between" align="start" py={2} borderBottomWidth="1px" borderColor="gray.100" _last={{ borderBottom: 'none' }}>
                      <Box>
                        <Text fontWeight="medium">{c.contact_name || '–'}</Text>
                        {(c.role_title || c.email || c.phone_number) && (
                          <HStack mt={1} spacing={4} fontSize="sm" color="gray.600">
                            {c.role_title && <Text>{c.role_title}</Text>}
                            {c.email && <Link href={`mailto:${c.email}`}>{c.email}</Link>}
                            {c.phone_number && <Text>{c.phone_number}</Text>}
                          </HStack>
                        )}
                        {c.remarks && <Text fontSize="xs" color="gray.500" mt={1}>{c.remarks}</Text>}
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          )}

          <Box mb={8}>
            <Heading size="md" mb={4} color="gray.700">Placements</Heading>
            <Card borderRadius="xl" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#172e36">
                    <Tr>
                      <Th color="white">TPO</Th>
                      <Th color="white">Year</Th>
                      <Th color="white">School</Th>
                      <Th color="white">Course</Th>
                      <Th color="white">Job Profile</Th>
                      <Th color="white">Job Type</Th>
                      <Th color="white">Avg Internship Stipend</Th>
                      <Th color="white">CTC</Th>
                      <Th color="white">Final Selects</Th>
                      <Th color="white">Company Remarks</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {drives.length > 0 ? (
                      drives.map((drive) => (
                        <Tr key={drive.id} _hover={{ bg: 'gray.50' }}>
                          <Td>{drive.tpo}</Td>
                          <Td>{drive.year}</Td>
                          <Td>{drive.school}</Td>
                          <Td>{drive.course}</Td>
                          <Td fontWeight="medium">{drive.job_profile}</Td>
                          <Td>{drive.job_type}</Td>
                          <Td>{drive.internship_stipend}</Td>
                          <Td>{drive.ctc}</Td>
                          <Td>
                            <Badge colorScheme="green" variant="solid" borderRadius="full" px={2}>
                              {drive.no_shortlisted}
                            </Badge>
                          </Td>
                          <Td color="gray.500" fontSize="xs" maxW="200px" isTruncated>
                            {drive.company_remarks || '-'}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={10} textAlign="center" py={4} color="gray.500">
                          No placement drives found.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </Box>

          <Box>
            <Heading size="md" mb={4} color="gray.700">Students & Job Offers</Heading>
            <Card borderRadius="xl" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="#172e36">
                    <Tr>
                      <Th color="white">USN</Th>
                      <Th color="white">Student Name</Th>
                      <Th color="white">School</Th>
                      <Th color="white">CTC</Th>
                      <Th color="white">Job Type</Th>
                      <Th color="white">Designation</Th>
                      <Th color="white">Offer Letter Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {offers.length > 0 ? (
                      offers.map((offer) => (
                        <Tr
                          key={offer.id}
                          _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                          onClick={() => offer.usn && navigate(`/placement/students/${offer.usn}`)}
                        >
                          <Td>
                            <Badge variant="subtle" colorScheme="blue">{offer.usn}</Badge>
                          </Td>
                          <Td fontWeight="medium">{offer.student_name || '-'}</Td>
                          <Td>{offer.school || '-'}</Td>
                          <Td>{offer.ctc}</Td>
                          <Td>{offer.job_type}</Td>
                          <Td>{offer.designation}</Td>
                          <Td>
                            <Badge colorScheme={offer.offer_letter_status === 'Issued' ? 'green' : 'orange'}>
                              {offer.offer_letter_status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={4} color="gray.500">
                          No students hired yet.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Card>
          </Box>

          <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {editCompany && (
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Company Name</FormLabel>
                      <Input
                        value={editCompany.company_name}
                        onChange={(e) => handleEditCompanyChange('company_name', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={editCompany.description}
                        onChange={(e) => handleEditCompanyChange('description', e.target.value)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Company Type</FormLabel>
                      <Select
                        placeholder="Select type"
                        value={editCompany.company_type}
                        onChange={(e) => handleEditCompanyChange('company_type', e.target.value)}
                      >
                        <option value="Service">Service</option>
                        <option value="Product">Product</option>
                        <option value="Startup">Startup</option>
                        <option value="Fintech">Fintech</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Textarea value={editCompany.address} onChange={(e) => handleEditCompanyChange('address', e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Website</FormLabel>
                      <Input value={editCompany.website} onChange={(e) => handleEditCompanyChange('website', e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>LinkedIn</FormLabel>
                      <Input value={editCompany.linkedin} onChange={(e) => handleEditCompanyChange('linkedin', e.target.value)} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Logo URL</FormLabel>
                      <Input value={editCompany.company_logo_link} onChange={(e) => handleEditCompanyChange('company_logo_link', e.target.value)} placeholder="Paste logo URL" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Remarks</FormLabel>
                      <VStack spacing={2} align="stretch">
                        {(Array.isArray(editCompany.remarks) ? editCompany.remarks : [editCompany.remarks || '']).map((r, idx) => (
                          <Input
                            key={idx}
                            value={r}
                            onChange={(e) => {
                              const arr = Array.isArray(editCompany.remarks) ? [...editCompany.remarks] : [editCompany.remarks || ''];
                              arr[idx] = e.target.value;
                              handleEditCompanyChange('remarks', arr);
                            }}
                            placeholder={`Remark ${idx + 1}`}
                          />
                        ))}
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          variant="outline"
                          onClick={() => handleEditCompanyChange('remarks', [...(Array.isArray(editCompany.remarks) ? editCompany.remarks : [editCompany.remarks || '']), ''])}
                        >
                          Add remark
                        </Button>
                      </VStack>
                    </FormControl>

                    <Heading size="sm" mt={4} color="gray.700">Contacts</Heading>
                    <Text fontSize="sm" color="gray.600">Add or edit contacts for this company.</Text>
                    {editContacts.map((contact, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium" fontSize="sm">Contact {index + 1}</Text>
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeEditContact(index)}
                            aria-label="Remove contact"
                          />
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          <FormControl>
                            <FormLabel fontSize="xs">Name</FormLabel>
                            <Input
                              size="sm"
                              value={contact.contact_name}
                              onChange={(e) => handleEditContactChange(index, 'contact_name', e.target.value)}
                              placeholder="Contact name"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">Email</FormLabel>
                            <Input
                              size="sm"
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleEditContactChange(index, 'email', e.target.value)}
                              placeholder="email@company.com"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">Phone</FormLabel>
                            <Input
                              size="sm"
                              value={contact.phone_number}
                              onChange={(e) => handleEditContactChange(index, 'phone_number', e.target.value)}
                              placeholder="Phone number"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs">Role / Title</FormLabel>
                            <Input
                              size="sm"
                              value={contact.role_title}
                              onChange={(e) => handleEditContactChange(index, 'role_title', e.target.value)}
                              placeholder="e.g. HR, Recruiter"
                            />
                          </FormControl>
                          <FormControl gridColumn={{ base: '1', md: '1 / -1' }}>
                            <FormLabel fontSize="xs">Remarks</FormLabel>
                            <Input
                              size="sm"
                              value={contact.remarks}
                              onChange={(e) => handleEditContactChange(index, 'remarks', e.target.value)}
                              placeholder="Optional"
                            />
                          </FormControl>
                        </SimpleGrid>
                      </Box>
                    ))}
                    <Button leftIcon={<AddIcon />} size="sm" onClick={addEditContact} alignSelf="flex-start" variant="outline">
                      Add contact
                    </Button>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
                <Button colorScheme="blue" onClick={handleSaveEdit} isLoading={editSubmitting} loadingText="Saving">
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default CompanyDetails;
