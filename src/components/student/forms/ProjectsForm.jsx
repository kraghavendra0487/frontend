import {
  Box,
  VStack,
  Button,
  HStack,
  Input,
  SimpleGrid,
  IconButton,
  Text,
  Textarea,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Flex,
} from "@chakra-ui/react"
import { Field } from "../../ui/field"
import { useState, useEffect, useRef } from "react"
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa"
import { useAuth } from "../../../context/AuthContext"
import { StudentProfileService } from "../../../services/studentProfile.service"
import { getFileUrl } from "../../../utils/fileUrl"

const MAX_PROJECT_IMAGES = 4

/** Priority: must be sequential (1 to total number of projects) */
function parsePriority(value) {
  if (value === undefined || value === null) return null
  const s = String(value).trim()
  if (s === "") return null
  const n = parseInt(s, 10)
  if (Number.isNaN(n) || s !== String(n) || n < 1) return undefined
  return n
}

/** Get next available priority (1, 2, 3... based on current projects) */
function getNextPriority(items) {
  return (Array.isArray(items) ? items.length : 0) + 1
}

/** Get max allowed priority (equals total number of projects) */
function getMaxPriority(items) {
  return Array.isArray(items) ? items.length : 0
}

function validateProject(item, items, editingIndex) {
  const errors = {}
  if (!String(item?.title || "").trim()) {
    errors.title = "Project title is required"
  }
  if (!String(item?.one_line_description || "").trim()) {
    errors.one_line_description = "One line description is required"
  }
  const rawPriority = item?.priority
  const parsed = parsePriority(rawPriority)
  if (rawPriority !== undefined && rawPriority !== null && String(rawPriority).trim() !== "") {
    if (parsed === undefined) {
      errors.priority = "Priority must be a positive integer."
    } else {
      const maxAllowed = getMaxPriority(items)
      if (parsed > maxAllowed || parsed < 1) {
        errors.priority = `Priority must be between 1 and ${maxAllowed}.`
      } else {
        const duplicateIndex = (Array.isArray(items) ? items : [])
          .findIndex((p, i) => i !== editingIndex && parsePriority(p?.priority) === parsed)
        if (duplicateIndex !== -1) {
          errors.priority = "Priority must be unique for your projects."
        }
      }
    }
  }
  return errors
}

/** Auto-reorder priorities when one changes. Fills gaps sequentially. */
function reorderPriorities(items, changedIndex) {
  if (!Array.isArray(items) || items.length === 0) return items
  const withPriorities = items.map((item, i) => {
    const p = parsePriority(item?.priority)
    return { ...item, priority: p, index: i }
  })
  // Get all valid priorities
  const validPriorities = withPriorities
    .filter(p => p.priority !== null && p.priority !== undefined)
    .sort((a, b) => a.priority - b.priority)
  // Reassign 1, 2, 3... to projects with priorities
  let newPriority = 1
  validPriorities.forEach(p => {
    withPriorities[p.index].priority = newPriority
    newPriority++
  })
  // Return items in original structure
  return withPriorities.map(p => {
    const { index, priority, ...rest } = p
    return { ...rest, priority: priority === null || priority === undefined ? "" : priority }
  })
}

