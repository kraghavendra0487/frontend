import { Box, Text, Heading, VStack, HStack, Icon, Button, Image, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Tag, Link, SimpleGrid, Divider } from "@chakra-ui/react";
import { FaExternalLinkAlt, FaGithub, FaStar, FaEye, FaHeart, FaUser } from "react-icons/fa";
import { useState, useContext } from "react";
import { getFileUrl } from "../../../utils/fileUrl";
import { StudentProfileContentRefContext } from "../StudentProfileLayout";

/* Color palette: Bright Green #03C03C, Lime Green #A2D43D, White #F2F3F4, Dark Gray #4A4952, Black #1F1E26 */

const COLORS = {
  brightGreen: "#03C03C",
  limeGreen: "#A2D43D",
  white: "#F2F3F4",
  darkGray: "#4A4952",
  black: "#1F1E26",
};

const getTechnologies = (project) => {
  let skills = [];
  if (typeof project.skills === "string") skills = project.skills.split(",").map(s => s.trim()).filter(Boolean);
  else if (Array.isArray(project.skills)) skills = project.skills;
  else if (Array.isArray(project.technologies)) skills = project.technologies;
  return skills;
};

const StarRating = ({ rating }) => {
  // rating is 1-10; display as 5 stars (rating/2)
  const value = (rating ?? 5) / 2;
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push("full");
    else if (i === fullStars && hasHalf) stars.push("half");
    else stars.push("empty");
  }
  return (
    <span className="showcase-stars">
      {stars.map((type, i) => (
        <span key={i} className={`star star-${type}`}>
          ★
        </span>
      ))}
      <span className="showcase-star-score">{Math.round(rating ?? 5)}/10</span>
    </span>
  );
};

// Compute average rating for a project. Prefer backend-provided `average_rating`, otherwise
// average available role ratings (self + admin). Default to 5 when no ratings exist.
const computeAverage = (p) => {
  if (!p) return 5;
  if (p.average_rating != null) return Number(p.average_rating);
  const self = p.self_rating != null ? Number(p.self_rating) : null;
  const admin = p.admin_rating != null ? Number(p.admin_rating) : null;
  if (self != null && admin != null) return (self + admin) / 2;
  if (self != null) return self;
  if (admin != null) return admin;
  return 5;
}

