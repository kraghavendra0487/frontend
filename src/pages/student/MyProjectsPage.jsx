/**
 * My Projects (new API): create draft, add assets, publish, edit, delete.
 * Uses /api/projects with full schema: title, short_description, description, category, tags,
 * visibility, hosted_url, github_url, mentor_name, tech_stack, priority, assets.
 */

import { Box, Button, VStack, Text, HStack, Badge, useToast, Spinner, Center, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, FormControl, FormLabel } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProjectService } from '../../services/project.service';
import PlacementProtectedRoute from '../../components/PlacementProtectedRoute';

function MyProjectsPageInner() {
  const { user } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createTitle, setCreateTitle] = useState('');
  const [createShortDesc, setCreateShortDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await ProjectService.list();
      setProjects(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Failed to load projects');
      toast({ title: 'Error', description: e.message, status: 'error', isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handlePublish = async (id) => {
    try {
      await ProjectService.publish(id);
      toast({ title: 'Published', description: 'Project is now public.', status: 'success', isClosable: true });
      fetchProjects();
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', isClosable: true });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await ProjectService.delete(id);
      toast({ title: 'Deleted', status: 'success', isClosable: true });
      fetchProjects();
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', isClosable: true });
    }
  };

  const handleCreateDraft = async () => {
    const title = (createTitle || '').trim();
    if (!title) {
      toast({ title: 'Title required', status: 'warning', isClosable: true });
      return;
    }
    setCreating(true);
    try {
      await ProjectService.create({
        title,
        short_description: (createShortDesc || '').trim() || title.slice(0, 200),
      });
      toast({ title: 'Draft created', description: 'Edit from Profile → Projects to add more details and publish.', status: 'success', isClosable: true });
      setCreateTitle('');
      setCreateShortDesc('');
      onCreateClose();
      fetchProjects();
    } catch (e) {
      toast({ title: 'Error', description: e.message, status: 'error', isClosable: true });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" />
      </Center>
    );
  }

  return (
    <Box p={4} maxW="900px" mx="auto">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        My Projects
      </Text>
      <Text fontSize="sm" color="gray.600" mb={4}>
        Create drafts, add media, and publish to the feed. All columns (title, short_description, description, category, tags, hosted_url, github_url, mentor_name, tech_stack, priority) are supported via the API.
      </Text>

      <Button colorScheme="blue" mb={4} onClick={onCreateOpen}>
        Create draft
      </Button>

      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create project (draft)</ModalHeader>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Project title" />
            </FormControl>
            <FormControl mt={3}>
              <FormLabel>Short description</FormLabel>
              <Input value={createShortDesc} onChange={(e) => setCreateShortDesc(e.target.value)} placeholder="Brief summary" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCreateClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreateDraft} isLoading={creating}>Create draft</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {error && (
        <Text color="red.500" mb={4}>{error}</Text>
      )}

      <VStack align="stretch" spacing={4}>
        {projects.length === 0 && !error && (
          <Text color="gray.500">No projects yet. Click &quot;Create draft&quot; above, then edit from Profile → Projects to add description, category, tags, links, and assets.</Text>
        )}
        {projects.map((p) => (
          <Box key={p.id} p={4} borderWidth="1px" borderRadius="md" bg="white">
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Box>
                <Text fontWeight="bold">{p.title || 'Untitled'}</Text>
                <Text fontSize="sm" color="gray.600" noOfLines={1}>{p.short_description}</Text>
                <HStack mt={2} spacing={2}>
                  <Badge colorScheme={p.visibility === 'PUBLIC' ? 'green' : 'gray'}>{p.visibility}</Badge>
                  {p.published_at ? (
                    <Badge colorScheme="blue">Published</Badge>
                  ) : (
                    <Badge colorScheme="yellow">Draft</Badge>
                  )}
                  {p.category && <Badge variant="outline">{p.category}</Badge>}
                </HStack>
              </Box>
              <HStack>
                {!p.published_at && (
                  <Button size="sm" colorScheme="green" onClick={() => handlePublish(p.id)}>
                    Publish
                  </Button>
                )}
                <Button size="sm" variant="outline" as="a" href={`/student/profile/projects`} title="Edit from Profile → Projects">
                  Edit
                </Button>
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => handleDelete(p.id)}>
                  Delete
                </Button>
              </HStack>
            </HStack>
            {(p.views != null || p.likes != null) && (
              <Text fontSize="xs" color="gray.500" mt={2}>
                Views: {p.views ?? 0} · Likes: {p.likes ?? 0}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default function MyProjectsPage() {
  return (
    <PlacementProtectedRoute>
      <MyProjectsPageInner />
    </PlacementProtectedRoute>
  );
}
