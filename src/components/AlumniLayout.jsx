import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Box, HStack, Button, Text, Flex, Avatar, Container, Image } from '@chakra-ui/react';
import { ViewIcon, StarIcon, EmailIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const AlumniLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/placement/alumni-dashboard', label: 'Dashboard', icon: ViewIcon },
    { path: '/placement/alumni-profile', label: 'My Profile', icon: ViewIcon },
    { path: '/placement/alumni-directory', label: 'Directory', icon: ViewIcon },
    { path: '/placement/alumni-projects', label: 'Student Projects', icon: StarIcon },
    { path: '/placement/alumni-referral', label: 'Refer HR', icon: EmailIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Box minH="100vh">
      <Box
        bgGradient="linear(to-r, #172e36, #1e3a47)"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
        position="sticky"
        top={0}
        zIndex={1000}
        borderBottom="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
      >
        <Container maxW="100%" px={{ base: 4, md: 8 }}>
          <Flex justify="space-between" align="center" h={{ base: '60px', md: '72px' }}>
            <HStack spacing={{ base: 4, md: 8 }}>
              <HStack onClick={() => navigate('/placement/alumni-dashboard')} cursor="pointer" spacing={3}>
                <Image src="/logo.png" alt="CarvU Alumni" w="220px" objectFit="contain" mt={-2} />
                <Text color="white" fontWeight="bold" fontSize="xl" mt={2} display={{ base: 'none', sm: 'block' }}>Alumni</Text>
              </HStack>
              <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="ghost"
                        size="md"
                        borderRadius="xl"
                        fontWeight={active ? '600' : '500'}
                        color={active ? '#172e36' : 'rgba(255, 255, 255, 0.85)'}
                        bg={active ? '#d4a960' : 'transparent'}
                        _hover={{ bg: active ? '#d4a960' : 'rgba(255, 255, 255, 0.12)', color: active ? '#172e36' : 'white' }}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </HStack>
            </HStack>
            <HStack spacing={{ base: 2, md: 4 }}>
              <Text color="white" fontSize="sm" fontWeight="500" display={{ base: 'none', md: 'block' }}>
                {user?.name || user?.full_name || 'Alumni'}
              </Text>
              <Avatar size="sm" name={user?.name || user?.full_name} src={user?.profile_image} border="2px solid rgba(255,255,255,0.2)" />
              <Button size="sm" variant="ghost" color="white" onClick={handleLogout} _hover={{ bg: 'whiteAlpha.200' }}>
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
      <Box p={{ base: 4, md: 8 }}>
        <Container maxW="100%">{children}</Container>
      </Box>
    </Box>
  );
};

export default AlumniLayout;