export const ProjectsForm = ({ data = {}, onUpdate, isEditing = false, onFileSelect, apiFieldErrors = null, onPriorityValidationChange = null }) => {
  const items = Array.isArray(data) ? data : (data.projects || [])
  const toast = useToast()
  const { user } = useAuth()
  const usn = user?.usn

  const [editingIndex, setEditingIndex] = useState(null)
  const [modalErrors, setModalErrors] = useState({})
  const openedForErrorsRef = useRef(null) // track which API error set we already auto-opened for
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const errorsForEditingIndex = editingIndex != null && apiFieldErrors && apiFieldErrors[editingIndex] ? apiFieldErrors[editingIndex] : {}
  const mergedFieldErrors = { ...modalErrors, ...errorsForEditingIndex }

  const hasPriorityError = (() => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const raw = item?.priority
      if (raw === undefined || raw === null || String(raw).trim() === "") continue
      const parsed = parsePriority(raw)
      if (parsed === undefined) return true
      const duplicate = items.some((p, j) => j !== i && parsePriority(p?.priority) === parsed)
      if (duplicate) return true
    }
    return false
  })()

  useEffect(() => {
    if (typeof onPriorityValidationChange === "function") onPriorityValidationChange(hasPriorityError)
  }, [hasPriorityError, onPriorityValidationChange])

  const openEditModal = (index) => {
    setEditingIndex(index)
    setModalErrors({})
    onModalOpen()
  }

  const closeEditModal = () => {
    setEditingIndex(null)
    setModalErrors({})
    onModalClose()
  }

  useEffect(() => {
    if (!isModalOpen) setEditingIndex(null)
  }, [isModalOpen])

  // When API validation errors appear (e.g. after failed save), auto-open edit modal for the first project with errors so user sees field-level errors
  useEffect(() => {
    if (!apiFieldErrors || typeof apiFieldErrors !== "object" || !isEditing) return
    const indicesWithErrors = Object.keys(apiFieldErrors).map(Number).filter((n) => !Number.isNaN(n))
    if (indicesWithErrors.length === 0) {
      openedForErrorsRef.current = null
      return
    }
    const errorKey = indicesWithErrors.sort((a, b) => a - b).join(",")
    if (openedForErrorsRef.current === errorKey) return
    openedForErrorsRef.current = errorKey
    const firstErrorIndex = Math.min(...indicesWithErrors)
    setEditingIndex(firstErrorIndex)
    onModalOpen()
  }, [apiFieldErrors, isEditing])

  const handleChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    // If priority changed, auto-reorder to keep sequential
    if (field === "priority") {
      const reordered = reorderPriorities(newItems, index)
      onUpdate(reordered)
    } else {
      onUpdate(newItems)
    }
  }

  const handleAdd = () => {
    const newItem = {
      title: "",
      one_line_description: "",
      full_description: "",
      genre: "",
      visibility: "PRIVATE",
      self_rating: 5,
      priority: getNextPriority(items),
      hosted_link: "",
      github_repo: "",
      mentor_name: "",
      technologies: [],
      project_snaps: [],
    }
    onUpdate([...items, newItem])
    setEditingIndex(items.length)
    setModalErrors({})
    onModalOpen()
  }

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    onUpdate(newItems)
    if (editingIndex === index) closeEditModal()
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1)
  }

  const handleSaveProject = () => {
    if (editingIndex == null || editingIndex < 0 || editingIndex >= items.length) return
    const item = items[editingIndex]
    const errors = validateProject(item, items, editingIndex)
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors)
      return
    }
    setModalErrors({})
    closeEditModal()
  }

  const handleUpload = async (index, file) => {
    if (!file || !usn) return
    const currentSnaps = items[index]?.project_snaps || []
    if (currentSnaps.length >= MAX_PROJECT_IMAGES) {
      toast({
        status: "warning",
        description: `Maximum ${MAX_PROJECT_IMAGES} images per project.`,
        duration: 4000,
        isClosable: true,
      })
      return
    }
    try {
      const result = await StudentProfileService.uploadFile(usn, file, { folder: "projects" })
      const url = result?.url || result?.path
      if (url) {
        const newItems = [...items]
        const snaps = newItems[index].project_snaps || []
        newItems[index] = {
          ...newItems[index],
          project_snaps: [...snaps, url],
        }
        onUpdate(newItems)
        toast({
          status: "success",
          description: "Project image uploaded",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (e) {
      toast({
        status: "error",
        description: "File upload failed",
        duration: 4000,
        isClosable: true,
      })
    }
  }

  const currentItem = editingIndex != null && items[editingIndex] ? items[editingIndex] : null

  return (
    <Box className="projects-inventory-wrap">
      <Flex className="projects-inventory-header" justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text as="h2" className="projects-inventory-title">
          Project Inventory
        </Text>
        {isEditing && (
          <Button
            className="projects-add-new-btn"
            leftIcon={<FaPlus />}
            onClick={handleAdd}
            size="md"
          >
            Add New Project
          </Button>
        )}
      </Flex>

      <VStack spacing={3} align="stretch" mt={4}>
        {items.map((item, index) => (
          <ProjectInventoryCard
            key={index}
            index={index}
            item={item}
            isEditing={isEditing}
            onEdit={() => openEditModal(index)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={closeEditModal} size="xl" scrollBehavior="inside" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent className="projects-edit-modal" maxW="720px">
          <ModalHeader className="projects-edit-modal-header">Edit Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="projects-edit-modal-body" pb={6}>
            {currentItem && (
              <EditProjectForm
                index={editingIndex}
                item={currentItem}
                onChange={handleChange}
                onUpload={handleUpload}
                isEditing={true}
                fieldErrors={mergedFieldErrors}
              />
            )}
          </ModalBody>
          <ModalFooter className="projects-edit-modal-footer">
            <Button variant="ghost" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button
              className="projects-save-project-btn"
              onClick={handleSaveProject}
              ml={3}
            >
              Save Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

function ProjectInventoryCard({ index, item, isEditing, onEdit, onDelete }) {
  const snaps = item.project_snaps || []
  const coverImg = snaps.length > 0 ? snaps[0] : null
  const visibility = (item.visibility || "PRIVATE").toUpperCase()
  const isPublic = visibility === "PUBLIC"
  const priorityVal = item.priority
  const priorityDisplay = priorityVal !== undefined && priorityVal !== null && String(priorityVal).trim() !== ""
    ? String(priorityVal).trim()
    : "—"

  return (
    <div className="projects-inventory-card">
      <div className="projects-inventory-card-thumb">
        {coverImg ? (
          <img src={getFileUrl(coverImg)} alt="" />
        ) : (
          <div className="projects-inventory-card-thumb-placeholder" />
        )}
      </div>
      <div className="projects-inventory-card-info">
        <Text className="projects-inventory-card-title" noOfLines={1}>
          {item.title || `Project ${index + 1}`}
        </Text>
        <Text className="projects-inventory-card-category" noOfLines={1}>
          {item.genre || "—"}
        </Text>
        <span className={`projects-inventory-card-status ${isPublic ? "is-public" : ""}`}>
          {isPublic ? "PUBLIC" : "PRIVATE"}
        </span>
      </div>
      <div className="projects-inventory-card-priority">
        <Text className="projects-inventory-card-priority-label">PRIORITY</Text>
        <Text className="projects-inventory-card-priority-value">#{priorityDisplay}</Text>
      </div>
      {isEditing && (
        <HStack className="projects-inventory-card-actions" spacing={2} align="center" gap={2}>
          <IconButton
            aria-label="Edit project"
            icon={<FaEdit />}
            size="sm"
            variant="ghost"
            className="projects-inventory-card-action-edit"
            onClick={onEdit}
          />
          <IconButton
            aria-label="Delete project"
            icon={<FaTrash />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={onDelete}
          />
        </HStack>
      )}
    </div>
  )
}

function EditProjectForm({ index, item, onChange, onUpload, isEditing, fieldErrors = {} }) {
  return (
    <VStack spacing={4} align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Field label="PROJECT TITLE" required errorText={fieldErrors.title}>
          <Input
            value={item.title || ""}
            onChange={(e) => onChange(index, "title", e.target.value)}
            placeholder="e.g. Spider Web Crawler"
            className="projects-edit-input"
          />
        </Field>
        <Field label="GENRE" errorText={fieldErrors.genre}>
          <Select
            value={item.genre || ""}
            onChange={(e) => onChange(index, "genre", e.target.value)}
            placeholder="Select genre"
            className="projects-edit-select"
          >
            {item.genre && !["Web Development", "Mobile App", "ML/AI", "DevOps", "Other"].includes(item.genre) && (
              <option value={item.genre}>{item.genre}</option>
            )}
            <option value="Web Development">Web Development</option>
            <option value="Mobile App">Mobile App</option>
            <option value="ML/AI">ML/AI</option>
            <option value="DevOps">DevOps</option>
            <option value="Other">Other</option>
          </Select>
        </Field>
      </SimpleGrid>

      <Field label="ONE LINE DESCRIPTION" required errorText={fieldErrors.one_line_description}>
        <Input
          value={item.one_line_description || ""}
          onChange={(e) => onChange(index, "one_line_description", e.target.value)}
          placeholder="Brief summary of the project"
          className="projects-edit-input"
        />
      </Field>

      <Field label="FULL DESCRIPTION" errorText={fieldErrors.full_description}>
        <Textarea
          value={item.full_description || ""}
          onChange={(e) => onChange(index, "full_description", e.target.value)}
          placeholder="Detailed description..."
          rows={4}
          className="projects-edit-textarea"
        />
      </Field>

      <Field label="TECHNOLOGIES (COMMA SEPARATED)" errorText={fieldErrors.technologies}>
        <Input
          value={Array.isArray(item.technologies) ? item.technologies.join(", ") : (typeof item.technologies === "string" ? item.technologies : "")}
          onChange={(e) => onChange(index, "technologies", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          placeholder="React, Node.js, Cheerio, Redis"
          className="projects-edit-input"
        />
      </Field>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Field label="MENTOR NAME" errorText={fieldErrors.mentor_name}>
          <Input
            value={item.mentor_name || ""}
            onChange={(e) => onChange(index, "mentor_name", e.target.value)}
            placeholder="e.g. Dr. Aris Thorne"
            className="projects-edit-input"
          />
        </Field>
        <Field label="PRIORITY" errorText={fieldErrors.priority} helperText={`1-${getMaxPriority(items)} (auto-ordered)`}>
          <Input
            type="text"
            inputMode="numeric"
            value={item.priority === undefined || item.priority === null ? "" : String(item.priority)}
            onChange={(e) => {
              const v = e.target.value
              if (v === "") {
                onChange(index, "priority", "")
                return
              }
              if (/^\d+$/.test(v)) {
                const n = parseInt(v, 10)
                const maxAllowed = getMaxPriority(items)
                if (n >= 1 && n <= maxAllowed) {
                  onChange(index, "priority", n)
                }
              }
            }}
            onBlur={(e) => {
              const v = e.target.value.trim()
              if (v === "") return
              const n = parseInt(v, 10)
              if (!Number.isNaN(n)) {
                const maxAllowed = getMaxPriority(items)
                if (n >= 1 && n <= maxAllowed) {
                  onChange(index, "priority", n)
                } else if (n > maxAllowed) {
                  onChange(index, "priority", maxAllowed)
                } else if (n < 1) {
                  onChange(index, "priority", 1)
                }
              }
            }}
            placeholder={`e.g. 1 to ${getMaxPriority(items)}`}
            className="projects-edit-input"
          />
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Field label="SELF RATING (1-10)" errorText={fieldErrors.self_rating}>
          <NumberInput
            value={item.self_rating ?? ""}
            min={1}
            max={10}
            allowMouseWheel
            clampValueOnBlur={false}
            onChange={(valueString, valueNumber) => {
              // Allow empty string, otherwise use the number value
              if (valueString === "" || valueString === undefined) {
                onChange(index, "self_rating", "")
              } else {
                onChange(index, "self_rating", valueNumber)
              }
            }}
            className="projects-edit-number"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Field>
        <Field label="VISIBILITY" errorText={fieldErrors.visibility}>
          <Select
            value={item.visibility || "PRIVATE"}
            onChange={(e) => onChange(index, "visibility", e.target.value)}
            className="projects-edit-select"
          >
            <option value="PRIVATE">PRIVATE</option>
            <option value="PUBLIC">PUBLIC</option>
          </Select>
        </Field>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Field label="GITHUB REPO" errorText={fieldErrors.github_repo}>
          <Input
            value={item.github_repo || ""}
            onChange={(e) => onChange(index, "github_repo", e.target.value)}
            placeholder="https://github.com/..."
            className="projects-edit-input"
          />
        </Field>
        <Field label="HOSTED LINK" errorText={fieldErrors.hosted_link}>
          <Input
            value={item.hosted_link || ""}
            onChange={(e) => onChange(index, "hosted_link", e.target.value)}
            placeholder="https://demo.com"
            className="projects-edit-input"
          />
        </Field>
      </SimpleGrid>

      {isEditing && (
        <Box>
          <Text mb={2} fontWeight="600" fontSize="sm" color="#334155">
            Project Images (up to {MAX_PROJECT_IMAGES})
          </Text>
          <input
            type="file"
            accept="image/*"
            disabled={(item.project_snaps || []).length >= MAX_PROJECT_IMAGES}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onUpload(index, f)
              e.target.value = ""
            }}
            style={{ display: "block", marginBottom: "8px" }}
          />
          <Text fontSize="xs" color="#64748b">
            {(item.project_snaps || []).length}/{MAX_PROJECT_IMAGES} images. Upload one by one.
          </Text>
        </Box>
      )}

      {item.project_snaps && item.project_snaps.length > 0 && (
        <HStack spacing={2} overflowX="auto" py={2} flexWrap="wrap">
          {item.project_snaps.map((snap, i) => (
            <Box key={i} boxSize="80px" borderRadius="md" overflow="hidden" position="relative">
              <img
                src={getFileUrl(snap)}
                alt={`Snap ${i}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {isEditing && (
                <IconButton
                  icon={<FaTrash />}
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top={0}
                  right={0}
                  onClick={() => {
                    const newSnaps = item.project_snaps.filter((_, idx) => idx !== i)
                    onChange(index, "project_snaps", newSnaps)
                  }}
                />
              )}
            </Box>
          ))}
        </HStack>
      )}
    </VStack>
  )
}
