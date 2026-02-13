/**
 * Component: EducationForm
 * 
 * Fields (Repeatable):
 * - educationLevel (Select: 10th, 12th, Undergraduate, Postgraduate)
 * - instituteName (Text)
 * - board (Text)
 * - city (Text)
 * - yearOfPassing (Number)
 * - resultType (Select: Percentage, CGPA)
 * - result (Text/Number)
 * - subjects (Text)
 * - gapDetails (Optional)
 * 
 * Validation: All fields optional. Save enabled when there are any changes.
 * 
 * API Contracts:
 * - GET /api/student/profile/education
 * - POST /api/student/profile/education (Add Item)
 * - PUT /api/student/profile/education/:id (Update Item)
 * - DELETE /api/student/profile/education/:id (Delete Item)
 */

import { useState } from "react"
import { Box, SimpleGrid, Input, Select, VStack, Heading, Flex, Button, Text, IconButton, Collapse, useToast, Image, Link, FormControl, Divider } from "@chakra-ui/react"
import { getFileUrl } from "../../../utils/fileUrl"
import { Field } from "../../ui/field"
import { StyledFileInput } from "../../ui/StyledFileInput"
import { FaGraduationCap, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from "react-icons/fa"
import { useAuth } from "../../../context/AuthContext"
import { StudentProfileService } from "../../../services/studentProfile.service"

const EducationItem = ({ item, onChange, onDelete, index, isOpen, onToggle, isEditing, onFileSelect, isPG, fieldErrors = {} }) => {
  const [yearError, setYearError] = useState(null)

  const handleChange = (field, value) => {
    onChange({ ...item, [field]: value }, index)
  }
  
  const getError = (field) => fieldErrors[field] || null

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} bg="white">
      <Flex justify="space-between" align="center" mb={isOpen ? 4 : 0} cursor="pointer" onClick={onToggle}>
        <VStack align="start" gap={0}>
            <Heading size="sm" color="#20343c">{item.educationLevel || "New Education Entry"}</Heading>
            <Text fontSize="xs" color="gray.500">{item.instituteName}</Text>
        </VStack>
        <Flex gap={2}>
            <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(index); }} aria-label="Delete" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
            <IconButton icon={isOpen ? <FaChevronUp /> : <FaChevronDown />} size="sm" variant="ghost" aria-label="Toggle" onClick={(e) => { e.stopPropagation(); onToggle(); }} />
        </Flex>
      </Flex>
      
      <Collapse in={isOpen}>
        <VStack spacing={6} align="stretch" mt={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Field label="Education Level *">
                <Select variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} value={item.educationLevel ?? item.education_level ?? ""} onChange={(e) => handleChange("educationLevel", e.target.value)} placeholder="Select Level">
                    <option value="10TH">10th</option>
                    <option value="12TH">12th</option>
                    <option value="DIPLOMA">Diploma</option>
                    {isPG && (
                        <>
                            <option value="GRADUATION">Undergraduate</option>
                            <option value="POST_GRADUATION">Postgraduate</option>
                            <option value="OTHER">Other</option>
                        </>
                    )}
                </Select>
            </Field>
            <Field label="Institute Name *">
                <Input value={item.instituteName ?? item.institute_name ?? ""} onChange={(e) => handleChange("instituteName", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} placeholder="Enter institute name" _placeholder={{ opacity: 0.7, color: "inherit" }} />
            </Field>
            <Field label="Board *">
                <Input value={item.board ?? ""} onChange={(e) => handleChange("board", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} placeholder="Enter board" _placeholder={{ opacity: 0.7, color: "inherit" }} />
            </Field>
            <Field label="City *">
                <Input value={item.city ?? ""} onChange={(e) => handleChange("city", e.target.value)} variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} placeholder="Enter city" _placeholder={{ opacity: 0.7, color: "inherit" }} />
            </Field>
            <FormControl isInvalid={!!getError('year_of_passing')}>
              <Field label="Year of Passing *">
                <Input 
                  type="text" 
                  inputMode="numeric"
                  value={item.yearOfPassing ?? item.end_year ?? item.year_of_passing ?? ""} 
                  onChange={(e) => {
                    let val = e.target.value;
                    // allow only digits, max 4
                    val = val.replace(/[^0-9]/g, '').slice(0, 4);
                    const currentYear = new Date().getFullYear();
                    // set the field value
                    handleChange("yearOfPassing", val);
                    // validate range when length is 4 or when cleared
                    if (val === "") {
                      setYearError(null)
                    } else if (val.length === 4) {
                      const n = parseInt(val, 10)
                      if (Number.isNaN(n) || n < 1900 || n > currentYear) {
                        setYearError(`Enter a valid year between 1900 and ${currentYear}`)
                      } else {
                        setYearError(null)
                      }
                    } else {
                      setYearError(null)
                    }
                  }}
                  onBlur={() => {
                    const v = String(item.yearOfPassing ?? item.end_year ?? item.year_of_passing ?? "").trim();
                    const currentYear = new Date().getFullYear();
                    if (v !== "") {
                      const n = parseInt(v, 10);
                      if (Number.isNaN(n) || n < 1900 || n > currentYear) {
                        setYearError(`Enter a valid year between 1900 and ${currentYear}`)
                      } else {
                        setYearError(null)
                      }
                    } else {
                      setYearError(null)
                    }
                  }}
                  variant="flushed" 
                  isDisabled={!isEditing} 
                  _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                  placeholder={`e.g. ${new Date().getFullYear()}`}
                  _placeholder={{ opacity: 0.7, color: "inherit" }}
                />
              </Field>
              {(getError('year_of_passing') || yearError) && (
                <Text fontSize="sm" color="red.500" mt={1}>{getError('year_of_passing') || yearError}</Text>
              )}
            </FormControl>
            <Field label="Result Type *">
                <Select variant="flushed" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} value={item.resultType ?? item.result_type ?? "PERCENTAGE"} onChange={(e) => handleChange("resultType", e.target.value)}>
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="CGPA">CGPA</option>
                </Select>
            </Field>
            <FormControl isInvalid={!!getError('result')}>
              <Field label="Result Value *">
                <Input 
                  type="number"
                  value={item.result ?? item.result_value ?? ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const resultType = item.resultType ?? item.result_type ?? "PERCENTAGE";
                    
                    if (val === '') {
                      handleChange("result", val);
                      return;
                    }
                    
                    const numVal = parseFloat(val);
                    
                    // Validate based on result type
                    if (resultType === "PERCENTAGE") {
                      // Percentage: 0-100
                      if (numVal >= 0 && numVal <= 100) {
                        handleChange("result", val);
                      }
                    } else {
                      // CGPA: 0-10
                      if (numVal >= 0 && numVal <= 10) {
                        handleChange("result", val);
                      }
                    }
                  }}
                  variant="flushed" 
                  isDisabled={!isEditing} 
                  _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                  placeholder={item.resultType === "CGPA" ? "e.g. 8.5 (0-10)" : "e.g. 85 (0-100)"}
                  step="0.01"
                  min={0}
                  max={item.resultType === "CGPA" ? 10 : 100}
                  _placeholder={{ opacity: 0.7, color: "inherit" }}
                />
              </Field>
              {getError('result') && (
                <Text fontSize="sm" color="red.500" mt={1}>{getError('result')}</Text>
              )}
            </FormControl>
            <FormControl isInvalid={!!getError('subjects')}>
              <Field label="Subjects *">
                <Input 
                  value={item.subjects ?? ""} 
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only allow letters, spaces, commas, and common punctuation
                    if (val === '' || /^[a-zA-Z\s,.\-&()]+$/.test(val)) {
                      handleChange("subjects", val);
                    }
                  }}
                  variant="flushed" 
                  isDisabled={!isEditing} 
                  _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} 
                  placeholder="e.g. Physics, Chemistry, Mathematics"
                  _placeholder={{ opacity: 0.7, color: "inherit" }}
                />
              </Field>
              {getError('subjects') && (
                <Text fontSize="sm" color="red.500" mt={1}>{getError('subjects')}</Text>
              )}
            </FormControl>
          <Field label="Upload Marksheet/Certificate *">
            <EducationFileInput
                isEditing={isEditing}
                value={item.marksheet_file}
                onChange={(url) => handleChange("marksheet_file", url)}
                onFileSelect={onFileSelect ? (file) => onFileSelect(index, file) : undefined}
            />
          </Field>
          </SimpleGrid>
          
          </VStack>
      </Collapse>
    </Box>
  )
}

