import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  HStack, 
  Button, 
  Text, 
  Flex, 
  Avatar, 
  Container, 
  Image, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { 
  FaBuilding, 
  FaUsers, 
  FaBriefcase, 
  FaHandshake, 
  FaBell, 
  FaCalendarAlt,
  FaTachometerAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { CompanyService } from '../services/company.service';
import { getFileUrl } from '../utils/fileUrl';

const CompanyLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [companyProfile, setCompanyProfile] = useState(null);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const data = await CompanyService.getMyProfile();
        setCompanyProfile(data);
      } catch (err) {
        console.error('Failed to load company profile:', err);
      }
    };
    loadCompanyProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/company/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/company/profile', label: 'Company Profile', icon: FaBuilding },
    { path: '/company/contacts', label: 'Contacts', icon: FaUsers },
    { path: '/company/drives', label: 'Placement Drives', icon: FaBriefcase },
    { path: '/company/offers', label: 'Offers', icon: FaHandshake },
    { path: '/company/notifications', label: 'Notifications', icon: FaBell },
    { path: '/company/events', label: 'Events', icon: FaCalendarAlt },
  ];

  const isActive = (path) => {
    if (path === '/company/drives') {
      return location.pathname === path || location.pathname.startsWith('/company/drive/');
    }
    return location.pathname === path;
  };

  const displayName = companyProfile?.company_name || 'Company';
  const logoUrl = companyProfile?.company_logo_link ? getFileUrl(companyProfile.company_logo_link) : null;
  const companyType = companyProfile?.company_type;

  return (
    <Box minH="100vh" bg="#f4f6f8">
      {/* Navigation Header */}
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
            {/* Left: Logo & Navigation */}
            <HStack spacing={{ base: 4, md: 8 }}>
              <HStack onClick={() => navigate('/company/dashboard')} cursor="pointer" spacing={3}>
                <Image src="/logo.png" alt="CarvU" w="220px" objectFit="contain" mt={-2} />
              </HStack>
              
              <HStack spacing={1} display={{ base: 'none', lg: 'flex' }}>
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        fontWeight={active ? '600' : '500'}
                        color={active ? '#172e36' : 'rgba(255, 255, 255, 0.85)'}
                        bg={active ? '#d4a960' : 'transparent'}
                        _hover={{ 
                          bg: active ? '#d4a960' : 'rgba(255, 255, 255, 0.12)', 
                          color: active ? '#172e36' : 'white' 
                        }}
                        leftIcon={<Icon as={item.icon} boxSize={3.5} />}
                        px={3}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </HStack>
            </HStack>

            {/* Right: Profile Menu */}
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
                    src={logoUrl} 
                    border="2px solid"
                    borderColor="#d4a960"
                    bg="#475569"
                    color="white"
                    icon={<Icon as={FaBuilding} boxSize={4} />}
                  />
                  <Text 
                    color="white" 
                    fontSize="sm" 
                    fontWeight="500" 
                    display={{ base: 'none', md: 'block' }}
                    maxW="150px"
                    isTruncated
                  >
                    {displayName}
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
                      src={logoUrl}
                      border="2px solid"
                      borderColor="#d4a960"
                      bg="#475569"
                      color="white"
                      icon={<Icon as={FaBuilding} boxSize={5} />}
                    />
                    <Box>
                      <Text color="white" fontWeight="600" fontSize="sm" maxW="180px" isTruncated>
                        {displayName}
                      </Text>
                      {companyType && (
                        <Text color="#d4a960" fontSize="xs" maxW="180px" isTruncated>
                          {companyType}
                        </Text>
                      )}
                      <Text color="gray.400" fontSize="xs">
                        {user?.email}
                      </Text>
                    </Box>
                  </HStack>
                </Box>

                {/* Mobile Navigation */}
                <Box display={{ base: 'block', lg: 'none' }} borderBottom="1px solid" borderColor="#334155" pb={2}>
                  {navItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      as={Link}
                      to={item.path}
                      bg="transparent"
                      color={isActive(item.path) ? '#d4a960' : 'gray.300'}
                      _hover={{ bg: '#334155', color: 'white' }}
                      fontSize="sm"
                      py={2}
                      icon={<Icon as={item.icon} boxSize={4} />}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Box>

                <MenuItem
                  as={Link}
                  to="/company/profile"
                  bg="transparent"
                  color="gray.300"
                  _hover={{ bg: '#334155', color: 'white' }}
                  fontSize="sm"
                  py={2}
                >
                  Company Settings
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

      {/* Page Content */}
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default CompanyLayout;
