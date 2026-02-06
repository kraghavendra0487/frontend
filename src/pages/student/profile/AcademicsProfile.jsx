import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  useToast,
  FormControl,
  FormLabel,
  IconButton,
  Collapse,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react"
import { useAuth } from "../../../context/AuthContext"
import { useProfileView } from "../../../context/ProfileViewContext"
import { useStudentDataCache } from "../../../context/StudentDataCacheContext"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { FaTrash, FaChevronDown, FaPlus, FaGraduationCap, FaFolderOpen, FaLock, FaUnlock } from "react-icons/fa"
import { PlacementService } from "../../../services/placement.service"

const CURRENT_YEAR = new Date().getFullYear()

const GRADE_OPTIONS = ["O", "A+", "A", "B", "C", "P", "F"]

const gradePointsMap = {
  O: 10,
  "A+": 9,
  A: 8,
  B: 7,
  C: 6,
  P: 5,
  F: 0,
}

const gradeFromPointsMap = Object.entries(gradePointsMap).reduce(
  (acc, [grade, points]) => {
    acc[points] = grade
    return acc
  },
  {},
)

const computeSgpa = (courses) => {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { sgpa: null, totalCredits: 0, earnedCredits: 0, activeBacklogs: 0 }
  }
  let totalCredits = 0
  let weighted = 0
  let earnedCredits = 0
  let activeBacklogs = 0

  courses.forEach((c) => {
    const credits = Number(c.credits) || 0
    const gp = Number(
      c.grade_points != null && c.grade_points !== ""
        ? c.grade_points
        : gradePointsMap[(c.grade || "").toString().trim().toUpperCase()],
    )
    const grade =
      c.grade && c.grade !== ""
        ? c.grade.toString().trim().toUpperCase()
        : gradeFromPointsMap[gp]
    if (!credits || Number.isNaN(gp)) return
    totalCredits += credits
    weighted += credits * gp
    if (grade !== "F") earnedCredits += credits
    if (grade === "F") activeBacklogs += 1
  })

  if (!totalCredits) {
    return { sgpa: null, totalCredits: 0, earnedCredits: 0, activeBacklogs: 0 }
  }

  const sgpa = parseFloat((weighted / totalCredits).toFixed(2))
  return { sgpa, totalCredits, earnedCredits, activeBacklogs }
}

const computeCgpaFromAllSemesters = (semesters) => {
  if (!Array.isArray(semesters) || semesters.length === 0) return null
  let allCourses = []
  semesters.forEach((s) => {
    if (Array.isArray(s.courses)) {
      allCourses = allCourses.concat(s.courses)
    }
  })
  const { sgpa } = computeSgpa(allCourses)
  return sgpa
}

const computeAcademicYear = (yearOfJoining, semester) => {
  if (!yearOfJoining || !semester) return CURRENT_YEAR
  const yoj = Number(yearOfJoining)
  const sem = Number(semester)
  if (Number.isNaN(yoj) || Number.isNaN(sem) || sem < 1) return CURRENT_YEAR
  return yoj + Math.floor((sem - 1) / 2)
}