export const EducationForm = ({ data = {}, onUpdate, isEditing = false, onFileSelect, fieldErrors = {} }) => {
  const historyRaw = Array.isArray(data?.education_history) ? data.education_history : (Array.isArray(data) ? data : [])
  const gapsRaw = Array.isArray(data?.education_gaps) ? data.education_gaps : []

  // Normalize keys from DB (snake_case) to camelCase; use "" for null/undefined
  const historyItems = historyRaw.map(item => ({
      ...item,
      educationLevel: item.educationLevel ?? item.education_level ?? "",
      instituteName: item.instituteName ?? item.institute_name ?? "",
      board: item.board ?? "",
      city: item.city ?? "",
      yearOfPassing: item.yearOfPassing ?? item.end_year ?? item.year_of_passing ?? "",
      resultType: item.resultType ?? item.result_type ?? "PERCENTAGE",
      result: item.result ?? item.result_value ?? "",
      subjects: item.subjects ?? "",
      marksheet_file: item.marksheet_file ?? item.proofFile ?? ""
  }))

  const gapItems = gapsRaw.map(item => ({
    ...item,
    gapStartDate: item.gapStartDate ?? item.gap_start_date ?? "",
    gapEndDate: item.gapEndDate ?? item.gap_end_date ?? "",
    gapReason: item.gapReason ?? item.gap_reason ?? "",
    remarks: item.remarks ?? ""
  }))
  const [openIndex, setOpenIndex] = useState(-1)
  const toast = useToast()
  const { user } = useAuth()
  const usn = user?.usn
  const isPG = true

  const updateAll = (nextHistory, nextGaps) => {
    onUpdate({ education_history: nextHistory, education_gaps: nextGaps })
  }

  const handleHistoryChange = (updatedItem, index) => {
      const newItems = [...historyItems]
      newItems[index] = updatedItem
      updateAll(newItems, gapItems)
  }

  const handleAdd = () => {
      updateAll([
        ...historyItems,
        {
          educationLevel: "",
          instituteName: "",
          board: "",
          city: "",
          yearOfPassing: "",
          resultType: "PERCENTAGE",
          result: "",
          subjects: "",
          marksheet_file: ""
        }
      ], gapItems)
  }

  const handleDelete = (index) => {
      const newItems = historyItems.filter((_, i) => i !== index)
      updateAll(newItems, gapItems)
  }

  const handleUpload = async (index, file) => {
    if (!file || !usn) return
    try {
      const result = await StudentProfileService.uploadFile(usn, file, { folder: "education" })
      const url = result?.url || result?.path
      if (url) {
        const newItems = [...historyItems]
        newItems[index] = { 
            ...newItems[index], 
            marksheet_file: url
        }
        updateAll(newItems, gapItems)
        toast({
          status: "success",
          description: "Marksheet uploaded successfully",
          duration: 3000,
          isClosable: true
        })
      }
    } catch (e) {
      toast({
        status: "error",
        description: "File upload failed",
        duration: 4000,
        isClosable: true
      })
    }
  }

  const handleFileSelectWrapper = async (index, file) => {
    if (onFileSelect) {
      onFileSelect(index, file)
    } else {
      await handleUpload(index, file)
    }
  }

  return (
    <Box bg="white" p={8} borderRadius="xl" shadow="sm">
      <Heading size="lg" mb={6} color="#20343c">Education History</Heading>
      
      <VStack spacing={6} align="stretch">
        {historyItems.map((item, index) => (
          <EducationItem 
            key={index} 
            index={index} 
            item={item} 
            onChange={handleHistoryChange} 
            onDelete={handleDelete}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            isEditing={isEditing}
            onFileSelect={handleFileSelectWrapper}
            isPG={isPG}
            fieldErrors={fieldErrors?.[index] || {}}
          />
        ))}

        <Button 
          leftIcon={<FaPlus />} 
          onClick={handleAdd} 
          variant="outline" 
          colorScheme="orange" 
          borderColor="#d4a960" 
          color="#d4a960"
          _hover={{ bg: "#fff5e6" }}
          isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}
        >
          Add Education
        </Button>

        <Divider my={6} />

        <EducationGapsSection
          gaps={gapItems}
          onChange={(next) => updateAll(historyItems, next)}
          isEditing={isEditing}
          fieldErrors={fieldErrors?.education_gaps || {}}
        />
      </VStack>
    </Box>
  )
}