export const ProjectShowcase = ({ projects = [], contentAreaRef, studentName }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const layoutContentRef = useContext(StudentProfileContentRefContext);
  const portalContainerRef = contentAreaRef || layoutContentRef;

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    onOpen();
  };

  if (projects.length === 0) {
    return (
      <div className="projects-empty-state projects-empty-state--palette">
        <Icon as={FaStar} className="empty-icon" boxSize={12} display="block" />
        <Text as="p" className="empty-title">No projects to showcase yet.</Text>
        <Text as="p" className="empty-subtitle">Go to &quot;Manage Projects&quot; to add your first project!</Text>
      </div>
    );
  }

  return (
    <Box className="projects-showcase-wrap">
      <div className="projects-showcase-grid projects-showcase-grid--palette">
        {projects.map((project, index) => (
          <ShowcaseCard
            key={project.id ?? index}
            project={project}
            studentName={studentName}
            onView={() => handleViewDetails(project)}
          />
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        scrollBehavior="inside"
        isCentered
        {...(portalContainerRef ? { portalProps: { containerRef: portalContainerRef } } : {})}
      >
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.700" />
        <ModalContent
          borderRadius="xl"
          maxW="720px"
          maxH="90vh"
          display="flex"
          flexDirection="column"
          shadow="xl"
          bg="white"
          border="1px solid"
          borderColor="#e2e8f0"
        >
          <ModalHeader pt={6} pb={4} borderBottom="1px solid" borderColor="#e2e8f0">
            <HStack align="flex-start" spacing={4}>
              {(() => {
                const snaps = selectedProject?.project_snaps || selectedProject?.snaps || [];
                const firstSnap = snaps.length > 0 ? snaps[0] : null;
                return firstSnap ? (
                  <Image
                    src={getFileUrl(firstSnap)}
                    boxSize="56px"
                    minW="56px"
                    borderRadius="lg"
                    objectFit="cover"
                    bg="#f1f5f9"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <Box boxSize="56px" minW="56px" bg="#f1f5f9" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FaStar} color={COLORS.brightGreen} boxSize={8} />
                  </Box>
                );
              })()}
              <Box flex="1">
                <Heading size="lg" fontWeight="bold" color="#0f172a">{selectedProject?.title}</Heading>
                <Text color={COLORS.brightGreen} fontWeight="500" fontSize="sm" mt={1}>{studentName || "Student"}</Text>
                <Text color="#64748b" fontSize="xs" mt={0.5}>{selectedProject?.genre || "—"} • {selectedProject?.mentor_name ? `mentor: ${selectedProject.mentor_name}` : "—"}</Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} color="#64748b" />
          <ModalBody pb={6} overflowY="auto" flex="1" pt={0} bg="white">
            {selectedProject && (
              <VStack align="stretch" spacing={5}>
                <HStack spacing={0} py={4} align="flex-start" divider={<Divider orientation="vertical" h="36px" borderColor="#e2e8f0" />}>
                  <Box px={4} py={2}>
                    <HStack spacing={1}>
                          <Text fontWeight="bold" fontSize="lg" color="#0f172a">{(selectedProject ? (selectedProject.average_rating != null ? Number(selectedProject.average_rating) : computeAverage(selectedProject)) : 0).toFixed(1)}</Text>
                          <Icon as={FaStar} color={COLORS.limeGreen} boxSize={4} />
                        </HStack>
                        <Text fontSize="xs" color="#64748b" fontWeight="bold">RATING</Text>
                  </Box>
                  <Box px={4} py={2}>
                    <HStack spacing={2}>
                      <Icon as={FaEye} color="#0f172a" boxSize={4} />
                      <Text fontWeight="bold" fontSize="lg" color="#0f172a">{selectedProject.views_count ?? selectedProject.view_count ?? 0}</Text>
                    </HStack>
                    <Text fontSize="xs" color="#64748b" fontWeight="bold">VIEWS</Text>
                  </Box>
                  <Box px={4} py={2}>
                    <HStack spacing={2}>
                      <Icon as={FaHeart} color={COLORS.brightGreen} boxSize={4} />
                      <Text fontWeight="bold" fontSize="lg" color="#0f172a">{selectedProject.likes_count ?? selectedProject.likes ?? 0}</Text>
                    </HStack>
                    <Text fontSize="xs" color="#64748b" fontWeight="bold">LIKES</Text>
                  </Box>
                  <Box px={4} py={2}>
                    <Box px={3} py={1} borderRadius="md" border="1px solid" borderColor="#e2e8f0" bg="#f1f5f9" display="inline-block">
                      <Text fontWeight="bold" fontSize="sm" color="#334155">{selectedProject.genre || "—"}</Text>
                    </Box>
                    <Text fontSize="xs" color="#64748b" fontWeight="bold" mt={1}>GENRE</Text>
                  </Box>
                </HStack>

                <Box>
                  <Text color="#475569" fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">
                    {selectedProject.full_description || selectedProject.one_line_description || selectedProject.description || "No description."}
                  </Text>
                </Box>

                {(() => {
                  const snaps = selectedProject.project_snaps || selectedProject.snaps || [];
                  return snaps.length > 0 && (
                    <Box>
                      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                        {snaps.slice(0, 4).map((snap, i) => (
                          <Image
                            key={i}
                            src={getFileUrl(snap)}
                            h="160px"
                            w="100%"
                            borderRadius="lg"
                            objectFit="cover"
                            shadow="sm"
                            border="1px solid"
                            borderColor="#e2e8f0"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })()}

                {(() => {
                  const skills = getTechnologies(selectedProject);
                  return skills.length > 0 && (
                    <Box>
                      <Heading size="sm" mb={2} color="#0f172a">Tech Stack</Heading>
                      <HStack wrap="wrap" gap={2}>
                        {skills.map((skill, i) => (
                          <Tag key={i} bg="#f1f5f9" color="#334155" border="1px solid" borderColor="#e2e8f0">{skill}</Tag>
                        ))}
                      </HStack>
                    </Box>
                  );
                })()}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg="#f8fafc" borderBottomRadius="xl" borderTop="1px solid" borderColor="#e2e8f0">
            <HStack w="full" spacing={4} justify="flex-end">
              {selectedProject?.hosted_link && (
                <Button
                  as={Link}
                  href={selectedProject.hosted_link}
                  isExternal
                  bg={COLORS.brightGreen}
                  color="#0f172a"
                  _hover={{ bg: COLORS.limeGreen, textDecoration: "none" }}
                  leftIcon={<FaExternalLinkAlt />}
                >
                  Live Demo
                </Button>
              )}
              {selectedProject?.github_repo && (
                <Button
                  as={Link}
                  href={selectedProject.github_repo}
                  isExternal
                  variant="outline"
                  borderColor="#64748b"
                  color="#334155"
                  _hover={{ bg: "#f1f5f9", textDecoration: "none" }}
                  leftIcon={<FaGithub />}
                >
                  Source Code
                </Button>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};



const ShowcaseCard = ({ project, studentName, onView }) => {
  const snaps = project.project_snaps || project.snaps || [];
  const coverImage = snaps.length > 0 ? snaps[0] : null;
  const gallerySnaps = snaps.slice(0, 4);
  const technologies = getTechnologies(project);
  const category = (project.genre || "Project").toUpperCase().replace(/\s+/g, " ");
  const priority = project.priority ?? 1;
  const rating = computeAverage(project);

  return (
    <div
      className="projects-showcase-card projects-showcase-card--palette"
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => e.key === "Enter" && onView()}
    >
      <div className="showcase-card-inner">
        {/* Left column: main image, tech tags, self-assessment */}
        <div className="showcase-card-left">
          <div className="showcase-card-image">
            {coverImage ? (
              <img src={getFileUrl(coverImage)} alt={project.title || ""} onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className="showcase-card-image-placeholder">
                <Icon as={FaStar} boxSize={12} />
              </div>
            )}
          </div>
          {technologies.length > 0 && (
            <div className="showcase-tech-tags">
              {technologies.slice(0, 4).map((tech, i) => (
                <span key={i} className="showcase-tech-tag">{tech}</span>
              ))}
            </div>
          )}
          <div className="showcase-self-assessment">
            <span className="showcase-self-assessment-label">RATING</span>
            <StarRating rating={rating} />
          </div>
        </div>

        {/* Right column: category, title, tagline, description, links, gallery, mentor, priority */}
        <div className="showcase-card-right">
          <div className="showcase-card-header-row">
            <span className="showcase-category">{category}</span>
            <div className="showcase-links">
              {project.github_repo && (
                <a href={project.github_repo} target="_blank" rel="noopener noreferrer" className="showcase-link showcase-link--github" aria-label="GitHub">
                  <FaGithub />
                </a>
              )}
              {project.hosted_link && (
                <a href={project.hosted_link} target="_blank" rel="noopener noreferrer" className="showcase-link showcase-link--demo" aria-label="Live Demo">
                  <FaExternalLinkAlt />
                </a>
              )}
            </div>
          </div>
          <h3 className="showcase-title">{project.title || "Untitled Project"}</h3>
          <p className="showcase-tagline">
            {project.one_line_description || project.full_description || "No description available."}
          </p>
          <p className="showcase-description">
            {project.full_description || project.one_line_description || "No description available."}
          </p>

          {gallerySnaps.length > 0 && (
            <div className="showcase-gallery">
              {gallerySnaps.map((snap, i) => (
                <div key={i} className="showcase-gallery-item">
                  <img src={getFileUrl(snap)} alt="" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              ))}
            </div>
          )}

          <div className="showcase-footer">
            {project.mentor_name && (
              <div className="showcase-mentor">
                <FaUser />
                <span>Mentor: <strong>{project.mentor_name}</strong></span>
              </div>
            )}
            <span className="showcase-priority">PRIORITY #{String(priority).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
