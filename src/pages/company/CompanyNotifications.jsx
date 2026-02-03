import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  useToast,
  Flex,
  Icon,
  Badge,
  Spinner,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { 
  BellIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import { 
  FaBell, 
  FaBriefcase,
  FaCalendarAlt,
  FaInfoCircle,
} from 'react-icons/fa';
import CompanyLayout from '../../components/CompanyLayout';
import { CompanyService } from '../../services/company.service';

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

const getNotificationConfig = (type) => {
  switch (type?.toUpperCase()) {
    case 'PLACEMENT':
      return { icon: FaBriefcase, color: 'blue', bg: 'blue.50' };
    case 'ACADEMIC':
      return { icon: FaCalendarAlt, color: 'purple', bg: 'purple.50' };
    case 'ALERT':
      return { icon: WarningIcon, color: 'orange', bg: 'orange.50' };
    case 'SYSTEM':
      return { icon: FaInfoCircle, color: 'gray', bg: 'gray.100' };
    default:
      return { icon: FaBell, color: 'teal', bg: 'teal.50' };
  }
};

const CompanyNotifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await CompanyService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      toast({
        title: 'Failed to load notifications',
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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      const days = Math.floor(diffDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-IN', {
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

  return (
    <CompanyLayout>
      <Box bg={colors.pageBg} minH="100vh" py={8}>
        <Container maxW="900px">
          {/* Header */}
          <Box mb={8}>
            <Heading size="xl" color={colors.dark} mb={1}>
              Notifications
            </Heading>
            <Text color={colors.secondary} fontSize="md">
              Stay updated with placement activities and announcements
            </Text>
          </Box>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card bg="white" borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={colors.border}>
              <CardBody py={16}>
                <VStack spacing={4}>
                  <Flex
                    w="100px"
                    h="100px"
                    borderRadius="full"
                    bg={colors.accentLight}
                    align="center"
                    justify="center"
                  >
                    <Icon as={FaBell} boxSize={12} color={colors.accent} opacity={0.6} />
                  </Flex>
                  <Heading size="md" color={colors.dark}>No notifications yet</Heading>
                  <Text color={colors.secondary} textAlign="center" maxW="400px">
                    You'll see placement updates, drive announcements, and other important notifications here.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              {notifications.map((notif) => {
                const config = getNotificationConfig(notif.type);
                return (
                  <Card 
                    key={notif.id} 
                    bg="white" 
                    borderRadius="xl" 
                    boxShadow="sm" 
                    border="1px solid" 
                    borderColor={colors.border}
                    _hover={{ boxShadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <CardBody p={5}>
                      <Flex gap={4}>
                        <Flex 
                          w="48px" 
                          h="48px" 
                          bg={config.bg} 
                          borderRadius="xl" 
                          align="center" 
                          justify="center"
                          flexShrink={0}
                        >
                          <Icon as={config.icon} color={`${config.color}.500`} boxSize={5} />
                        </Flex>
                        <Box flex="1">
                          <HStack justify="space-between" mb={1} flexWrap="wrap" gap={2}>
                            <HStack spacing={2}>
                              <Heading size="sm" color={colors.dark}>{notif.title}</Heading>
                              <Badge colorScheme={config.color} fontSize="xs" borderRadius="full">
                                {notif.type}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color={colors.secondary}>
                              {formatDate(notif.created_at)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color={colors.secondary} lineHeight="1.6">
                            {notif.message}
                          </Text>
                          {notif.link && (
                            <Text 
                              as="a" 
                              href={notif.link} 
                              fontSize="sm" 
                              color={colors.accent} 
                              fontWeight="500"
                              mt={2}
                              display="inline-block"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              Learn more →
                            </Text>
                          )}
                        </Box>
                      </Flex>
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          )}
        </Container>
      </Box>
    </CompanyLayout>
  );
};

export default CompanyNotifications;