const GapItem = ({ item, index, onChange, onDelete, isEditing, fieldErrors = {} }) => {
  const set = (field, value) => onChange({ ...item, [field]: value }, index)
  const err = (field) => fieldErrors[field] || null
  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="xl" p={4} bg="gray.50">
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="sm" color="#20343c">Gap {index + 1}</Heading>
        <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(index)} aria-label="Delete gap" isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }} />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <FormControl isInvalid={!!err('gap_start_date')}>
          <Field label="Start Date *">
            <Input type="date" value={item.gapStartDate ?? ""} onChange={(e) => set("gapStartDate", e.target.value)} isDisabled={!isEditing} />
          </Field>
          {err('gap_start_date') && <Text fontSize="sm" color="red.500" mt={1}>{err('gap_start_date')}</Text>}
        </FormControl>
        <FormControl isInvalid={!!err('gap_end_date')}>
          <Field label="End Date *">
            <Input type="date" value={item.gapEndDate ?? ""} onChange={(e) => set("gapEndDate", e.target.value)} isDisabled={!isEditing} />
          </Field>
          {err('gap_end_date') && <Text fontSize="sm" color="red.500" mt={1}>{err('gap_end_date')}</Text>}
        </FormControl>
        <FormControl isInvalid={!!err('gap_reason')}>
          <Field label="Reason *">
            <Input value={item.gapReason ?? ""} onChange={(e) => set("gapReason", e.target.value)} isDisabled={!isEditing} placeholder="Reason for the gap" />
          </Field>
          {err('gap_reason') && <Text fontSize="sm" color="red.500" mt={1}>{err('gap_reason')}</Text>}
        </FormControl>
        <Field label="Remarks (Optional)">
          <Input value={item.remarks ?? ""} onChange={(e) => set("remarks", e.target.value)} isDisabled={!isEditing} placeholder="Any remarks" />
        </Field>
      </SimpleGrid>
    </Box>
  )
}

