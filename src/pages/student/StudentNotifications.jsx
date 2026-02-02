import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Card,
  CardBody,
  Badge,
  Spinner,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { FaStar, FaRegStar, FaArchive, FaEnvelope, FaEnvelopeOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { NotificationService } from '../../services/notification.service';
import { useStudentDataCache } from '../../context/StudentDataCacheContext';
import '../admin/Notifications.css';

const typeColor = (t) => {
  const m = { SYSTEM: 'gray', ACADEMIC: 'blue', PLACEMENT: 'green', ALERT: 'red', GENERAL: 'teal' };
  return m[t] || 'gray';
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '-');

export const StudentNotifications = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [markingId, setMarkingId] = useState(null);
  const { cache, loading, clearCache, fetchNotifications } = useStudentDataCache();

  const list = cache.notifications.list;
  const isLoading = !cache.notifications.loaded && loading.notifications;
  const [actionId, setActionId] = useState(null); // star or archive in progress

  useEffect(() => {
    clearCache('notifications');
    fetchNotifications();
  }, [clearCache, fetchNotifications]);

  const unread = list.filter((n) => !n.isRead && !n.isArchived);
  const read = list.filter((n) => n.isRead && !n.isArchived);
  const starred = list.filter((n) => n.isStarred && !n.isArchived);
  const archived = list.filter((n) => n.isArchived);

  const handleMarkAsRead = async (id) => {
    setMarkingId(id);
    try {
      await NotificationService.markAsRead(id);
      await fetchNotifications();
    } catch {
      toast({ title: 'Failed to mark as read', status: 'error', isClosable: true });
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await fetchNotifications();
      toast({ title: 'All marked as read', status: 'success', isClosable: true });
    } catch {
      toast({ title: 'Failed to mark all as read', status: 'error', isClosable: true });
    }
  };

  const handleToggleStar = async (id) => {
    setActionId(id);
    try {
      await NotificationService.toggleStar(id);
      await fetchNotifications();
    } catch {
      toast({ title: 'Failed to update star', status: 'error', isClosable: true });
    } finally {
      setActionId(null);
    }
  };

  const handleToggleArchive = async (id) => {
    setActionId(id);
    try {
      await NotificationService.toggleArchive(id);
      await fetchNotifications();
    } catch {
      toast({ title: 'Failed to update archive', status: 'error', isClosable: true });
    } finally {
      setActionId(null);
    }
  };

  const NotificationCard = ({ n, onMarkRead, onLinkClick, onStar, onArchive }) => (
    <Card
      className={`student-notification-card ${n.isRead ? '' : 'unread'}`}
      bg={n.isRead ? 'white' : 'blue.50'}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      borderLeftWidth="4px"
      borderLeftColor={n.isRead ? 'transparent' : 'blue.400'}
    >
      <CardBody>
        <HStack justify="space-between" align="flex-start" mb={2}>
          <HStack spacing={2}>
            <Badge colorScheme={typeColor(n.type)} className="student-notification-badge">{n.type}</Badge>
            <IconButton
              aria-label={n.isStarred ? 'Unstar' : 'Star'}
              icon={<Icon as={n.isStarred ? FaStar : FaRegStar} color={n.isStarred ? 'yellow.500' : 'gray.400'} boxSize={4} />}
              size="xs"
              variant="ghost"
              isLoading={actionId === n.id}
              onClick={() => onStar(n.id)}
              _hover={{ bg: n.isStarred ? 'yellow.50' : 'gray.100' }}
            />
            <IconButton
              aria-label={n.isArchived ? 'Unarchive' : 'Archive'}
              icon={<Icon as={FaArchive} color="gray.500" boxSize={4} />}
              size="xs"
              variant="ghost"
              isLoading={actionId === n.id}
              onClick={() => onArchive(n.id)}
              _hover={{ bg: 'gray.100' }}
            />
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {formatDate(n.deliveredAt || n.delivered_at)}
          </Text>
        </HStack>
        <Heading size="sm" className="student-notification-title" color="#20343c" mb={1}>
          {n.title}
        </Heading>
        <Text fontSize="sm" className="student-notification-message" color="gray.600" whiteSpace="pre-wrap" mb={2}>
          {n.message}
        </Text>
        {(n.link || n.drive_id != null || n.event_id != null) && (
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            mt={2}
            className="student-notification-link-btn"
            onClick={() => {
              onMarkRead && onMarkRead(n.id);
              const driveOrEventId = n.drive_id ?? n.event_id;
              if (driveOrEventId != null) {
                onLinkClick(`/student/placements/drive/${driveOrEventId}`);
                return;
              }
              if (n.link?.startsWith('/')) {
                onLinkClick(n.link);
              } else if (n.link) {
                window.open(n.link, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {(n.drive_id ?? n.event_id) != null
              ? 'Go to Drive'
              : (n.event_id && n.title?.startsWith('Event: ')
                ? `View Event: ${n.title.slice(7)}`
                : 'View Link')}
          </Button>
        )}
        {!n.isRead && (
          <Button
            size="xs"
            mt={2}
            colorScheme="blue"
            variant="outline"
            isLoading={markingId === n.id}
            onClick={() => onMarkRead(n.id)}
          >
            Mark as read
          </Button>
        )}
      </CardBody>
    </Card>
  );

  return (
    <Box py={0} className="student-notifications-page">
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4} className="student-notifications-header">
          <Heading size="lg" color="#20343c">
            Notifications
          </Heading>
          {unread.length > 0 && (
            <Button size="sm" colorScheme="blue" variant="outline" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </Flex>

        {isLoading ? (
          <Flex justify="center" py={12}>
            <Spinner size="lg" color="#20343c" />
          </Flex>
        ) : list.length === 0 ? (
          <Card bg="white" shadow="sm" className="student-notifications-empty">
            <CardBody>
              <VStack py={8}>
                <Text color="gray.500">No notifications yet.</Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Tabs colorScheme="blue" variant="enclosed" className="student-notifications-tabs">
            <TabList flexWrap="wrap" gap={1}>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaEnvelope} boxSize={4} />
                  <span>Unread</span>
                  <Badge colorScheme="red" fontSize="xs">{unread.length}</Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaEnvelopeOpen} boxSize={4} />
                  <span>Read</span>
                  <Badge colorScheme="gray" fontSize="xs">{read.length}</Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaStar} color="yellow.500" boxSize={4} />
                  <span>Starred</span>
                  <Badge colorScheme="yellow" fontSize="xs">{starred.length}</Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaArchive} boxSize={4} />
                  <span>Archive</span>
                  <Badge colorScheme="gray" fontSize="xs">{archived.length}</Badge>
                </HStack>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                {unread.length === 0 ? (
                  <Text color="gray.500" py={4}>
                    No unread notifications.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {unread.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onMarkRead={handleMarkAsRead}
                        onLinkClick={(url) => navigate(url)}
                        onStar={handleToggleStar}
                        onArchive={handleToggleArchive}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>
              <TabPanel px={0}>
                {read.length === 0 ? (
                  <Text color="gray.500" py={4}>
                    No read notifications.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {read.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onLinkClick={(url) => navigate(url)}
                        onStar={handleToggleStar}
                        onArchive={handleToggleArchive}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>
              <TabPanel px={0}>
                {starred.length === 0 ? (
                  <Text color="gray.500" py={4}>
                    No starred notifications.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {starred.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onMarkRead={handleMarkAsRead}
                        onLinkClick={(url) => navigate(url)}
                        onStar={handleToggleStar}
                        onArchive={handleToggleArchive}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>
              <TabPanel px={0}>
                {archived.length === 0 ? (
                  <Text color="gray.500" py={4}>
                    No archived notifications.
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={3}>
                    {archived.map((n) => (
                      <NotificationCard
                        key={n.id}
                        n={n}
                        onMarkRead={handleMarkAsRead}
                        onLinkClick={(url) => navigate(url)}
                        onStar={handleToggleStar}
                        onArchive={handleToggleArchive}
                      />
                    ))}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
  );
};
