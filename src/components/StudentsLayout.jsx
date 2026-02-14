import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, Container, VStack, Heading, Text, Flex } from '@chakra-ui/react';
import AdminLayout from './AdminLayout';

const tabPaths = [
  { path: '/placement/students', label: 'View All Students', end: true },
  { path: '/placement/students/academic', label: 'Manage Academic', end: false },
  { path: '/placement/students/profile_lock', label: 'Profile Lock', end: false },
  { path: '/placement/students/sem_unlock_requests', label: 'Sem Unlock Requests', end: false },
];

export default function StudentsLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (tabPath, end) => {
    if (end) return pathname === tabPath || pathname === tabPath + '/';
    return pathname.startsWith(tabPath);
  };

  return (
    <AdminLayout>
      <Box
        bg="linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)"
        minH="100vh"
        py={6}
        px={{ base: 4, md: 6 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Heading size="lg" color="gray.800" fontWeight="700" letterSpacing="-0.02em">
              Students
            </Heading>
            <Text color="gray.600" fontSize="md">
              View all students or manage academic.
            </Text>

            <Flex
              role="tablist"
              bg="white"
              p={1.5}
              borderRadius="xl"
              shadow="sm"
              border="1px solid"
              borderColor="gray.200"
              flexWrap="wrap"
              gap={1}
              w="full"
            >
              {tabPaths.map(({ path, label, end }) => {
                const active = isActive(path, end);
                return (
                  <Box
                    key={path}
                    as={Link}
                    to={path}
                    py={2.5}
                    px={4}
                    borderRadius="lg"
                    fontWeight="medium"
                    fontSize="sm"
                    color={active ? 'white' : 'gray.600'}
                    bg={active ? 'blue.500' : 'transparent'}
                    shadow={active ? 'sm' : 'none'}
                    _hover={{ bg: active ? 'blue.600' : 'gray.100', color: active ? 'white' : 'gray.800', textDecoration: 'none' }}
                    _focus={{ outline: '2px solid', outlineColor: 'blue.400', outlineOffset: '2px', textDecoration: 'none' }}
                    transition="all 0.2s"
                  >
                    {label}
                  </Box>
                );
              })}
            </Flex>

            <Box w="full" pt={2}>
              <Outlet />
            </Box>
          </VStack>
        </Container>
      </Box>
    </AdminLayout>
  );
}
