import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  HStack,
  Button,
  Avatar,
  Container,
  Image
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import CardNav from './ui/CardNav';

import UniversalSearch from './UniversalSearch';

const AdminLayout = ({ children, fullWidth = false, compactTop = false }) => {
  const { user, logout, isSuperAdmin, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavHovered, setIsNavHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: "Overview",
      bgColor: "#172e36",
      textColor: "#fff",
      links: [
        { label: "Dashboard", path: "/placement/dashboard", ariaLabel: "Placement Dashboard" },
        { label: "Placement Overview", path: "/placement/overview", ariaLabel: "Placement Overview Statistics" },
        { label: "Events", path: "/events", ariaLabel: "Events" },
        { label: "Calendar of Events", path: "/placement/calendar", ariaLabel: "Calendar of Events" },
        { label: "Monthly Reports", path: "/placement/reports", ariaLabel: "Monthly Placement Reports" }
      ]
    },
    {
      label: "Placement",
      bgColor: "#2a4d5c",
      textColor: "#fff",
      links: [
        { label: "Placement Drives", path: "/placement/events", ariaLabel: "Placement Drives" },
        { label: "Job Offers", path: "/placement/job-offers", ariaLabel: "Job Offers" },
        { label: "Companies", path: "/placement/companies", ariaLabel: "Companies" }
      ]
    },
    {
      label: "People",
      bgColor: "#1e3a47",
      textColor: "#fff",
      links: [
        { label: "View All Students", path: "/placement/students", ariaLabel: "View Students" },
        { label: "Student Projects", path: "/placement/gallery", ariaLabel: "Student Projects" },
        { label: "Alumni", path: "/placement/alumni", ariaLabel: "Alumni Network" },
        { label: "HR Recommendations", path: "/placement/hr-recommendations", ariaLabel: "View HR recommendations from alumni" }
      ]
    },
    {
      label: "Communicate",
      bgColor: "#2d4a54",
      textColor: "#fff",
      links: [
        { label: "Bulk Email", path: "/placement/email", ariaLabel: "Filter and copy emails for bulk mailing" },
        { label: "User Login Management", path: "/placement/user-login", ariaLabel: "Manage user logins and active status" },
        { label: "Alumni Connect", path: "/placement/alumni-connect", ariaLabel: "Connect with Alumni" }
      ]
    },
    {
      label: "Violations",
      bgColor: "#3d5a6c",
      textColor: "#fff",
      links: [
        { label: "Violations", path: "/placement/violations", ariaLabel: "Eligibility logs, placement violations, disciplinary records" }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  const displayRole = userRole
    ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
    : "Admin";

  const CustomLogo = (
    <HStack
      spacing={2}
      alignItems="center"
      _hover={{ transform: 'scale(1.05)' }}
      transition="transform 0.2s ease"
      cursor="pointer"
      onClick={() => navigate('/placement/dashboard')}
      minW="max-content"
    >
      <Image
        src="/logo.png"
        alt="CarvU Logo"
        w="100px"
        maxW="100px"
        objectFit="contain"
        mt={-1}
      />
    </HStack>
  );

  return (
    <Box minH="100vh" bg="#f0f0f0">
      {/* Top Navbar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        w="100%"
        onMouseEnter={() => setIsNavHovered(true)}
        onMouseLeave={() => setIsNavHovered(false)}
      >
        <CardNav 
          logo={CustomLogo}
          items={{
            items: navItems,
            searchComponent: <UniversalSearch />,
            rightActions: (
              <HStack spacing={3}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => navigate('/placement/notifications')}
                  aria-label="Notifications"
                  p={2}
                >
                  <BellIcon boxSize={5} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => navigate('/placement/dashboard')}
                  display={{ base: 'none', md: 'flex' }}
                >
                  {displayRole}
                </Button>
                 <Avatar
                    name={user?.name}
                    size="sm"
                    src={user?.profile_image} 
                    bg="whiteAlpha.300"
                    color="white"
                    ignoreFallback
                  />
                  <Button
                    size="sm"
                    borderRadius="full"
                    onClick={handleLogout}
                    variant="solid"
                    bg="whiteAlpha.200"
                    _hover={{ bg: "whiteAlpha.300", transform: "translateY(-1px)" }}
                    _active={{ bg: "whiteAlpha.400" }}
                    color="white"
                    fontWeight="medium"
                    px={5}
                    transition="all 0.2s"
                  >
                    Logout
                  </Button>
              </HStack>
            )
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        as="main"
        ml={0}
        pt="72px"
        px={fullWidth ? 0 : 8}
        pb={fullWidth ? 0 : 8}
        bg={fullWidth ? "transparent" : "#f0f0f0"}
        minH="100vh"
        transition="filter 0.3s ease"
        filter={isNavHovered ? 'blur(5px)' : 'none'}
      >
        {fullWidth ? (
          <Box w="100%" maxW="100%" p={0} m={0}>
            {children}
          </Box>
        ) : (
          <Container maxW="container.xl" p={0} pt={0} pb={0}>
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default AdminLayout;
