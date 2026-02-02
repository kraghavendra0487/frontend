import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Container,
  Card,
  CardBody,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import AlumniLayout from '../../components/AlumniLayout';
import { useNavigate } from 'react-router-dom';

const ReferralForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    hr_name: '',
    hr_email: '',
    hr_phone: '',
    job_description: '',
    linkedin_link: '',
    additional_notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.role_title || !formData.hr_email) {
      toast({ title: 'Required fields missing', description: 'Please fill in Company Name, Role, and HR Email.', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: add backend POST /placement/alumni/referral when ready
      // await PlacementService.submitReferral({ ...formData, alumni_usn: user?.usn, alumni_name: user?.name });
      toast({ title: 'Referral Submitted', description: 'Thank you! The placement team will be in touch.', status: 'success', duration: 5000, isClosable: true });
      setFormData({ company_name: '', role_title: '', hr_name: '', hr_email: '', hr_phone: '', job_description: '', linkedin_link: '', additional_notes: '' });
      setTimeout(() => navigate('/placement/alumni-dashboard'), 1500);
    } catch (error) {
      toast({ title: 'Submission Failed', description: error?.message || 'Please try again.', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlumniLayout>
      <Container maxW="container.md" py={6}>
        <Box mb={8} textAlign="center">
          <Heading color="#172e36" mb={2}>Refer an Opportunity</Heading>
          <Text color="gray.600">Help your juniors by connecting us with HRs or Hiring Managers from your network.</Text>
        </Box>

        <Card boxShadow="lg" borderRadius="xl" borderTop="4px solid #d4a960">
          <CardBody p={8}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={5} align="stretch">
                <Box>
                  <Heading size="md" mb={4} color="#2c5261">Job Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl isRequired>
                      <FormLabel>Company Name</FormLabel>
                      <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="e.g. Google, Amazon" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Role / Position</FormLabel>
                      <Input name="role_title" value={formData.role_title} onChange={handleChange} placeholder="e.g. Software Engineer Intern" />
                    </FormControl>
                  </SimpleGrid>
                </Box>
                <FormControl>
                  <FormLabel>Job Description / Link</FormLabel>
                  <Textarea name="job_description" value={formData.job_description} onChange={handleChange} placeholder="Brief description or link to the job posting..." />
                </FormControl>
                <Box mt={4}>
                  <Heading size="md" mb={4} color="#2c5261">HR Contact Details</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    <FormControl isRequired>
                      <FormLabel>HR Name</FormLabel>
                      <Input name="hr_name" value={formData.hr_name} onChange={handleChange} placeholder="Name of the contact person" />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>HR Email</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none"><EmailIcon color="gray.400" /></InputLeftElement>
                        <Input name="hr_email" type="email" value={formData.hr_email} onChange={handleChange} placeholder="hr@company.com" />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>HR Phone (Optional)</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none"><PhoneIcon color="gray.400" /></InputLeftElement>
                        <Input name="hr_phone" value={formData.hr_phone} onChange={handleChange} placeholder="+91 9876543210" />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                      <Input name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                    </FormControl>
                  </SimpleGrid>
                </Box>
                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea name="additional_notes" value={formData.additional_notes} onChange={handleChange} placeholder="Any specific context or advice for the placement team?" />
                </FormControl>
                <Button type="submit" size="lg" bg="#172e36" color="white" _hover={{ bg: '#2c5261' }} isLoading={isSubmitting} loadingText="Submitting..." mt={4} w="full">
                  Submit Referral
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </AlumniLayout>
  );
};

export default ReferralForm;
