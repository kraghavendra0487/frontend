import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { StudentProfileService } from '../../services/studentProfile.service';

export default function ManageAcademicPage() {
  const toast = useToast();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [editingSchool, setEditingSchool] = useState(null);
  const [formName, setFormName] = useState('');
  const [formAbbreviation, setFormAbbreviation] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const cancelDeleteRef = React.useRef();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedMinorSchoolId, setSelectedMinorSchoolId] = useState('');
  const { isOpen: isProgramFormOpen, onOpen: onProgramFormOpen, onClose: onProgramFormClose } = useDisclosure();
  const { isOpen: isMinorFormOpen, onOpen: onMinorFormOpen, onClose: onMinorFormClose } = useDisclosure();
  const [editingProgram, setEditingProgram] = useState(null);
  const [formProgramName, setFormProgramName] = useState('');
  const [formProgramGraduationLevel, setFormProgramGraduationLevel] = useState('');
  const [formProgramMinDuration, setFormProgramMinDuration] = useState('');
  const [formProgramMaxDuration, setFormProgramMaxDuration] = useState('');
  const [programSaving, setProgramSaving] = useState(false);
  const [editingMinor, setEditingMinor] = useState(null);
  const [formMinorName, setFormMinorName] = useState('');
  const [minorSaving, setMinorSaving] = useState(false);
  const [selectedMajorSchoolId, setSelectedMajorSchoolId] = useState('');
  const [selectedMajorProgramId, setSelectedMajorProgramId] = useState('');
  const [selectedSpecSchoolId, setSelectedSpecSchoolId] = useState('');
  const [selectedSpecProgramId, setSelectedSpecProgramId] = useState('');
  const { isOpen: isMajorFormOpen, onOpen: onMajorFormOpen, onClose: onMajorFormClose } = useDisclosure();
  const { isOpen: isSpecFormOpen, onOpen: onSpecFormOpen, onClose: onSpecFormClose } = useDisclosure();
  const [editingMajor, setEditingMajor] = useState(null);
  const [formMajorName, setFormMajorName] = useState('');
  const [majorSaving, setMajorSaving] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [formSpecName, setFormSpecName] = useState('');
  const [specSaving, setSpecSaving] = useState(false);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const data = await StudentProfileService.getAcademyOverview();
      setSchools(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: 'Failed to load schools', description: e?.message, status: 'error' });
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    if (schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(String(schools[0].id));
    }
    if (schools.length > 0 && selectedSchoolId && !schools.some((s) => String(s.id) === selectedSchoolId)) {
      setSelectedSchoolId(String(schools[0].id));
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    if (schools.length > 0 && !selectedMinorSchoolId) {
      setSelectedMinorSchoolId(String(schools[0].id));
    }
    if (schools.length > 0 && selectedMinorSchoolId && !schools.some((s) => String(s.id) === selectedMinorSchoolId)) {
      setSelectedMinorSchoolId(String(schools[0].id));
    }
  }, [schools, selectedMinorSchoolId]);

  const majorSchool = schools.find((s) => String(s.id) === selectedMajorSchoolId);
  const programsForMajorSchool = majorSchool?.programs || [];
  useEffect(() => {
    if (schools.length > 0 && !selectedMajorSchoolId) setSelectedMajorSchoolId(String(schools[0].id));
    if (schools.length > 0 && selectedMajorSchoolId && !schools.some((s) => String(s.id) === selectedMajorSchoolId)) {
      setSelectedMajorSchoolId(String(schools[0].id));
    }
  }, [schools, selectedMajorSchoolId]);
  useEffect(() => {
    if (programsForMajorSchool.length > 0 && (!selectedMajorProgramId || !programsForMajorSchool.some((p) => String(p.id) === selectedMajorProgramId))) {
      setSelectedMajorProgramId(String(programsForMajorSchool[0].id));
    }
    if (programsForMajorSchool.length === 0) setSelectedMajorProgramId('');
  }, [selectedMajorSchoolId, programsForMajorSchool, selectedMajorProgramId]);

  const specSchool = schools.find((s) => String(s.id) === selectedSpecSchoolId);
  const programsForSpecSchool = specSchool?.programs || [];
  useEffect(() => {
    if (schools.length > 0 && !selectedSpecSchoolId) setSelectedSpecSchoolId(String(schools[0].id));
    if (schools.length > 0 && selectedSpecSchoolId && !schools.some((s) => String(s.id) === selectedSpecSchoolId)) {
      setSelectedSpecSchoolId(String(schools[0].id));
    }
  }, [schools, selectedSpecSchoolId]);
  useEffect(() => {
    if (programsForSpecSchool.length > 0 && (!selectedSpecProgramId || !programsForSpecSchool.some((p) => String(p.id) === selectedSpecProgramId))) {
      setSelectedSpecProgramId(String(programsForSpecSchool[0].id));
    }
    if (programsForSpecSchool.length === 0) setSelectedSpecProgramId('');
  }, [selectedSpecSchoolId, programsForSpecSchool, selectedSpecProgramId]);

  const openAdd = () => {
    setEditingSchool(null);
    setFormName('');
    setFormAbbreviation('');
    onFormOpen();
  };

  const openEdit = (school) => {
    setEditingSchool(school);
    setFormName(school.name || '');
    setFormAbbreviation(school.abbreviation || '');
    setSchoolToDelete(null);
    onFormOpen();
  };

  const handleFormSubmit = async () => {
    const name = (formName || '').trim();
    const abbreviation = (formAbbreviation || '').trim();
    if (!name) {
      toast({ title: 'Name is required', status: 'warning' });
      return;
    }
    if (!abbreviation) {
      toast({ title: 'Abbreviation is required', status: 'warning' });
      return;
    }
    setFormSaving(true);
    try {
      if (editingSchool) {
        await StudentProfileService.updateSchool(editingSchool.id, { name, abbreviation });
        toast({ title: 'School updated', status: 'success' });
      } else {
        await StudentProfileService.createSchool({ name, abbreviation });
        toast({ title: 'School added', status: 'success' });
      }
      onFormClose();
      fetchSchools();
    } catch (e) {
      toast({ title: editingSchool ? 'Update failed' : 'Add failed', description: e?.message, status: 'error' });
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return;
    if (schoolToDelete.totalStudents > 0) {
      toast({ title: 'Cannot delete', description: 'School has students associated.', status: 'warning' });
      onDeleteClose();
      return;
    }
    setDeleteConfirmLoading(true);
    try {
      await StudentProfileService.deleteSchool(schoolToDelete.id);
      toast({ title: 'School deleted', status: 'success' });
      onDeleteClose();
      onFormClose();
      setSchoolToDelete(null);
      setEditingSchool(null);
      fetchSchools();
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.message, status: 'error' });
    } finally {
      setDeleteConfirmLoading(false);
    }
  };

  const openDeleteFromEdit = () => {
    if (editingSchool) setSchoolToDelete(editingSchool);
    onDeleteOpen();
  };

  const canDelete = (school) => (school.totalStudents || 0) === 0;
  const deleteDisabledMessage = 'Cannot delete because students are associated with this school.';

  const selectedSchool = schools.find((s) => String(s.id) === selectedSchoolId);
  const programsForSchool = selectedSchool?.programs || [];
  const selectedMinorSchool = schools.find((s) => String(s.id) === selectedMinorSchoolId);
  const minorsForSchool = selectedMinorSchool?.minors || [];
  const selectedMajorProgram = programsForMajorSchool.find((p) => String(p.id) === selectedMajorProgramId);
  const majorsForProgram = selectedMajorProgram?.majors || [];
  const selectedSpecProgram = programsForSpecSchool.find((p) => String(p.id) === selectedSpecProgramId);
  const specializationsForProgram = selectedSpecProgram?.specializations || [];

  const openAddProgram = () => {
    setEditingProgram(null);
    setFormProgramName('');
    setFormProgramGraduationLevel('');
    setFormProgramMinDuration('');
    setFormProgramMaxDuration('');
    onProgramFormOpen();
  };

  const openEditProgram = (prog) => {
    setEditingProgram(prog);
    setFormProgramName(prog.name || '');
    setFormProgramGraduationLevel(prog.graduation_level || '');
    setFormProgramMinDuration(prog.min_duration_years != null ? String(prog.min_duration_years) : '');
    setFormProgramMaxDuration(prog.max_duration_years != null ? String(prog.max_duration_years) : '');
    onProgramFormOpen();
  };

  const handleProgramFormSubmit = async () => {
    const name = (formProgramName || '').trim();
    if (!name) {
      toast({ title: 'Program name is required', status: 'warning' });
      return;
    }
    setProgramSaving(true);
    try {
      const minDur = formProgramMinDuration.trim() ? parseInt(formProgramMinDuration, 10) : undefined;
      const maxDur = formProgramMaxDuration.trim() ? parseInt(formProgramMaxDuration, 10) : undefined;
      const payload = {
        name,
        graduation_level: (formProgramGraduationLevel || '').trim() || undefined,
        min_duration_years: minDur != null && !Number.isNaN(minDur) ? minDur : undefined,
        max_duration_years: maxDur != null && !Number.isNaN(maxDur) ? maxDur : undefined,
      };
      if (editingProgram) {
        await StudentProfileService.updateProgram(editingProgram.id, payload);
        toast({ title: 'Program updated', status: 'success' });
      } else {
        if (!selectedSchoolId) {
          toast({ title: 'Select a school first', status: 'warning' });
          setProgramSaving(false);
          return;
        }
        await StudentProfileService.createProgram({
          school_id: parseInt(selectedSchoolId, 10),
          ...payload,
        });
        toast({ title: 'Program added', status: 'success' });
      }
      onProgramFormClose();
      fetchSchools();
    } catch (e) {
      toast({ title: editingProgram ? 'Update failed' : 'Add failed', description: e?.message, status: 'error' });
    } finally {
      setProgramSaving(false);
    }
  };

  const openAddMinor = () => {
    setEditingMinor(null);
    setFormMinorName('');
    onMinorFormOpen();
  };

  const openEditMinor = (minor) => {
    setEditingMinor(minor);
    setFormMinorName(minor.name || '');
    onMinorFormOpen();
  };

  const handleMinorFormSubmit = async () => {
    const name = (formMinorName || '').trim();
    if (!name) {
      toast({ title: 'Minor name is required', status: 'warning' });
      return;
    }
    setMinorSaving(true);
    try {
      if (editingMinor) {
        await StudentProfileService.updateMinor(editingMinor.id, { name });
        toast({ title: 'Minor updated', status: 'success' });
      } else {
        if (!selectedMinorSchoolId) {
          toast({ title: 'Select a school first', status: 'warning' });
          setMinorSaving(false);
          return;
        }
        await StudentProfileService.createMinor({
          school_id: parseInt(selectedMinorSchoolId, 10),
          name,
        });
        toast({ title: 'Minor added', status: 'success' });
      }
      onMinorFormClose();
      fetchSchools();
    } catch (e) {
      toast({ title: editingMinor ? 'Update failed' : 'Add failed', description: e?.message, status: 'error' });
    } finally {
      setMinorSaving(false);
    }
  };

  const openAddMajor = () => {
    setEditingMajor(null);
    setFormMajorName('');
    onMajorFormOpen();
  };

  const openEditMajor = (major) => {
    setEditingMajor(major);
    setFormMajorName(major.name || '');
    onMajorFormOpen();
  };

  const handleMajorFormSubmit = async () => {
    const name = (formMajorName || '').trim();
    if (!name) {
      toast({ title: 'Major name is required', status: 'warning' });
      return;
    }
    setMajorSaving(true);
    try {
      if (editingMajor) {
        await StudentProfileService.updateMajor(editingMajor.id, { name });
        toast({ title: 'Major updated', status: 'success' });
      } else {
        if (!selectedMajorProgramId) {
          toast({ title: 'Select a school and program first', status: 'warning' });
          setMajorSaving(false);
          return;
        }
        await StudentProfileService.createMajor({
          program_id: parseInt(selectedMajorProgramId, 10),
          name,
        });
        toast({ title: 'Major added', status: 'success' });
      }
      onMajorFormClose();
      fetchSchools();
    } catch (e) {
      toast({ title: editingMajor ? 'Update failed' : 'Add failed', description: e?.message, status: 'error' });
    } finally {
      setMajorSaving(false);
    }
  };

  const openAddSpec = () => {
    setEditingSpec(null);
    setFormSpecName('');
    onSpecFormOpen();
  };

  const openEditSpec = (spec) => {
    setEditingSpec(spec);
    setFormSpecName(spec.name || '');
    onSpecFormOpen();
  };

  const handleSpecFormSubmit = async () => {
    const name = (formSpecName || '').trim();
    if (!name) {
      toast({ title: 'Specialization name is required', status: 'warning' });
      return;
    }
    setSpecSaving(true);
    try {
      if (editingSpec) {
        await StudentProfileService.updateSpecialization(editingSpec.id, { name });
        toast({ title: 'Specialization updated', status: 'success' });
      } else {
        if (!selectedSpecProgramId) {
          toast({ title: 'Select a school and program first', status: 'warning' });
          setSpecSaving(false);
          return;
        }
        await StudentProfileService.createSpecialization({
          program_id: parseInt(selectedSpecProgramId, 10),
          name,
        });
        toast({ title: 'Specialization added', status: 'success' });
      }
      onSpecFormClose();
      fetchSchools();
    } catch (e) {
      toast({ title: editingSpec ? 'Update failed' : 'Add failed', description: e?.message, status: 'error' });
    } finally {
      setSpecSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (editingSchool && !canDelete(editingSchool)) {
      toast({
        title: 'Cannot delete',
        description: deleteDisabledMessage,
        status: 'warning',
        isClosable: true,
      });
      return;
    }
    openDeleteFromEdit();
  };

  return (
    <Box w="full">
      <Card bg="white" borderRadius="xl" shadow="sm" border="1px" borderColor="gray.100" overflow="hidden">
        <CardBody p={6}>
          <Heading size="md" color="gray.800" mb={4}>Manage Academic</Heading>

          <Tabs variant="enclosed" colorScheme="blue" size="sm">
            <TabList borderBottomWidth="1px" borderColor="gray.200">
              <Tab fontWeight="600">Schools</Tab>
              <Tab fontWeight="600">Programs</Tab>
              <Tab fontWeight="600">Minors</Tab>
              <Tab fontWeight="600">Majors</Tab>
              <Tab fontWeight="600">Specializations</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} pt={4}>
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" color="gray.600">Add and edit schools.</Text>
                  <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={openAdd}>
                    Add School
                  </Button>
                </Flex>
                {loading ? (
                  <Flex justify="center" py={8}>
                    <Spinner size="lg" color="blue.500" />
                  </Flex>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="600" color="gray.700" textAlign="center">ID</Th>
                          <Th fontWeight="600" color="gray.700">Name</Th>
                          <Th fontWeight="600" color="gray.700">Abbreviation</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="center">Students</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {schools.length === 0 ? (
                          <Tr>
                            <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                              No schools yet. Add one to get started.
                            </Td>
                          </Tr>
                        ) : (
                          schools.map((school) => (
                            <Tr key={school.id} _hover={{ bg: 'gray.50' }}>
                              <Td textAlign="center" fontSize="sm" color="gray.600">{school.id}</Td>
                              <Td fontWeight="medium">{school.name || '—'}</Td>
                              <Td>{school.abbreviation || '—'}</Td>
                              <Td textAlign="center">{school.totalStudents ?? 0}</Td>
                              <Td textAlign="right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<EditIcon />}
                                  colorScheme="blue"
                                  onClick={() => openEdit(school)}
                                >
                                  Edit
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0} pt={4}>
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                  <FormControl maxW="320px">
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">School</FormLabel>
                    <Select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      bg="white"
                      borderColor="gray.300"
                      placeholder="Select a school"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.abbreviation || `School ${s.id}`}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={openAddProgram}
                    isDisabled={!selectedSchoolId}
                  >
                    Add Program
                  </Button>
                </Flex>
                {!selectedSchoolId ? (
                  <Text color="gray.500" py={6}>Select a school to view and manage its programs.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="600" color="gray.700" textAlign="center">ID</Th>
                          <Th fontWeight="600" color="gray.700">Program name</Th>
                          <Th fontWeight="600" color="gray.700">Graduation level</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="center">Min duration (yr)</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="center">Max duration (yr)</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="center">Students</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {programsForSchool.length === 0 ? (
                          <Tr>
                            <Td colSpan={7} textAlign="center" py={8} color="gray.500">
                              No programs for this school.
                            </Td>
                          </Tr>
                        ) : (
                          programsForSchool.map((prog) => (
                            <Tr key={prog.id} _hover={{ bg: 'gray.50' }}>
                              <Td textAlign="center" fontSize="sm" color="gray.600">{prog.id}</Td>
                              <Td fontWeight="medium">{prog.name || '—'}</Td>
                              <Td>{prog.graduation_level ?? '—'}</Td>
                              <Td textAlign="center">{prog.min_duration_years ?? '—'}</Td>
                              <Td textAlign="center">{prog.max_duration_years ?? '—'}</Td>
                              <Td textAlign="center">{prog.totalStudents ?? 0}</Td>
                              <Td textAlign="right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<EditIcon />}
                                  colorScheme="blue"
                                  onClick={() => openEditProgram(prog)}
                                >
                                  Edit
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0} pt={4}>
                <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
                  <FormControl maxW="320px">
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">School</FormLabel>
                    <Select
                      value={selectedMinorSchoolId}
                      onChange={(e) => setSelectedMinorSchoolId(e.target.value)}
                      bg="white"
                      borderColor="gray.300"
                      placeholder="Select a school"
                    >
                      {schools.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name || s.abbreviation || `School ${s.id}`}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={openAddMinor}
                    isDisabled={!selectedMinorSchoolId}
                  >
                    Add Minor
                  </Button>
                </Flex>
                {!selectedMinorSchoolId ? (
                  <Text color="gray.500" py={6}>Select a school to view and manage its minors.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="600" color="gray.700" textAlign="center">ID</Th>
                          <Th fontWeight="600" color="gray.700">Minor name</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {minorsForSchool.length === 0 ? (
                          <Tr>
                            <Td colSpan={3} textAlign="center" py={8} color="gray.500">
                              No minors for this school.
                            </Td>
                          </Tr>
                        ) : (
                          minorsForSchool.map((minor) => (
                            <Tr key={minor.id} _hover={{ bg: 'gray.50' }}>
                              <Td textAlign="center" fontSize="sm" color="gray.600">{minor.id}</Td>
                              <Td fontWeight="medium">{minor.name || '—'}</Td>
                              <Td textAlign="right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<EditIcon />}
                                  colorScheme="blue"
                                  onClick={() => openEditMinor(minor)}
                                >
                                  Edit
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0} pt={4}>
                <Flex align="center" mb={4} flexWrap="nowrap" justify="space-between" gap={4} w="full">
                  <HStack gap={4} flexWrap="nowrap" align="flex-end" flex="1" minW={0}>
                    <FormControl maxW="200px" minW="140px">
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">School</FormLabel>
                      <Select
                        value={selectedMajorSchoolId}
                        onChange={(e) => setSelectedMajorSchoolId(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        placeholder="Select school"
                      >
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name || s.abbreviation || `School ${s.id}`}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl maxW="240px" minW="160px">
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Program</FormLabel>
                      <Select
                        value={selectedMajorProgramId}
                        onChange={(e) => setSelectedMajorProgramId(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        placeholder="Select program"
                      >
                        {programsForMajorSchool.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={openAddMajor}
                    isDisabled={!selectedMajorProgramId}
                    flexShrink={0}
                  >
                    Add Major
                  </Button>
                </Flex>
                {!selectedMajorProgramId ? (
                  <Text color="gray.500" py={6}>Select a school and program to view and manage majors.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="600" color="gray.700" textAlign="center">ID</Th>
                          <Th fontWeight="600" color="gray.700">Major name</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {majorsForProgram.length === 0 ? (
                          <Tr>
                            <Td colSpan={3} textAlign="center" py={8} color="gray.500">No majors for this program.</Td>
                          </Tr>
                        ) : (
                          majorsForProgram.map((m) => (
                            <Tr key={m.id} _hover={{ bg: 'gray.50' }}>
                              <Td textAlign="center" fontSize="sm" color="gray.600">{m.id}</Td>
                              <Td fontWeight="medium">{m.name || '—'}</Td>
                              <Td textAlign="right">
                                <Button size="sm" variant="outline" leftIcon={<EditIcon />} colorScheme="blue" onClick={() => openEditMajor(m)}>Edit</Button>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel px={0} pt={4}>
                <Flex align="center" mb={4} flexWrap="nowrap" justify="space-between" gap={4} w="full">
                  <HStack gap={4} flexWrap="nowrap" align="flex-end" flex="1" minW={0}>
                    <FormControl maxW="200px" minW="140px">
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">School</FormLabel>
                      <Select
                        value={selectedSpecSchoolId}
                        onChange={(e) => setSelectedSpecSchoolId(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        placeholder="Select school"
                      >
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name || s.abbreviation || `School ${s.id}`}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl maxW="240px" minW="160px">
                      <FormLabel fontSize="sm" fontWeight="600" color="gray.700">Program</FormLabel>
                      <Select
                        value={selectedSpecProgramId}
                        onChange={(e) => setSelectedSpecProgramId(e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        placeholder="Select program"
                      >
                        {programsForSpecSchool.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={openAddSpec}
                    isDisabled={!selectedSpecProgramId}
                    flexShrink={0}
                  >
                    Add Specialization
                  </Button>
                </Flex>
                {!selectedSpecProgramId ? (
                  <Text color="gray.500" py={6}>Select a school and program to view and manage specializations.</Text>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontWeight="600" color="gray.700" textAlign="center">ID</Th>
                          <Th fontWeight="600" color="gray.700">Specialization name</Th>
                          <Th fontWeight="600" color="gray.700" textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {specializationsForProgram.length === 0 ? (
                          <Tr>
                            <Td colSpan={3} textAlign="center" py={8} color="gray.500">No specializations for this program.</Td>
                          </Tr>
                        ) : (
                          specializationsForProgram.map((s) => (
                            <Tr key={s.id} _hover={{ bg: 'gray.50' }}>
                              <Td textAlign="center" fontSize="sm" color="gray.600">{s.id}</Td>
                              <Td fontWeight="medium">{s.name || '—'}</Td>
                              <Td textAlign="right">
                                <Button size="sm" variant="outline" leftIcon={<EditIcon />} colorScheme="blue" onClick={() => openEditSpec(s)}>Edit</Button>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      <Modal isOpen={isFormOpen} onClose={onFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingSchool ? 'Edit School' : 'Add School'}</ModalHeader>
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                bg="white"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Abbreviation</FormLabel>
              <Input
                value={formAbbreviation}
                onChange={(e) => setFormAbbreviation(e.target.value)}
                bg="white"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <Box>
              {editingSchool && (
                <Tooltip
                  label={canDelete(editingSchool) ? 'Delete this school' : deleteDisabledMessage}
                  hasArrow
                  placement="top"
                >
                  <Box as="span" display="inline-block">
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      mr={2}
                      isDisabled={!canDelete(editingSchool)}
                      onClick={handleDeleteClick}
                    >
                      Delete
                    </Button>
                  </Box>
                </Tooltip>
              )}
            </Box>
            <HStack>
              <Button variant="ghost" onClick={onFormClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleFormSubmit} isLoading={formSaving}>
                {editingSchool ? 'Save' : 'Add'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete School</AlertDialogHeader>
            <AlertDialogBody>
              {schoolToDelete && (
                <>
                  Are you sure you want to delete <strong>{schoolToDelete.name}</strong>?
                  {schoolToDelete.totalStudents > 0 && (
                    <Text mt={2} color="red.600">
                      This school has {schoolToDelete.totalStudents} student(s) associated. Cannot delete because students are connected to this school.
                    </Text>
                  )}
                </>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>Cancel</Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                isLoading={deleteConfirmLoading}
                isDisabled={schoolToDelete && schoolToDelete.totalStudents > 0}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isProgramFormOpen} onClose={onProgramFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingProgram ? 'Edit Program' : 'Add Program'}</ModalHeader>
          <ModalBody>
            {!editingProgram && selectedSchoolId && (
              <FormControl mb={4}>
                <FormLabel fontSize="sm" color="gray.600">School</FormLabel>
                <Text fontWeight="medium">{selectedSchool?.name || selectedSchool?.abbreviation || '—'}</Text>
              </FormControl>
            )}
            <FormControl isRequired mb={4}>
              <FormLabel>Name</FormLabel>
              <Input
                value={formProgramName}
                onChange={(e) => setFormProgramName(e.target.value)}
                bg="white"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Graduation level (optional)</FormLabel>
              <Input
                value={formProgramGraduationLevel}
                onChange={(e) => setFormProgramGraduationLevel(e.target.value)}
                bg="white"
              />
            </FormControl>
            <FormControl mb={2}>
              <FormLabel>Min duration (years, optional)</FormLabel>
              <Input
                type="number"
                min={1}
                max={10}
                value={formProgramMinDuration}
                onChange={(e) => setFormProgramMinDuration(e.target.value)}
                bg="white"
                placeholder="e.g. 4"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Max duration (years, optional)</FormLabel>
              <Input
                type="number"
                min={1}
                max={10}
                value={formProgramMaxDuration}
                onChange={(e) => setFormProgramMaxDuration(e.target.value)}
                bg="white"
                placeholder="e.g. 4"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onProgramFormClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleProgramFormSubmit} isLoading={programSaving}>
              {editingProgram ? 'Save' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isMinorFormOpen} onClose={onMinorFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingMinor ? 'Edit Minor' : 'Add Minor'}</ModalHeader>
          <ModalBody>
            {!editingMinor && selectedMinorSchoolId && (
              <FormControl mb={4}>
                <FormLabel fontSize="sm" color="gray.600">School</FormLabel>
                <Text fontWeight="medium">{selectedMinorSchool?.name || selectedMinorSchool?.abbreviation || '—'}</Text>
              </FormControl>
            )}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={formMinorName}
                onChange={(e) => setFormMinorName(e.target.value)}
                bg="white"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMinorFormClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleMinorFormSubmit} isLoading={minorSaving}>
              {editingMinor ? 'Save' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isMajorFormOpen} onClose={onMajorFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingMajor ? 'Edit Major' : 'Add Major'}</ModalHeader>
          <ModalBody>
            {!editingMajor && selectedMajorSchoolId && selectedMajorProgramId && (
              <>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm" color="gray.600">School</FormLabel>
                  <Text fontWeight="medium">{majorSchool?.name || majorSchool?.abbreviation || '—'}</Text>
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel fontSize="sm" color="gray.600">Program</FormLabel>
                  <Text fontWeight="medium">{selectedMajorProgram?.name || '—'}</Text>
                </FormControl>
              </>
            )}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={formMajorName} onChange={(e) => setFormMajorName(e.target.value)} bg="white" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMajorFormClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleMajorFormSubmit} isLoading={majorSaving}>
              {editingMajor ? 'Save' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSpecFormOpen} onClose={onSpecFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingSpec ? 'Edit Specialization' : 'Add Specialization'}</ModalHeader>
          <ModalBody>
            {!editingSpec && selectedSpecSchoolId && selectedSpecProgramId && (
              <>
                <FormControl mb={2}>
                  <FormLabel fontSize="sm" color="gray.600">School</FormLabel>
                  <Text fontWeight="medium">{specSchool?.name || specSchool?.abbreviation || '—'}</Text>
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel fontSize="sm" color="gray.600">Program</FormLabel>
                  <Text fontWeight="medium">{selectedSpecProgram?.name || '—'}</Text>
                </FormControl>
              </>
            )}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={formSpecName} onChange={(e) => setFormSpecName(e.target.value)} bg="white" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSpecFormClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSpecFormSubmit} isLoading={specSaving}>
              {editingSpec ? 'Save' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
