import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  useToast,
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
  useDisclosure,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AddIcon, BellIcon } from '@chakra-ui/icons';
import AdminLayout from '../../components/AdminLayout';
import { NotificationService } from '../../services/notification.service';
import './Notifications.css';

const NOTIFICATION_TYPES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'PLACEMENT', label: 'Placement' },
  { value: 'ALERT', label: 'Alert' },
  { value: 'SYSTEM', label: 'System' },
];

const Notifications = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    link: '',
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await NotificationService.list({ limit: 50 });
      setNotifications(data.notifications || []);
    } catch (err) {
      toast({
        title: 'Error fetching notifications',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setForm({ title: '', message: '', type: 'GENERAL', link: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.message?.trim()) {
      toast({ title: 'Title and message are required', status: 'warning', isClosable: true });
      return;
    }
    setSubmitting(true);
    try {
      const n = await NotificationService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        link: form.link?.trim() || undefined,
      });
      toast({
        title: 'Notification created',
        description: 'Go to the notification to select students and send.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleClose();
      fetchNotifications();
      if (n?.id) navigate(`/placement/notifications/${n.id}`);
    } catch (err) {
      toast({
        title: err.message || 'Failed to create notification',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const typeColor = (t) => {
    const m = { SYSTEM: 'gray', ACADEMIC: 'blue', PLACEMENT: 'green', ALERT: 'red', GENERAL: 'teal' };
    return m[t] || 'gray';
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8} className="notifications-page">
        <VStack align="stretch" spacing={6}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} className="notifications-header">
            <Heading size="lg" color="#20343c">
              Notifications
            </Heading>
            <Button
              className="notifications-add-btn"
              leftIcon={<AddIcon />}
              bg="#20343c"
              color="white"
              _hover={{ bg: '#1a2b32' }}
              onClick={onOpen}
            >
              Add Notification
            </Button>
          </Flex>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="lg" color="#20343c" />
            </Flex>
          ) : notifications.length === 0 ? (
            <Card className="notification-empty">
              <CardBody>
                <VStack py={8}>
                  <Box className="notification-empty-icon">
                    <BellIcon boxSize={12} color="gray.400" />
                  </Box>
                  <Text className="notification-empty-text">No notifications yet. Create one, then select students and send.</Text>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    leftIcon={<AddIcon />}
                    onClick={onOpen}
                  >
                    Add Notification
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} className="notifications-grid">
              {notifications.map((n) => (
                <Card
                  key={n.id}
                  className="notification-card"
                  bg="white"
                  shadow="sm"
                  _hover={{ shadow: 'md', cursor: 'pointer' }}
                  onClick={() => navigate(`/placement/notifications/${n.id}`)}
                >
                  <CardBody>
                    <HStack justify="space-between" mb={2} className="notification-card-badges">
                      <Badge colorScheme={typeColor(n.type)}>{n.type}</Badge>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(n.created_at)}
                      </Text>
                    </HStack>
                    <Heading size="sm" className="notification-card-title" color="#20343c" mb={2}>
                      {n.title}
                    </Heading>
                    <HStack spacing={4} fontSize="sm" color="gray.600" flexWrap="wrap" className="notification-card-stats">
                      <Text><strong>Sent:</strong> {n.sent ?? 0}</Text>
                      <Text><strong>Unread:</strong> {n.unread ?? 0}</Text>
                      <Text><strong>Read:</strong> {n.read ?? 0}</Text>
                    </HStack>
                    <Text fontSize="sm" className="notification-card-preview" color="gray.500" mt={2} noOfLines={2}>
                      {n.message}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="notifications-modal">
          <ModalHeader>Add Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="Notification title"
                  bg="gray.50"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  placeholder="Notification message"
                  rows={4}
                  bg="gray.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select name="type" value={form.type} onChange={handleInputChange} bg="gray.50">
                  {NOTIFICATION_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Link (optional)</FormLabel>
                <Input
                  name="link"
                  value={form.link}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  bg="gray.50"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              bg="#20343c"
              color="white"
              _hover={{ bg: '#1a2b32' }}
              onClick={handleSubmit}
              isLoading={submitting}
              isDisabled={!form.title?.trim() || !form.message?.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
};

export default Notifications;