export const AcademicsProfile = () => {
  const { user } = useAuth()
  const profileView = useProfileView()
  const viewUsn = (profileView?.viewUsn || user?.usn || "").toString().trim().toUpperCase()
  const isReadOnly = profileView?.isReadOnly === true
  const isLocked = profileView?.isSectionLocked?.("academics") === true
  const canEdit = profileView?.isAdminView === true || (!isReadOnly && !isLocked)
  const usn = viewUsn || user?.usn
  const { invalidateProfile, clearCache } = useStudentDataCache()
  const toast = useToast()

  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [personalMeta, setPersonalMeta] = useState(null)
  const [selectedSemesterId, setSelectedSemesterId] = useState(null)
  const [formAcademicYear, setFormAcademicYear] = useState("")
  const [formSemester, setFormSemester] = useState("")
  const [formCourses, setFormCourses] = useState([])
  const [hasActiveForm, setHasActiveForm] = useState(false)
  const [marksheetFile, setMarksheetFile] = useState(null)
  const [expandedSemesterId, setExpandedSemesterId] = useState(null)
  const [updatingLockSemester, setUpdatingLockSemester] = useState(null)

  const yearOptions = useMemo(() => {
    const years = []
    for (let y = CURRENT_YEAR; y >= CURRENT_YEAR - 6; y -= 1) {
      years.push(y)
    }
    return years
  }, [])

  useEffect(() => {
    if (!usn) return
    ;(async () => {
      try {
        const data = await StudentProfileService.getSection(usn, "personal")
        setPersonalMeta(data || {})
      } catch {
        setPersonalMeta(null)
      }
    })()
  }, [usn])

  const loadSemesters = async () => {
    if (!usn) return
    setLoading(true)
    try {
      const data = await StudentProfileService.getAcademicSemesters(usn)
      const list = Array.isArray(data?.semesters) ? data.semesters : (Array.isArray(data) ? data : [])
      setSemesters(list)
      // Do not auto-create or auto-select a semester form;
      // if there was an active selection, keep it in sync, otherwise show only the list.
      if (selectedSemesterId != null && list.length > 0) {
        const match = list.find((s) => s.id === selectedSemesterId)
        if (match) {
          setFormAcademicYear(String(match.academic_year ?? ""))
          setFormSemester(String(match.semester ?? ""))
          setFormCourses(
            Array.isArray(match.courses) && match.courses.length > 0
              ? match.courses.map((c) => ({
                  course_code: c.course_code || "",
                  course_title: c.course_title || "",
                  credits: c.credits ?? "",
                  grade: c.grade || "",
                  grade_points: c.grade_points ?? "",
                }))
              : [
                  {
                    course_code: "",
                    course_title: "",
                    credits: "",
                    grade: "",
                    grade_points: "",
                  },
                ],
          )
          setHasActiveForm(true)
        } else {
          setHasActiveForm(false)
          setSelectedSemesterId(null)
        }
      }
    } catch (error) {
      toast({
        title: "Failed to load academics",
        description: error?.message || "Could not load academic performance.",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSemesters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn])

  const handleSelectSemesterRow = (semesterRow) => {
    if (!semesterRow) return
    setSelectedSemesterId(semesterRow.id)
    setHasActiveForm(true)
    setExpandedSemesterId(semesterRow.id)
    setFormAcademicYear(String(semesterRow.academic_year ?? ""))
    setFormSemester(String(semesterRow.semester ?? ""))
    setFormCourses(
      Array.isArray(semesterRow.courses) && semesterRow.courses.length > 0
        ? semesterRow.courses.map((c) => ({
            course_code: c.course_code || "",
            course_title: c.course_title || "",
            credits: c.credits ?? "",
            grade: c.grade || "",
            grade_points: c.grade_points ?? "",
          }))
        : [
            {
              course_code: "",
              course_title: "",
              credits: "",
              grade: "",
              grade_points: "",
            },
          ],
    )
    setMarksheetFile(null)
  }

  const handleAddSemester = () => {
    const nextSemesterNumber =
      semesters.length === 0
        ? 1
        : Math.max(...semesters.map((s) => Number(s.semester) || 0), 0) + 1

    const currentSemMeta =
      personalMeta?.current_semester ?? personalMeta?.currentSemester
    if (currentSemMeta && nextSemesterNumber > Number(currentSemMeta)) {
      toast({
        title: "Cannot add future semester",
        description: `You can add up to your current semester (${currentSemMeta}) only.`,
        status: "warning",
        duration: 3500,
        isClosable: true,
      })
      return
    }

    const yearOfJoining =
      personalMeta?.year_of_joining ?? personalMeta?.yearOfJoining

    let defaultYear
    if (yearOfJoining) {
      defaultYear = computeAcademicYear(yearOfJoining, nextSemesterNumber)
    } else if (semesters.length > 0) {
      defaultYear = semesters[semesters.length - 1].academic_year || CURRENT_YEAR
    } else {
      defaultYear = CURRENT_YEAR
    }

    setSelectedSemesterId(null)
    setHasActiveForm(true)
    setFormAcademicYear(String(defaultYear))
    setFormSemester(String(nextSemesterNumber))
    setFormCourses([
      {
        course_code: "",
        course_title: "",
        credits: "",
        grade: "",
        grade_points: "",
      },
    ])
    setMarksheetFile(null)
    setExpandedSemesterId("draft")

    toast({
      title: "New semester ready",
      description: `Preset to Year ${defaultYear}, Semester ${nextSemesterNumber}.`,
      status: "info",
      duration: 2500,
      isClosable: true,
    })
  }

  const handleCourseChange = (index, field, value) => {
    setFormCourses((prev) => {
      const copy = [...prev]
      const current = copy[index] || {
        course_code: "",
        course_title: "",
        credits: "",
        grade: "",
        grade_points: "",
      }

      const updated = { ...current, [field]: value }

      // Auto-derive grade from grade_points when grade_points changes
      if (field === "grade_points") {
        const num = Number(value)
        if (!Number.isNaN(num) && gradeFromPointsMap[num]) {
          updated.grade = gradeFromPointsMap[num]
        }
      }

      copy[index] = updated
      return copy
    })
  }

  const handleAddCourseRow = () => {
    setFormCourses((prev) => [
      ...prev,
      {
        course_code: "",
        course_title: "",
        credits: "",
        grade: "",
        grade_points: "",
      },
    ])
  }

  const handleRemoveCourseRow = (index) => {
    setFormCourses((prev) => prev.filter((_, i) => i !== index))
  }

  const { sgpa: previewSgpa, totalCredits: previewTotalCredits, earnedCredits: previewEarnedCredits, activeBacklogs: previewActiveBacklogs } =
    useMemo(() => (hasActiveForm ? computeSgpa(formCourses) : {
      sgpa: null,
      totalCredits: 0,
      earnedCredits: 0,
      activeBacklogs: 0,
    }), [formCourses, hasActiveForm])

  const savedCgpa = useMemo(
    () => computeCgpaFromAllSemesters(semesters),
    [semesters],
  )

  const overallCgpa = useMemo(() => {
    if (!hasActiveForm) return savedCgpa
    return computeCgpaFromAllSemesters([
      ...semesters,
      {
        id: selectedSemesterId || "current",
        courses: formCourses,
      },
    ])
  }, [semesters, formCourses, selectedSemesterId, hasActiveForm, savedCgpa])

  const totalCreditsDisplay = useMemo(() => {
    let t = semesters.reduce((acc, s) => acc + (Number(s.total_credits) || 0), 0)
    if (hasActiveForm && !selectedSemesterId) t += previewTotalCredits
    return t
  }, [semesters, hasActiveForm, selectedSemesterId, previewTotalCredits])

  const earnedCreditsDisplay = useMemo(() => {
    let t = semesters.reduce((acc, s) => acc + (Number(s.earned_credits) || 0), 0)
    if (hasActiveForm && !selectedSemesterId) t += previewEarnedCredits
    return t
  }, [semesters, hasActiveForm, selectedSemesterId, previewEarnedCredits])

  const activeBacklogsDisplay = useMemo(() => {
    let t = semesters.reduce((acc, s) => acc + (Number(s.active_backlogs) || 0), 0)
    if (hasActiveForm && !selectedSemesterId) t += previewActiveBacklogs
    return t
  }, [semesters, hasActiveForm, selectedSemesterId, previewActiveBacklogs])

  const clearedBacklogsDisplay = useMemo(() => {
    return semesters.reduce((acc, s) => acc + (Number(s.cleared_backlogs) || 0), 0)
  }, [semesters])

  const displayList = useMemo(() => {
    const list = [...semesters]
    // Only show draft card when adding a new semester, not when viewing/expanding an existing one
    if (hasActiveForm && selectedSemesterId == null) {
      list.push({
        id: "draft",
        semester: formSemester,
        academic_year: formAcademicYear,
        sgpa: previewSgpa,
        total_credits: previewTotalCredits,
        earned_credits: previewEarnedCredits,
        active_backlogs: previewActiveBacklogs,
        courses: formCourses,
      })
    }
    return list
  }, [semesters, hasActiveForm, selectedSemesterId, formSemester, formAcademicYear, previewSgpa, previewTotalCredits, previewEarnedCredits, previewActiveBacklogs, formCourses])

  const handleToggleCard = (item) => {
    if (item.id === "draft") {
      if (expandedSemesterId === "draft") {
        setExpandedSemesterId(null)
        setHasActiveForm(false)
      } else {
        setExpandedSemesterId("draft")
      }
    } else {
      if (expandedSemesterId === item.id) {
        setExpandedSemesterId(null)
      } else {
        handleSelectSemesterRow(item)
      }
    }
  }

  const handleToggleSemesterLock = async (e, semNum) => {
    e.stopPropagation()
    if (!profileView?.isAdminView || !viewUsn || semNum == null || semNum < 1 || semNum > 8) return
    const field = `is_sem${Number(semNum)}_locked`
    const isLocked = profileView.editControl?.[field] === true
    setUpdatingLockSemester(semNum)
    try {
      await PlacementService.updateStudentProfileLocks(viewUsn, { [field]: !isLocked })
      await profileView.refetchEditControl?.()
      toast({
        title: isLocked ? "Semester unlocked" : "Semester locked",
        description: `Semester ${semNum} is now ${isLocked ? "editable" : "locked"} for the student.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: "Failed to update lock",
        description: err?.message || "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setUpdatingLockSemester(null)
    }
  }

  const handleSaveSemester = async () => {
    if (!canEdit || !usn) {
      if (!usn) {
        toast({
          title: "Not logged in",
          description: "USN is required.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
      return
    }

    const yearNum = Number(formAcademicYear)
    const semNum = Number(formSemester)

    if (!yearNum || Number.isNaN(yearNum)) {
      toast({
        title: "Academic year required",
        description: "Please enter a valid academic year.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    if (!semNum || Number.isNaN(semNum) || semNum < 1 || semNum > 8) {
      toast({
        title: "Semester required",
        description: "Semester must be between 1 and 8.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const cleanedCourses = formCourses
      .map((c) => ({
        course_code: (c.course_code || "").trim(),
        course_title: (c.course_title || "").trim(),
        credits:
          c.credits === "" || c.credits == null
            ? ""
            : Number(c.credits),
        grade: (c.grade || "").trim().toUpperCase(),
        grade_points:
          c.grade_points === "" || c.grade_points == null
            ? undefined
            : Number(c.grade_points),
      }))
      .filter(
        (c) =>
          c.course_code !== "" ||
          c.course_title !== "" ||
          (c.credits && !Number.isNaN(c.credits)),
      )

    if (cleanedCourses.length === 0) {
      toast({
        title: "Add at least one course",
        description: "Please add at least one course to save the semester.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const alreadyExists = semesters.some(
      (s) =>
        Number(s.academic_year) === yearNum &&
        Number(s.semester) === semNum,
    )
    if (!alreadyExists && !marksheetFile) {
      toast({
        title: "Marksheet required",
        description: "Please upload the semester result / marksheet image for new semesters.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      })
      return
    }

    // Frontend duplicate course check within the same semester
    const seenCodes = new Set()
    for (const c of cleanedCourses) {
      const code = c.course_code.toUpperCase()
      if (seenCodes.has(code)) {
        toast({
          title: "Duplicate course",
          description: `Course code ${code} is repeated in this semester. Please keep each course unique.`,
          status: "warning",
          duration: 4000,
          isClosable: true,
        })
        return
      }
      seenCodes.add(code)
    }

    setSaving(true)
    try {
      let resultFileUrl = null
      if (marksheetFile) {
        const uploadResult = await StudentProfileService.uploadFile(usn, marksheetFile, {
          folder: "academics",
        })
        resultFileUrl = uploadResult?.url || uploadResult?.path
        if (!resultFileUrl) {
          toast({
            title: "Upload failed",
            description: "Marksheet image could not be uploaded. Please try again.",
            status: "error",
            duration: 4000,
            isClosable: true,
          })
          setSaving(false)
          return
        }
      }
      const payload = {
        academic_year: yearNum,
        semester: semNum,
        courses: cleanedCourses,
      }
      if (resultFileUrl) payload.result_file = resultFileUrl
      await StudentProfileService.saveAcademicSemester(usn, payload)
      await loadSemesters()
      setMarksheetFile(null)
      setExpandedSemesterId(null)
      setHasActiveForm(false)
      setSelectedSemesterId(null)
      invalidateProfile("academics")
      clearCache("dashboard")
      toast({
        title: "Semester saved",
        description: "Academic performance updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Failed to save semester",
        description:
          error?.message || "Server error while saving academic details.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const isFormExpanded = (item) =>
    item.id === "draft" ? expandedSemesterId === "draft" : expandedSemesterId == item.id

  const isSavedSemester = (item) => item != null && item.id !== "draft"

  const renderViewContent = (item) => {
    const courses = Array.isArray(item?.courses) ? item.courses : []
    return (
      <>
        <Box h="1px" bg="gray.100" mb={6} />
        <VStack align="stretch" spacing={4} px={8} pb={8} pt={2}>
          {item?.result_file && (
            <FormControl>
              <FormLabel fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Result / Marksheet
              </FormLabel>
              <Text as="a" href={item.result_file} target="_blank" rel="noopener noreferrer" fontSize="sm" color="indigo.600" textDecoration="underline">
                View marksheet
              </Text>
            </FormControl>
          )}
          <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" overflow="hidden" bg="white" boxShadow="sm">
            <Table size="sm">
              <Thead bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
                <Tr>
                  <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">Course Code</Th>
                  <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">Course Title</Th>
                  <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" isNumeric>Credits</Th>
                  <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" isNumeric>Grade Points</Th>
                  <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">Grade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.length === 0 ? (
                  <Tr><Td colSpan={5} color="gray.500" py={4}>No courses</Td></Tr>
                ) : (
                  courses.map((c, idx) => (
                    <Tr key={idx}>
                      <Td>{c.course_code ?? "—"}</Td>
                      <Td>{c.course_title ?? "—"}</Td>
                      <Td isNumeric>{c.credits ?? "—"}</Td>
                      <Td isNumeric>{c.grade_points ?? "—"}</Td>
                      <Td fontWeight="bold" color="indigo.600">{c.grade ?? "—"}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
          <Flex gap={4} pt={2}>
            <Box bg="gray.100" px={4} py={2} borderRadius="xl">
              <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>Semester Credits</Text>
              <Text fontWeight="bold" color="gray.700">{item?.total_credits ?? 0}</Text>
            </Box>
            <Box bg="gray.100" px={4} py={2} borderRadius="xl">
              <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>SGPA</Text>
              <Text fontWeight="bold" color="gray.700">{item?.sgpa != null ? Number(item.sgpa).toFixed(2) : "—"}</Text>
            </Box>
            <Text fontSize="xs" color="gray.500" alignSelf="center">Saved record — view only</Text>
          </Flex>
        </VStack>
      </>
    )
  }

  const renderFormContent = () => (
    <>
      <Box h="1px" bg="gray.100" mb={6} />
      <VStack align="stretch" spacing={4} px={8} pb={8} pt={2}>
        <FormControl>
          <FormLabel fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            Result / Marksheet (image)
            {!selectedSemesterId && " (required for new semester)"}
          </FormLabel>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setMarksheetFile(e.target.files?.[0] || null)}
            style={{ fontSize: "14px", marginTop: "4px" }}
          />
          {marksheetFile && (
            <Text fontSize="xs" color="gray.600" mt={1}>
              Selected: {marksheetFile.name}
            </Text>
          )}
        </FormControl>

        <Box borderWidth="1px" borderColor="gray.100" borderRadius="2xl" overflow="hidden" bg="white" boxShadow="sm">
          <Table size="sm">
            <Thead bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
              <Tr>
                <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">Course Code</Th>
                <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">Course Title</Th>
                <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" isNumeric w="80px">Credits</Th>
                <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" isNumeric w="100px">Grade Points</Th>
                <Th fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" w="60px">Grade</Th>
                <Th w="40px" />
              </Tr>
            </Thead>
            <Tbody>
              {formCourses.map((c, index) => (
                <Tr key={index} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Input
                      size="sm"
                      variant="unstyled"
                      value={c.course_code}
                      onChange={(e) =>
                        handleCourseChange(index, "course_code", e.target.value.toUpperCase())
                      }
                      placeholder="CS101"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      variant="unstyled"
                      value={c.course_title}
                      onChange={(e) =>
                        handleCourseChange(index, "course_title", e.target.value)
                      }
                      placeholder="Course Name"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      variant="unstyled"
                      type="number"
                      min={0}
                      value={c.credits}
                      onChange={(e) =>
                        handleCourseChange(index, "credits", e.target.value)
                      }
                      placeholder="4"
                      w="16"
                    />
                  </Td>
                  <Td>
                    <Input
                      size="sm"
                      variant="unstyled"
                      type="number"
                      min={0}
                      max={10}
                      value={c.grade_points}
                      onChange={(e) =>
                        handleCourseChange(index, "grade_points", e.target.value)
                      }
                      placeholder="10"
                      w="14"
                    />
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="bold" color="indigo.600">
                      {(c.grade || "")
                        .toString()
                        .trim()
                        .toUpperCase() || (gradeFromPointsMap[Number(c.grade_points)] || "-")}
                    </Text>
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="Remove course"
                      icon={<FaTrash />}
                      size="xs"
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: "red.500" }}
                      onClick={() => handleRemoveCourseRow(index)}
                      isDisabled={formCourses.length <= 1}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button
            size="sm"
            variant="ghost"
            w="full"
            py={3}
            bg="gray.50"
            _hover={{ bg: "gray.100" }}
            color="indigo.600"
            fontWeight="bold"
            fontSize="xs"
            leftIcon={<FaPlus />}
            onClick={handleAddCourseRow}
            sx={{ "&": { backgroundColor: "#f7fafc !important", color: "#4f46e5 !important", minHeight: "48px" } }}
          >
            Add Course
          </Button>
        </Box>

        <Flex justify="space-between" align="center" pt={4} flexWrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Box bg="gray.100" px={4} py={2} borderRadius="xl">
              <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                Semester Credits
              </Text>
              <Text fontWeight="bold" color="gray.700">
                {previewTotalCredits}
              </Text>
            </Box>
            <Box bg="gray.100" px={4} py={2} borderRadius="xl">
              <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={1}>
                SGPA
              </Text>
              <Text fontWeight="bold" color="gray.700">
                {previewSgpa != null ? previewSgpa.toFixed(2) : "-"}
              </Text>
            </Box>
          </HStack>
          {canEdit && (
          <Button
            onClick={handleSaveSemester}
            isLoading={saving}
            loadingText="Saving..."
            leftIcon={<FaGraduationCap />}
            size="md"
            fontWeight="bold"
            borderRadius="xl"
            shadow="lg"
            sx={{ "&": { backgroundColor: "#4f46e5 !important", color: "#ffffff !important", minHeight: "44px" }, "&:hover:not(:disabled)": { backgroundColor: "#4338ca !important" } }}
          >
            Save Semester
          </Button>
          )}
        </Flex>
      </VStack>
    </>
  )

  return (
    <Box maxW="5xl" mx="auto" pt={4} pb={20} bg="gray.50" minH="100vh">
      {isLocked && (
        <Alert status="info" mb={4} mx={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>View only</AlertTitle>
            <AlertDescription>This section is locked by the administrator. You cannot edit it.</AlertDescription>
          </Box>
        </Alert>
      )}
      {/* Sticky glass-style header — top offset so it sits below main navbar (72px) */}
      <Box
        position="sticky"
        top={{ base: "60px", md: "72px" }}
        zIndex={40}
        bg="white"
        bgGradient="linear(to-b, whiteAlpha.900, whiteAlpha.800)"
        backdropFilter="blur(12px)"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <Box maxW="5xl" mx="auto" px={6} py={4}>
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            gap={4}
          >
            <Box>
              <Heading size="md" fontWeight="extrabold" letterSpacing="tight" color="indigo.700">
                Academic Performance
              </Heading>
            </Box>

            <HStack spacing={4} flexWrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
              <Box textAlign="right">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Cumulative CGPA
                </Text>
                <Heading size="lg" color="indigo.600" fontWeight="black" lineHeight="none">
                  {overallCgpa != null ? overallCgpa.toFixed(2) : "0.00"}
                </Heading>
              </Box>
              <Box h={8} w="1px" bg="gray.200" flexShrink={0} />
              <Box textAlign="right">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Total Credits
                </Text>
                <Heading size="lg" color="teal.700" fontWeight="black" lineHeight="none">
                  {totalCreditsDisplay}
                </Heading>
              </Box>
              <Box h={8} w="1px" bg="gray.200" flexShrink={0} />
              <Box textAlign="right">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Earned Credits
                </Text>
                <Heading size="lg" color="teal.700" fontWeight="black" lineHeight="none">
                  {earnedCreditsDisplay}
                </Heading>
              </Box>
              <Box h={8} w="1px" bg="gray.200" flexShrink={0} />
              <Box textAlign="right">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Active Backlogs
                </Text>
                <Heading size="lg" color={activeBacklogsDisplay > 0 ? "red.600" : "green.600"} fontWeight="black" lineHeight="none">
                  {activeBacklogsDisplay}
                </Heading>
              </Box>
              <Box h={8} w="1px" bg="gray.200" flexShrink={0} />
              <Box textAlign="right">
                <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Cleared Backlogs
                </Text>
                <Heading size="lg" color="green.700" fontWeight="black" lineHeight="none">
                  {clearedBacklogsDisplay}
                </Heading>
              </Box>
            </HStack>
          </Flex>
        </Box>
      </Box>

      {canEdit && (
      <Flex maxW="5xl" mx="auto" px={6} justify="flex-end" py={4} mb={2}>
        <Button
          px={5}
          py={2.5}
          borderRadius="xl"
          size="sm"
          fontWeight="bold"
          leftIcon={<FaPlus />}
          onClick={handleAddSemester}
          isDisabled={loading}
          shadow="lg"
          sx={{ "&": { backgroundColor: "#1f2937 !important", color: "#ffffff !important", minHeight: "42px" }, "&:hover:not(:disabled)": { backgroundColor: "#374151 !important" } }}
        >
          Add Semester
        </Button>
      </Flex>
      )}

      <Box as="main" maxW="5xl" mx="auto" px={6}>
        {loading ? (
          <Center py={20}>
            <Spinner size="lg" color="indigo.500" />
          </Center>
        ) : displayList.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            bg="white"
            borderRadius="3xl"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="gray.200"
            textAlign="center"
          >
            <Flex
              w={16}
              h={16}
              borderRadius="full"
              bg="gray.50"
              align="center"
              justify="center"
              color="gray.400"
              mb={4}
            >
              <FaFolderOpen fontSize="2rem" />
            </Flex>
            <Heading size="md" fontWeight="bold" color="gray.800" mb={2}>
              No records found
            </Heading>
            <Text color="gray.500" fontSize="sm" mb={6}>
              Start by adding your first semester results.
            </Text>
            <Button
              size="md"
              fontWeight="bold"
              borderRadius="xl"
              onClick={handleAddSemester}
              sx={{ "&": { backgroundColor: "#4f46e5 !important", color: "#ffffff !important", minHeight: "44px" }, "&:hover": { backgroundColor: "#4338ca !important" } }}
            >
              Initialize Sem 1
            </Button>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {displayList.map((item) => {
              const expanded = isFormExpanded(item)
              const isDraft = item.id === "draft"
              const semNum = item.semester ?? "-"
              const year = item.academic_year ?? "-"
              const sgpaVal =
                item.sgpa != null ? Number(item.sgpa).toFixed(2) : "-"
              const totalCred = Number(item.total_credits) || 0
              const earnedCred = Number(item.earned_credits) ?? totalCred
              const activeBlg = Number(item.active_backlogs) || 0
              const clearedBlg = Number(item.cleared_backlogs) || 0
              const totalBlg = activeBlg + clearedBlg
              const earnedText = totalCred > 0 ? `Earned ${earnedCred}/${totalCred}` : "Earned —"
              const backlogText = totalBlg > 0 ? `Cleared ${clearedBlg}/${totalBlg}` : "Cleared 0/0"

              return (
                <Box
                  key={isDraft ? "draft" : String(item.id)}
                  bg="white"
                  borderRadius="2xl"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={expanded ? "indigo.500" : "gray.200"}
                  boxShadow={expanded ? "lg" : "sm"}
                  transition="all 0.2s"
                >
                  <Flex
                    px={6}
                    py={5}
                    align="center"
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => handleToggleCard(item)}
                    _hover={{ bg: "gray.50" }}
                    transition="colors"
                  >
                    <HStack spacing={4}>
                      <Flex
                        w={10}
                        h={10}
                        borderRadius="full"
                        bg="gray.100"
                        align="center"
                        justify="center"
                        fontWeight="black"
                        color="indigo.600"
                      >
                        {semNum}
                      </Flex>
                      <Box>
                        <HStack spacing={2}>
                          <Heading size="sm" fontWeight="bold" color="indigo.800">
                            Semester {semNum}
                            {isDraft && " (New)"}
                          </Heading>
                        </HStack>
                        <Text fontSize="xs" fontWeight="medium" color="gray.600">
                          {year}
                        </Text>
                        <HStack spacing={3} mt={1} fontSize="xs" fontWeight="600">
                          <Text color="teal.600">{earnedText}</Text>
                          <Text color="gray.400">·</Text>
                          <Text color={activeBlg > 0 ? "orange.600" : "green.600"}>{backlogText}</Text>
                        </HStack>
                      </Box>
                    </HStack>
                    <HStack spacing={6}>
                      <Box textAlign="right">
                        <Text fontSize="10px" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                          SGPA
                        </Text>
                        <Text fontSize="xl" fontWeight="black" color="indigo.600">
                          {sgpaVal}
                        </Text>
                      </Box>
                      {profileView?.isAdminView && !isDraft && semNum >= 1 && semNum <= 8 && (
                        <IconButton
                          aria-label={profileView.editControl?.[`is_sem${semNum}_locked`] ? "Locked — click to unlock" : "Unlocked — click to lock"}
                          icon={profileView.editControl?.[`is_sem${semNum}_locked`] ? <FaLock /> : <FaUnlock />}
                          size="sm"
                          colorScheme={profileView.editControl?.[`is_sem${semNum}_locked`] ? "red" : "green"}
                          variant="ghost"
                          isLoading={updatingLockSemester === semNum}
                          onClick={(e) => handleToggleSemesterLock(e, semNum)}
                          title={profileView.editControl?.[`is_sem${semNum}_locked`] ? "Locked — click to unlock" : "Unlocked — click to lock"}
                        />
                      )}
                      <Flex
                        w={8}
                        h={8}
                        borderRadius="full"
                        align="center"
                        justify="center"
                        color={expanded ? "indigo.600" : "gray.400"}
                        bg={expanded ? "indigo.50" : "transparent"}
                        transform={expanded ? "rotate(180deg)" : "rotate(0)"}
                        transition="all 0.2s"
                      >
                        <FaChevronDown />
                      </Flex>
                    </HStack>
                  </Flex>

                  <Collapse in={expanded} animateOpacity>
                    {expanded && (isDraft || canEdit ? renderFormContent() : renderViewContent(item))}
                  </Collapse>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </Box>
  )
}