const EducationGapsSection = ({ gaps = [], onChange, isEditing, fieldErrors = {} }) => {
  const items = Array.isArray(gaps) ? gaps : []
  const handleItemChange = (updatedItem, index) => {
    const next = [...items]
    next[index] = updatedItem
    onChange(next)
  }
  const handleAdd = () => {
    onChange([
      ...items,
      { gapStartDate: "", gapEndDate: "", gapReason: "", remarks: "" }
    ])
  }
  const handleDelete = (index) => onChange(items.filter((_, i) => i !== index))
  return (
    <Box>
      <Heading size="md" mb={4} color="#20343c">Education Gaps</Heading>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Add any gaps in education (if applicable). These are saved separately from your education history.
      </Text>
      <VStack spacing={4} align="stretch">
        {items.map((item, i) => (
          <GapItem
            key={i}
            item={item}
            index={i}
            onChange={handleItemChange}
            onDelete={handleDelete}
            isEditing={isEditing}
            fieldErrors={fieldErrors?.[i] || {}}
          />
        ))}
        <Button leftIcon={<FaPlus />} onClick={handleAdd} variant="outline" colorScheme="orange" borderColor="#d4a960" color="#d4a960" _hover={{ bg: "#fff5e6" }} isDisabled={!isEditing} _disabled={{ opacity: 1, cursor: "default", bg: "gray.100", px: 2, py: 1, borderRadius: "md", color: "gray.800" }}>
          Add Gap
        </Button>
      </VStack>
    </Box>
  )
}

const EducationFileInput = ({ isEditing, value, onChange, onFileSelect }) => {
  const toast = useToast()
  const { user } = useAuth()
  const usn = user?.usn
  const [pendingFile, setPendingFile] = useState(null)
  const [pendingPreview, setPendingPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file)
      setPendingPreview(previewUrl)
    }
    setPendingFile(file)
    
    if (onFileSelect) {
      onFileSelect(file)
      toast({
        status: "info",
        description: "File selected. It will be uploaded when you save changes.",
        duration: 3000,
        isClosable: true
      })
    }
    e.target.value = ""
  }

  return (
    <Box>
      {isEditing && (
        <VStack align="stretch" spacing={2}>
          <StyledFileInput
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            onChange={handleFileChange}
            acceptLabel="PDF, JPG, PNG"
          />
          {pendingPreview && (
            <Box 
              border="2px dashed" 
              borderColor="orange.300" 
              borderRadius="md" 
              p={2}
              bg="orange.50"
            >
              <Image 
                src={pendingPreview} 
                alt="Preview" 
                maxH="200px" 
                objectFit="contain"
                mx="auto"
              />
              <Text fontSize="xs" color="orange.600" mt={2} textAlign="center" fontWeight="bold">
                Pending Upload
              </Text>
            </Box>
          )}
          {pendingFile && !pendingPreview && (
            <Box 
              border="2px dashed" 
              borderColor="orange.300" 
              borderRadius="md" 
              p={2}
              bg="orange.50"
            >
              <Text fontSize="sm" color="orange.600" textAlign="center">
                📄 {pendingFile.name} (Pending Upload)
              </Text>
            </Box>
          )}
        </VStack>
      )}
      {value && (
        <Box mt={2}>
          {value.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <Box 
              border="1px solid" 
              borderColor="gray.200" 
              borderRadius="md" 
              p={2}
              bg="gray.50"
            >
              <Image 
                src={getFileUrl(value)} 
                alt="Marksheet" 
                maxH="200px" 
                objectFit="contain"
                mx="auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Link 
                href={getFileUrl(value)} 
                isExternal 
                fontSize="sm" 
                color="blue.500"
                display="block"
                textAlign="center"
                mt={2}
              >
                View Full Size
              </Link>
            </Box>
          ) : (
            <Link 
              href={getFileUrl(value)} 
              isExternal 
              fontSize="sm" 
              color="blue.500"
            >
              📄 View Marksheet
            </Link>
          )}
        </Box>
      )}
    </Box>
  )
}
