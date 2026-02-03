import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Box, HStack, Button, Text, Flex, Avatar, Container, Image, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';
import { ViewIcon, StarIcon, EmailIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { PlacementService } from '../services/placement.service';
import { getFileUrl } from '../utils/fileUrl';

const AlumniLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [alumniProfile, setAlumniProfile] = useState(null);

  useEffect(() => {
    const loadAlumniProfile = async () => {
      try {
        const data = await PlacementService.getAlumniMe();
        setAlumniProfile(data);
      } catch (err) {
        console.error('Failed to load alumni profile:', err);
      }
    };
    loadAlumniProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/placement/alumni-dashboard', label: 'Dashboard', icon: ViewIcon },
    { path: '/placement/alumni-profile', label: 'My Profile', icon: ViewIcon },
    { path: '/placement/alumni-directory', label: 'Directory', icon: ViewIcon },
    { path: '/placement/alumni-projects', label: 'Student Projects', icon: StarIcon },
    { path: '/placement/alumni-hr-recommendations', label: 'HR Recommendations', icon: EmailIcon },
  ];

  const isActive = (path) => location.pathname === path;

  // Get display name and profile image
  const displayName = alumniProfile?.full_name || user?.name || user?.full_name || 'Alumni';
  const profileImage = alumniProfile?.profile_image ? getFileUrl(alumniProfile.profile_image) : user?.profile_image;
  const shortName = displayName.split(' ')[0]; // First name only for compact display

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

            {/* Profile Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                _hover={{ bg: 'whiteAlpha.200' }}
                _active={{ bg: 'whiteAlpha.300' }}
                borderRadius="full"
                pl={2}
                pr={3}
                py={1}
                h="auto"
              >
                <HStack spacing={3}>
                  <Avatar 
                    size="sm" 
                    name={displayName} 
                    src={profileImage} 
                    border="2px solid"
                    borderColor="#d4a960"
                    bg="#475569"
                    color="white"
                  />
                  <Text 
                    color="white" 
                    fontSize="sm" 
                    fontWeight="500" 
                    display={{ base: 'none', md: 'block' }}
                    maxW="150px"
                    isTruncated
                  >
                    {shortName}
                  </Text>
                  <ChevronDownIcon color="whiteAlpha.700" display={{ base: 'none', md: 'block' }} />
                </HStack>
              </MenuButton>
              <MenuList
                bg="#1e293b"
                borderColor="#334155"
                boxShadow="lg"
                py={2}
              >
                {/* Profile Header */}
                <Box px={4} py={3} borderBottom="1px solid" borderColor="#334155">
                  <HStack spacing={3}>
                    <Avatar 
                      size="md" 
                      name={displayName} 
                      src={profileImage}
                      border="2px solid"
                      borderColor="#d4a960"
                      bg="#475569"
                      color="white"
                    />
                    <Box>
                      <Text color="white" fontWeight="600" fontSize="sm" maxW="180px" isTruncated>
                        {displayName}
                      </Text>
                      {alumniProfile?.current_designation && (
                        <Text color="gray.400" fontSize="xs" maxW="180px" isTruncated>
                          {alumniProfile.current_designation}
                        </Text>
                      )}
                      {alumniProfile?.current_company && (
                        <Text color="#d4a960" fontSize="xs" maxW="180px" isTruncated>
                          {alumniProfile.current_company}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </Box>

                <MenuItem
                  as={Link}
                  to="/placement/alumni-profile"
                  bg="transparent"
                  color="gray.300"
                  _hover={{ bg: '#334155', color: 'white' }}
                  fontSize="sm"
                  py={2}
                >
                  View Profile
                </MenuItem>
                <MenuItem
                  as={Link}
                  to="/placement/alumni-dashboard"
                  bg="transparent"
                  color="gray.300"
                  _hover={{ bg: '#334155', color: 'white' }}
                  fontSize="sm"
                  py={2}
                >
                  Dashboard
                </MenuItem>
                <MenuDivider borderColor="#334155" />
                <MenuItem
                  onClick={handleLogout}
                  bg="transparent"
                  color="red.400"
                  _hover={{ bg: '#334155', color: 'red.300' }}
                  fontSize="sm"
                  py={2}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
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
