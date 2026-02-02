import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  useToast,
  Container,
  Card,
  CardBody,
  Badge,
  Spinner,
  Flex,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  IconButton,
  useBreakpointValue,
  SimpleGrid,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ArrowBackIcon, AddIcon, RepeatIcon, EmailIcon } from '@chakra-ui/icons';
import { getFileUrl } from '../../utils/fileUrl';
import AdminLayout from '../../components/AdminLayout';
import { NotificationService } from '../../services/notification.service';
import { StudentProfileService } from '../../services/studentProfile.service';
import './Notifications.css';

const typeColor = (t) => {
  const m = { SYSTEM: 'gray', ACADEMIC: 'blue', PLACEMENT: 'green', ALERT: 'red', GENERAL: 'teal' };
  return m[t] || 'gray';
};

const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [notification, setNotification] = useState(null);
  const [recipientsData, setRecipientsData] = useState(null);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [programId, setProgramId] = useState('');
  const [yearOfJoining, setYearOfJoining] = useState('');
  const [isActive, setIsActive] = useState('');
  const [selectedUsns, setSelectedUsns] = useState(new Set());
  const [selectedRecipientUsns, setSelectedRecipientUsns] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNotification = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await NotificationService.getById(id);
      setNotification(data);
    } catch (err) {
      toast({ title: 'Notification not found', status: 'error', isClosable: true });
      navigate('/placement/notifications');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  const fetchRecipients = useCallback(async () => {
    if (!id) return;
    setRecipientsLoading(true);
    try {
      const data = await NotificationService.getRecipients(id);
      setRecipientsData(data);
    } catch (err) {
      toast({ title: 'Failed to load recipients', status: 'error', isClosable: true });
      setRecipientsData(null);
    } finally {
      setRecipientsLoading(false);
    }
  }, [id, toast]);

  const fetchFilters = useCallback(async () => {
    try {
      const [schoolsData, programsData] = await Promise.all([
        StudentProfileService.getSchools(),
        StudentProfileService.getPrograms(),
      ]);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (e) {
      console.error('Filters:', e);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchDebounced || undefined,
        school_id: schoolId ? parseInt(schoolId, 10) : undefined,
        program_id: programId ? parseInt(programId, 10) : undefined,
        year_of_joining: yearOfJoining ? parseInt(yearOfJoining, 10) : undefined,
        is_active: isActive === '' ? undefined : isActive,
      };
      const data = await StudentProfileService.getStudentsList(params);
      setStudents(data.students || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      toast({ title: 'Failed to load students', description: e?.message, status: 'error', isClosable: true });
      setStudents([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setStudentsLoading(false);
    }
  }, [page, limit, searchDebounced, schoolId, programId, yearOfJoining, isActive, toast]);

  useEffect(() => { fetchNotification(); }, [fetchNotification]);
  useEffect(() => { fetchFilters(); }, [fetchFilters]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchRecipients();
    }
  }, [activeTab, id, fetchRecipients]);

  const schoolName = (s) => (s?.schools && (s.schools.name || s.schools.abbreviation)) || '—';
  const programName = (s) => (s?.programs && s.programs.name) || '—';

  const onPage = (delta) => setPage((p) => Math.max(1, Math.min(totalPages, p + delta)));

  const toggleSelect = (usn) => {
    setSelectedUsns((prev) => {
      const next = new Set(prev);
      if (next.has(usn)) next.delete(usn);
      else next.add(usn);
      return next;
    });
  };

  const toggleRecipientSelect = (usn) => {
    setSelectedRecipientUsns((prev) => {
      const next = new Set(prev);
      if (next.has(usn)) next.delete(usn);
      else next.add(usn);
      return next;
    });
  };

  const selectAllRecipients = (list, checked) => {
    if (checked) {
      setSelectedRecipientUsns((prev) => {
        const next = new Set(prev);
        list.forEach((r) => next.add(r.usn));
        return next;
      });
    } else {
      setSelectedRecipientUsns((prev) => {
        const next = new Set(prev);
        list.forEach((r) => next.delete(r.usn));
        return next;
      });
    }
  };

  const selectAllOnPage = (checked) => {
    if (checked) {
      setSelectedUsns((prev) => {
        const next = new Set(prev);
        students.forEach((s) => next.add(s.usn));
        return next;
      });
    } else {
      setSelectedUsns((prev) => {
        const next = new Set(prev);
        students.forEach((s) => next.delete(s.usn));
        return next;
      });
    }
  };

  const selectAllMatching = async () => {
    if (total === 0) return;
    setSelectAllLoading(true);
    try {
      const allUsns = new Set();
      for (let p = 1; p <= totalPages; p++) {
        const data = await StudentProfileService.getStudentsList({
          page: p,
          limit,
          search: searchDebounced || undefined,
          school_id: schoolId ? parseInt(schoolId, 10) : undefined,
          program_id: programId ? parseInt(programId, 10) : undefined,
          year_of_joining: yearOfJoining ? parseInt(yearOfJoining, 10) : undefined,
          is_active: isActive === '' ? undefined : isActive,
        });
        (data.students || []).forEach((s) => allUsns.add(s.usn));
      }
      setSelectedUsns(allUsns);
      toast({ title: `Selected ${allUsns.size} students`, status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed to select all', status: 'error', isClosable: true });
    } finally {
      setSelectAllLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedUsns(new Set());
    setSelectedRecipientUsns(new Set());
  };

  const allOnPageSelected = students.length > 0 && students.every((s) => selectedUsns.has(s.usn));
  const someOnPageSelected = students.some((s) => selectedUsns.has(s.usn));

  const handleSend = async () => {
    if (selectedUsns.size === 0) {
      toast({ title: 'Select at least one student', status: 'warning', isClosable: true });
      return;
    }
    setSending(true);
    try {
      const result = await NotificationService.send(id, Array.from(selectedUsns));
      toast({
        title: 'Sent',
        description: `${result?.recipientsCount ?? 0} student(s) received this notification.`,
        status: 'success',
        isClosable: true,
      });
      setSelectedUsns(new Set());
      fetchNotification();
      fetchRecipients();
    } catch (err) {
      toast({ title: err.message || 'Failed to send', status: 'error', isClosable: true });
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    if (selectedRecipientUsns.size === 0) {
      toast({ title: 'Select at least one recipient to resend', status: 'warning', isClosable: true });
      return;
    }
    setResending(true);
    try {
      const result = await NotificationService.resend(id, Array.from(selectedRecipientUsns));
      toast({
        title: 'Resent',
        description: result?.recipientsCount > 0
          ? `${result.recipientsCount} student(s) received the notification again.`
          : result?.message || 'All selected students already had this notification.',
        status: result?.recipientsCount > 0 ? 'success' : 'info',
        isClosable: true,
      });
      setSelectedRecipientUsns(new Set());
      fetchNotification();
      fetchRecipients();
    } catch (err) {
      toast({ title: err.message || 'Failed to resend', status: 'error', isClosable: true });
    } finally {
      setResending(false);
    }
  };

  if (loading || !notification) {
    return (
      <AdminLayout>
        <Flex justify="center" py={12}>
          <Spinner size="xl" color="#20343c" />
        </Flex>
      </AdminLayout>
    );
  }

  const RecipientRow = ({ r, onSelect, isSelected }) => (
    <Tr key={r.usn} _hover={{ bg: 'gray.50' }}>
      <Td>
        <Checkbox isChecked={isSelected} onChange={() => onSelect(r.usn)} />
      </Td>
      <Td>
        <HStack spacing={2}>
          <Avatar size="sm" name={r.fullName} bg="blue.100" />
          <Box>
            <Text fontWeight="medium">{r.fullName}</Text>
            <Text fontSize="xs" color="gray.500">{r.usn}</Text>
          </Box>
        </HStack>
      </Td>
      <Td fontSize="sm">{r.collegeEmail}</Td>
      <Td fontSize="sm">{r.schoolName}</Td>
      <Td fontSize="sm">{r.programName}</Td>
      <Td>
        <Badge colorScheme={r.isRead ? 'green' : 'orange'} size="sm">
          {r.isRead ? 'Read' : 'Unread'}
        </Badge>
      </Td>
      <Td fontSize="xs" color="gray.500">{r.isRead ? formatDate(r.readAt) : formatDate(r.deliveredAt)}</Td>
    </Tr>
  );

  return (
    <AdminLayout>
      <Container maxW="container.xl" py={8} className="notification-detail-page">
        <VStack align="stretch" spacing={6}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4} className="notification-detail-back">
            <HStack spacing={4}>
              <Button
                className="back-btn"
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                size="sm"
                onClick={() => navigate('/placement/notifications')}
              >
                Back
              </Button>
              <Heading size="lg" className="notification-detail-title" color="#20343c">
                {notification.title}
              </Heading>
            </HStack>
          </Flex>

          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue" className="notification-detail-tabs">
            <TabList flexWrap="wrap">
              <Tab>
                <HStack>
                  <EmailIcon />
                  <Text>Sent Notification</Text>
                  <Badge colorScheme="blue" ml={1}>{notification.sent ?? 0}</Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Text>Recipients</Text>
                  <Badge colorScheme="green">{notification.read ?? 0} Read</Badge>
                  <Badge colorScheme="orange">{notification.unread ?? 0} Unread</Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <AddIcon />
                  <Text>Send to More</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Tab 1: Sent Notification */}
              <TabPanel px={0} pt={4}>
                <Card bg="white" shadow="sm" className="notification-content-card">
                  <CardBody>
                    <HStack mb={3} justify="space-between" wrap="wrap" gap={2}>
                      <Badge colorScheme={typeColor(notification.type)} fontSize="sm">{notification.type}</Badge>
                      <HStack spacing={4} fontSize="sm" color="gray.600">
                        <Text><strong>Total Sent:</strong> {notification.sent ?? 0}</Text>
                        <Text><strong>Read:</strong> {notification.read ?? 0}</Text>
                        <Text><strong>Unread:</strong> {notification.unread ?? 0}</Text>
                      </HStack>
                    </HStack>
                    <Text className="notification-message" color="gray.600" whiteSpace="pre-wrap" mb={2}>
                      {notification.message}
                    </Text>
                    {(notification.link || notification.drive_id || notification.event_id) && (
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                        mt={2}
                        className="notification-link-btn"
                        onClick={() => {
                          const driveOrEventId = notification.drive_id ?? notification.event_id;
                          if (driveOrEventId != null) {
                            navigate(`/placement/events/${driveOrEventId}/process`);
                            return;
                          }
                          if (notification.link?.startsWith('/')) {
                            navigate(notification.link);
                          } else if (notification.link) {
                            window.open(notification.link, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        {(notification.drive_id ?? notification.event_id) != null
                          ? 'Go to Drive'
                          : (notification.title?.startsWith('Event: ') ? `View Event: ${notification.title.slice(7)}` : 'View Link')}
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Tab 2: Recipients - Read/Unread */}
              <TabPanel px={0} pt={4}>
                {recipientsLoading ? (
                  <Flex justify="center" minH="200px" align="center">
                    <Spinner size="lg" color="#20343c" />
                  </Flex>
                ) : !recipientsData ? (
                  <Card bg="white" p={8} textAlign="center" className="notification-empty-state">
                    <Text color="gray.500">Failed to load recipients.</Text>
                  </Card>
                ) : recipientsData.recipients?.length === 0 ? (
                  <Card bg="white" p={8} textAlign="center" className="notification-empty-state">
                    <Text color="gray.500">No recipients yet. Use &quot;Send to More&quot; tab to send this notification.</Text>
                  </Card>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    <HStack justify="space-between" wrap="wrap" gap={2}>
                      <Text fontSize="sm" color="gray.600">
                        {recipientsData.readCount} read · {recipientsData.unreadCount} unread
                      </Text>
                      {selectedRecipientUsns.size > 0 && (
                        <Button
                          className="notification-resend-btn"
                          leftIcon={<RepeatIcon />}
                          colorScheme="orange"
                          size="sm"
                          onClick={handleResend}
                          isLoading={resending}
                        >
                          Resend to selected ({selectedRecipientUsns.size})
                        </Button>
                      )}
                    </HStack>

                    <Tabs variant="soft-rounded" size="sm" colorScheme="blue">
                      <TabList>
                        <Tab>All ({recipientsData.total})</Tab>
                        <Tab>Read ({recipientsData.readCount})</Tab>
                        <Tab>Unread ({recipientsData.unreadCount})</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel px={0}>
                          <TableContainer bg="white" borderRadius="lg" shadow="sm" overflowX="auto" className="notification-table-wrap">
                            <Table variant="simple" size="sm">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th w="40px"><Checkbox /></Th>
                                  <Th>Student</Th>
                                  <Th>Email</Th>
                                  <Th>School</Th>
                                  <Th>Program</Th>
                                  <Th>Status</Th>
                                  <Th>Date</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {recipientsData.recipients.map((r) => (
                                  <RecipientRow key={r.usn} r={r} onSelect={toggleRecipientSelect} isSelected={selectedRecipientUsns.has(r.usn)} />
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </TabPanel>
                        <TabPanel px={0}>
                          <TableContainer bg="white" borderRadius="lg" shadow="sm" overflowX="auto" className="notification-table-wrap">
                            <Table variant="simple" size="sm">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th w="40px">
                                    <Checkbox
                                      isChecked={recipientsData.read.length > 0 && recipientsData.read.every((r) => selectedRecipientUsns.has(r.usn))}
                                      onChange={(e) => selectAllRecipients(recipientsData.read, e.target.checked)}
                                    />
                                  </Th>
                                  <Th>Student</Th>
                                  <Th>Email</Th>
                                  <Th>School</Th>
                                  <Th>Program</Th>
                                  <Th>Status</Th>
                                  <Th>Read At</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {recipientsData.read.map((r) => (
                                  <RecipientRow key={r.usn} r={r} onSelect={toggleRecipientSelect} isSelected={selectedRecipientUsns.has(r.usn)} />
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </TabPanel>
                        <TabPanel px={0}>
                          <TableContainer bg="white" borderRadius="lg" shadow="sm" overflowX="auto" className="notification-table-wrap">
                            <Table variant="simple" size="sm">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th w="40px">
                                    <Checkbox
                                      isChecked={recipientsData.unread.length > 0 && recipientsData.unread.every((r) => selectedRecipientUsns.has(r.usn))}
                                      onChange={(e) => selectAllRecipients(recipientsData.unread, e.target.checked)}
                                    />
                                  </Th>
                                  <Th>Student</Th>
                                  <Th>Email</Th>
                                  <Th>School</Th>
                                  <Th>Program</Th>
                                  <Th>Status</Th>
                                  <Th>Delivered At</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {recipientsData.unread.map((r) => (
                                  <RecipientRow key={r.usn} r={r} onSelect={toggleRecipientSelect} isSelected={selectedRecipientUsns.has(r.usn)} />
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </VStack>
                )}
              </TabPanel>

              {/* Tab 3: Send to More */}
              <TabPanel px={0} pt={4}>
                <Box>
                  <Heading size="md" color="#20343c" mb={4}>
                    Select students to send
                  </Heading>
                  <Text color="gray.500" mb={4} fontSize="sm">
                    Use filters, then select students. Click &quot;Send to selected&quot; to deliver this notification.
                  </Text>

                  <Wrap spacing={4} align="center" mb={4} className="notification-filters-bar">
                    <WrapItem>
                      <InputGroup maxW="320px">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Search by USN or name"
                          value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                          bg="white"
                        />
                      </InputGroup>
                    </WrapItem>
                    <WrapItem>
                      <Select placeholder="All schools" value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setPage(1); }} bg="white" w={{ base: 'full', sm: '180px' }}>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name || s.abbreviation}</option>
                        ))}
                      </Select>
                    </WrapItem>
                    <WrapItem>
                      <Select placeholder="All programs" value={programId} onChange={(e) => { setProgramId(e.target.value); setPage(1); }} bg="white" w={{ base: 'full', sm: '180px' }}>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    </WrapItem>
                    <WrapItem>
                      <Input
                        placeholder="Year (e.g. 2023)"
                        value={yearOfJoining}
                        onChange={(e) => { setYearOfJoining(e.target.value); setPage(1); }}
                        bg="white"
                        w={{ base: 'full', sm: '120px' }}
                      />
                    </WrapItem>
                    <WrapItem>
                      <Select placeholder="Status" value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} bg="white" w={{ base: 'full', sm: '120px' }}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>
                    </WrapItem>
                  </Wrap>

                  <HStack mb={4} spacing={3} flexWrap="wrap" gap={2} className="notification-send-actions">
                    <Button
                      className="notification-send-btn"
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={handleSend}
                      isLoading={sending}
                      isDisabled={selectedUsns.size === 0}
                    >
                      Send to selected ({selectedUsns.size})
                    </Button>
                    <Button
                      className="notification-select-all-btn"
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={selectAllMatching}
                      isLoading={selectAllLoading}
                      isDisabled={total === 0 || studentsLoading}
                    >
                      Select all {total} students
                    </Button>
                    {selectedUsns.size > 0 && (
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUsns(new Set())}>
                        Clear selection
                      </Button>
                    )}
                  </HStack>

                  {studentsLoading ? (
                    <Flex justify="center" minH="200px" align="center">
                      <Spinner size="lg" color="#20343c" />
                    </Flex>
                  ) : isMobile ? (
                    <SimpleGrid columns={1} spacing={4}>
                      {students.length === 0 ? (
                        <Box bg="white" p={8} borderRadius="lg" shadow="sm" textAlign="center" className="notification-empty-state">
                          <Text color="gray.500">No students found.</Text>
                        </Box>
                      ) : (
                        students.map((s) => (
                          <Card
                            key={s.usn}
                            shadow="sm"
                            borderRadius="lg"
                            cursor="pointer"
                            _hover={{ shadow: 'md' }}
                            onClick={() => navigate(`/placement/students/${encodeURIComponent(s.usn)}`)}
                          >
                            <CardBody>
                              <Flex align="center" justify="space-between">
                                <HStack onClick={(e) => e.stopPropagation()}>
                                  <Checkbox isChecked={selectedUsns.has(s.usn)} onChange={() => toggleSelect(s.usn)} />
                                  <Avatar size="sm" name={s.full_name} src={s.profile_image ? getFileUrl(s.profile_image) : undefined} bg="gray.200" />
                                  <Box>
                                    <Text fontWeight="bold">{s.full_name}</Text>
                                    <Text fontSize="sm" color="gray.500">{s.usn}</Text>
                                  </Box>
                                </HStack>
                              </Flex>
                              <HStack mt={2} spacing={2} flexWrap="wrap">
                                <Badge colorScheme="teal">{schoolName(s)}</Badge>
                                <Badge colorScheme="purple">{programName(s)}</Badge>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))
                      )}
                    </SimpleGrid>
                  ) : (
                    <TableContainer bg="white" borderRadius="lg" shadow="sm" overflowX="auto" className="notification-table-wrap">
                      <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                          <Tr>
                            <Th w="50px" title="Select all on this page">
                              <Checkbox
                                isChecked={allOnPageSelected}
                                isIndeterminate={someOnPageSelected && !allOnPageSelected}
                                onChange={(e) => selectAllOnPage(e.target.checked)}
                              />
                            </Th>
                            <Th>Student</Th>
                            <Th>USN</Th>
                            <Th>Email</Th>
                            <Th>School</Th>
                            <Th>Program</Th>
                            <Th>Year</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {students.length === 0 ? (
                            <Tr>
                              <Td colSpan={8} textAlign="center" py={8} color="gray.500">
                                No students found.
                              </Td>
                            </Tr>
                          ) : (
                            students.map((s) => (
                              <Tr
                                key={s.usn}
                                _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                                cursor="pointer"
                                onClick={() => navigate(`/placement/students/${encodeURIComponent(s.usn)}`)}
                              >
                                <Td onClick={(e) => e.stopPropagation()}>
                                  <Checkbox isChecked={selectedUsns.has(s.usn)} onChange={() => toggleSelect(s.usn)} />
                                </Td>
                                <Td>
                                  <HStack spacing={2}>
                                    <Avatar size="sm" name={s.full_name} src={s.profile_image ? getFileUrl(s.profile_image) : undefined} bg="gray.200" />
                                    <Text fontWeight="medium">{s.full_name}</Text>
                                  </HStack>
                                </Td>
                                <Td>{s.usn}</Td>
                                <Td>{s.college_email}</Td>
                                <Td>{schoolName(s)}</Td>
                                <Td>{programName(s)}</Td>
                                <Td>{s.year_of_joining ?? '—'}</Td>
                                <Td>
                                  <Badge colorScheme={s.is_active !== false ? 'green' : 'red'}>
                                    {s.is_active !== false ? 'Active' : 'Inactive'}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}

                  {totalPages > 1 && (
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2} mt={4}>
                      <Text fontSize="sm" color="gray.600">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                      </Text>
                      <HStack spacing={2}>
                        <IconButton aria-label="Previous" icon={<ChevronLeftIcon />} size="sm" onClick={() => onPage(-1)} isDisabled={page <= 1} />
                        <Text fontSize="sm">Page {page} of {totalPages}</Text>
                        <IconButton aria-label="Next" icon={<ChevronRightIcon />} size="sm" onClick={() => onPage(1)} isDisabled={page >= totalPages} />
                      </HStack>
                    </Flex>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </AdminLayout>
  );
};

export default NotificationDetail;
