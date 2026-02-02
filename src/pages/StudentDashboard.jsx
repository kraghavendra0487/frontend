import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  SimpleGrid,
  Spinner,
  Link,
  Progress,
  Icon,
  Flex,
  Wrap,
  useToast,
} from "@chakra-ui/react";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaCheckCircle,
  FaBell,
  FaExclamationCircle,
  FaChartBar,
  FaCertificate,
  FaBook,
  FaMedal,
  FaTimesCircle,
  FaChalkboardTeacher,
  FaBuilding,
} from "react-icons/fa";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useStudentDataCache } from "../context/StudentDataCacheContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement } from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler, BarElement);

const CARD_BG = "white";
const CARD_SHADOW = "md";
const CARD_RADIUS = "xl";
const ACCENT = "#20343c";
const ACCENT_LIGHT = "#d4a960";

const StatCard = ({ icon, title, value, color = ACCENT, to }) => {
  const content = (
    <Box
      bg={CARD_BG}
      p={3}
      borderRadius="lg"
      shadow={CARD_SHADOW}
      borderLeft="4px solid"
      borderColor={color}
      h="100%"
      minW="0"
      transition="all 0.2s ease"
      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
    >
      <HStack gap={2} spacing={0}>
        <Box p={2} bg={`${color}20`} borderRadius="full" color={color} flexShrink={0} fontSize="sm">
          {icon}
        </Box>
        <Box flex={1} minW={0}>
          <Text color="gray.500" fontSize="xs" fontWeight="medium" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{title}</Text>
          <Heading size="sm" color={ACCENT} mt={0.5}>{value}</Heading>
        </Box>
      </HStack>
    </Box>
  );
  if (to) return <Link as={RouterLink} to={to} _hover={{ textDecoration: "none" }} w="100%">{content}</Link>;
  return content;
};

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—");
const formatShortDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

export const StudentDashboard = () => {
  const location = useLocation();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();
  const {
    cache,
    loading,
    clearCache,
    fetchDashboard,
    fetchPlacementFeed,
    fetchEvents,
    fetchNotifications,
    fetchJobOffers,
  } = useStudentDataCache();

  const studentUSN = user?.usn;
  const dash = cache.dashboard;
  const completionPercentage = Number.isFinite(dash.completionPercentage)
    ? Math.min(100, Math.max(0, dash.completionPercentage))
    : 0;
  const applications = dash.applications || [];
  const missingSections = dash.missingSections || [];
  const resumeUploaded = dash.resumeUploaded === true;
  const optIn = dash.optIn === true;
  const placementPolicyAgreed = dash.placementPolicyAgreed === true;
  const portfolioCounts = dash.portfolioCounts;
  const drives = cache.placementFeed?.drives || [];
  const processRecords = cache.placementFeed?.processRecords || [];
  const events = cache.events?.list || [];
  const unreadCount = cache.notifications?.unreadCount ?? 0;
  const jobOffers = cache.jobOffers?.list || [];

  const showNotification = location.state?.isFirstLogin || completionPercentage < 100;

  useEffect(() => {
    if (authLoading || !studentUSN) return;
    clearCache("dashboard");
    fetchDashboard(studentUSN);
  }, [studentUSN, authLoading, clearCache, fetchDashboard]);

  useEffect(() => {
    if (!studentUSN) return;
    fetchPlacementFeed(studentUSN);
    fetchEvents();
    fetchNotifications();
    fetchJobOffers(studentUSN);
  }, [studentUSN, fetchPlacementFeed, fetchEvents, fetchNotifications, fetchJobOffers]);

  const isLoading = !cache.dashboard.loaded && loading.dashboard;

  const totalApplications = applications.length;
  const companiesApplied = useMemo(() => {
    const set = new Set();
    (processRecords || []).forEach((p) => {
      const name = p.drive?.company?.company_name || p.drive?.company_name;
      const id = p.drive?.company_id || p.placement_drive_id;
      if (name) set.add(name);
      else if (id) set.add(String(id));
    });
    return set.size;
  }, [processRecords]);

  const isRoundPassed = (v) => {
    if (v === true) return true;
    if (v === false) return false;
    if (v == null || v === "") return false;
    const s = String(v).toLowerCase().trim();
    return s !== "pending" && s !== "rejected" && s !== "not scheduled" && s !== "false" && s !== "no";
  };

  const getFinalSelectStatus = (p) =>
    String((p?.final_select_status ?? p?.finalSelectStatus ?? "")).trim().toLowerCase();

  const oaPassed = (processRecords || []).filter((p) => isRoundPassed(p.oa_status ?? p.oaStatus)).length;
  const gdPassed = (processRecords || []).filter((p) => isRoundPassed(p.gd_status ?? p.gdStatus)).length;
  const technicalPassed = (processRecords || []).filter((p) => isRoundPassed(p.technical_round_status ?? p.technicalRoundStatus)).length;
  const interviewPassed = (processRecords || []).filter((p) => isRoundPassed(p.interview_status ?? p.interviewStatus)).length;
  const hrPassed = (processRecords || []).filter((p) => isRoundPassed(p.hr_round_status ?? p.hrRoundStatus)).length;
  const selectedCount = (processRecords || []).filter((p) => getFinalSelectStatus(p) === "selected").length;
  const rejectedCount = (processRecords || []).filter((p) => getFinalSelectStatus(p) === "rejected").length;

  const pieData = useMemo(() => {
    const counts = [oaPassed, gdPassed, technicalPassed, interviewPassed, hrPassed, selectedCount, rejectedCount];
    const labels = [
      `OA Passed: ${oaPassed}`,
      `GD Passed: ${gdPassed}`,
      `Technical Passed: ${technicalPassed}`,
      `Interview Passed: ${interviewPassed}`,
      `HR Passed: ${hrPassed}`,
      `Selected: ${selectedCount}`,
      `Rejected: ${rejectedCount}`,
    ];
    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#4299e1", "#38b2ac", "#ed8936", "#9f7aea", "#d53f8c", "#276749", "#e53e3e"],
          borderWidth: 0,
        },
      ],
    };
  }, [oaPassed, gdPassed, technicalPassed, interviewPassed, hrPassed, selectedCount, rejectedCount]);

  const timelineData = useMemo(() => {
    const dates = (processRecords || [])
      .map((p) => p.created_at || p.updated_at)
      .filter(Boolean)
      .map((d) => new Date(d));
    if (dates.length === 0) return { labels: [], data: [] };

    const getWeekStart = (d) => {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      return monday.getTime();
    };

    const byWeek = {};
    dates.forEach((d) => {
      const key = getWeekStart(d);
      byWeek[key] = (byWeek[key] || 0) + 1;
    });

    const minTs = Math.min(...dates.map((d) => getWeekStart(d)));
    const maxTs = Math.max(...dates.map((d) => getWeekStart(d)), Date.now());
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const labels = [];
    const data = [];
    for (let ts = minTs; ts <= maxTs; ts += weekMs) {
      const d = new Date(ts);
      labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
      data.push(byWeek[ts] || 0);
    }

    if (labels.length === 0) return { labels: ["No data"], data: [0] };
    return { labels, data };
  }, [processRecords]);

  const barChartData = useMemo(
    () => ({
      labels: timelineData.labels.length ? timelineData.labels : ["No data"],
      datasets: [
        {
          label: "Drives attended",
          data: timelineData.data.length ? timelineData.data : [0],
          backgroundColor: ACCENT,
          borderColor: ACCENT,
          borderWidth: 0,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    }),
    [timelineData]
  );

  const activeDrives = (drives || []).filter(
    (d) =>
      String(d?.placement_status || "").toLowerCase() === "ongoing" ||
      String(d?.placement_status || "").toLowerCase() === "upcoming"
  );
  const processByDriveId = (processRecords || []).reduce((acc, p) => {
    const id = p?.placement_drive_id ?? p?.drive?.id;
    if (id != null) acc[id] = p;
    return acc;
  }, {});

  const upcomingEventsSorted = useMemo(() => {
    return [...(events || [])]
      .filter((e) => e.event_date || e.event_datetime)
      .map((e) => ({ ...e, _date: new Date(e.event_date || e.event_datetime) }))
      .filter((e) => !Number.isNaN(e._date.getTime()))
      .sort((a, b) => a._date - b._date)
      .slice(0, 4);
  }, [events]);

  const upcomingDrivesSorted = useMemo(() => {
    return [...activeDrives]
      .map((d) => ({
        ...d,
        _date: new Date(d.last_date_to_registration || d.event_datetime || d.created_at || 0),
      }))
      .filter((d) => !Number.isNaN(d._date.getTime()))
      .sort((a, b) => a._date - b._date)
      .slice(0, 10);
  }, [activeDrives]);

  const highestCtc = jobOffers.length
    ? Math.max(
        ...jobOffers.map((o) => parseFloat(o.ctc_max_lpa || o.ctc_min_lpa || 0)).filter((n) => !Number.isNaN(n)),
        0
      )
    : null;
  const acceptedOffers = jobOffers.filter((o) => o.is_accepted === true);
  const pendingOffers = jobOffers.filter((o) => o.is_accepted === null);

  if (authLoading || (isLoading && studentUSN)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="80vh" w="100%">
        <Spinner size="xl" color={ACCENT_LIGHT} />
      </Box>
    );
  }

  return (
    <Box minH="100vh" w="100%" maxW="100%" overflowX="hidden" bg="gray.50" py={{ base: 4, md: 5 }} px={{ base: 3, sm: "4vw", md: "3vw", lg: "2.5vw", xl: "2vw" }}>
      <Box w="100%" maxW="100%" minW={0}>
        {showNotification && (
          <Box
            mb={{ base: 4, md: 5 }}
            bg="orange.50"
            p={4}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="orange.400"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={3}
          >
            <HStack gap={3}>
              <FaExclamationCircle color="#dd6b20" size={20} />
              <Box>
                <Heading size="sm" color="orange.800">
                  Complete Your Profile
                </Heading>
                <Text fontSize="sm" color="orange.700">
                  Your profile is {completionPercentage}% complete. {missingSections.length > 0 && "Add missing sections to apply for jobs."}
                </Text>
              </Box>
            </HStack>
            <Button size="sm" colorScheme="orange" as={RouterLink} to="/student/profile">
              Complete Now
            </Button>
          </Box>
        )}

        <Flex justify="space-between" align="center" mb={{ base: 4, md: 5 }} flexWrap="wrap" gap={4}>
          <Box>
            <Heading color={ACCENT} size="xl">
              Welcome back, {user?.full_name || user?.firstName || "Student"}!
            </Heading>
            <Text color="gray.500">Here&apos;s your dashboard at a glance.</Text>
          </Box>
          <HStack gap={2} flexWrap="wrap">
            <Button as={RouterLink} to="/student/notifications" bg={ACCENT} color="white" _hover={{ bg: "#1a2b32" }} leftIcon={<FaBell />}>
              Notifications
              {unreadCount > 0 && (
                <Badge ml={2} colorScheme="red" borderRadius="full">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button as={RouterLink} to="/student/calendar" colorScheme="teal" variant="outline" leftIcon={<FaCalendarAlt />}>
              Calendar
            </Button>
          </HStack>
        </Flex>

        {/* Stats row - full width numbers */}
        <Heading size="sm" color={ACCENT} mb={3}>
          Your numbers
        </Heading>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 4, xl: 8 }} gap={{ base: 3, md: 4 }} mb={6} w="100%" minChildWidth={{ base: "120px", sm: "140px" }}>
          <StatCard icon={<FaBriefcase />} title="Applications" value={totalApplications} color={ACCENT} to="/student/placements/feed" />
          <StatCard icon={<FaBuilding />} title="Companies applied" value={companiesApplied} color="#4299e1" to="/student/placements/feed" />
          <StatCard icon={<FaChartBar />} title="OA passed" value={oaPassed} color="#48bb78" />
          <StatCard icon={<FaChartBar />} title="GD passed" value={gdPassed} color="#38b2ac" />
          <StatCard icon={<FaChartBar />} title="Technical passed" value={technicalPassed} color="#ed8936" />
          <StatCard icon={<FaChartBar />} title="Interview passed" value={interviewPassed} color="#9f7aea" />
          <StatCard icon={<FaChartBar />} title="HR passed" value={hrPassed} color="#d53f8c" />
          <StatCard icon={<FaBriefcase />} title="Offers" value={jobOffers.length} color={ACCENT_LIGHT} to="/student/placements/offers" />
        </SimpleGrid>

        {/* Charts row */}
        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }} gap={{ base: 4, lg: 5 }} mb={6} w="100%" minW={0}>
          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0}>
            <Heading size="sm" color={ACCENT} mb={3}>
              Process rounds (pie)
            </Heading>
            <Box h="240px" display="flex" alignItems="center" justifyContent="center">
              <Doughnut
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "left",
                      align: "start",
                      labels: {
                        boxWidth: 14,
                        padding: 12,
                        usePointStyle: true,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                          const value = ctx.raw;
                          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                          return ` ${ctx.label} (${pct}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0}>
            <Heading size="sm" color={ACCENT} mb={3}>
              Drives attended (timeline)
            </Heading>
            <Box h="240px">
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, precision: 0 },
                      grid: { display: true },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Upcoming events & drives with dates */}
        <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }} gap={{ base: 4, lg: 5 }} mb={6} w="100%" minW={0}>
          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0}>
            <Heading size="sm" color={ACCENT} mb={3}>
              Upcoming events
            </Heading>
            <VStack align="stretch" gap={3}>
              {upcomingEventsSorted.length === 0 ? (
                <Text color="gray.500">No upcoming events.</Text>
              ) : (
                upcomingEventsSorted.map((e) => (
                  <Box
                    key={e.id}
                    p={3}
                    borderLeft="4px solid"
                    borderColor={ACCENT_LIGHT}
                    pl={4}
                    borderRadius="md"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  >
                    <Text fontWeight="semibold" fontSize="sm" color={ACCENT}>
                      {e.title || e.name || "Event"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {formatShortDate(e.event_date || e.event_datetime)} {e.type ? `• ${e.type}` : ""}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
            <Button size="sm" mt={4} as={RouterLink} to="/student/placements/events" colorScheme="blue" variant="outline">
              View all events
            </Button>
          </Box>

          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0}>
            <Heading size="sm" color={ACCENT} mb={3}>
              Upcoming drives
            </Heading>
            <VStack align="stretch" gap={3}>
              {upcomingDrivesSorted.length === 0 ? (
                <Text color="gray.500">No upcoming drives.</Text>
              ) : (
                upcomingDrivesSorted.map((drive) => {
                  const proc = processByDriveId[drive.id];
                  const isRegistered = String(proc?.registration_status || "").toLowerCase() === "registered" || String(proc?.final_select_status || "").toLowerCase() === "selected";
                  const companyName = drive.company?.company_name || drive.company_name || "Company";
                  const dateStr = formatShortDate(drive.last_date_to_registration || drive.event_datetime);
                  return (
                    <Box key={drive.id} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.100" _hover={{ borderColor: ACCENT_LIGHT }}>
                      <Flex justify="space-between" align="flex-start" gap={2}>
                        <Box>
                          <Text fontWeight="semibold" fontSize="sm" color={ACCENT}>
                            {companyName}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {dateStr} • {drive.job_type || drive.job_role || "Role"}
                          </Text>
                        </Box>
                        <Badge colorScheme={isRegistered ? "green" : "gray"}>{isRegistered ? "Registered" : "Apply"}</Badge>
                      </Flex>
                      <Button size="xs" mt={2} as={RouterLink} to={`/student/placements/drive/${drive.id}`} variant="ghost" colorScheme="blue">
                        View details
                      </Button>
                    </Box>
                  );
                })
              )}
            </VStack>
            <Button size="sm" mt={4} as={RouterLink} to="/student/placements/feed" colorScheme="blue" variant="outline">
              All drives
            </Button>
          </Box>
        </Grid>

        {/* Profile & placement status + Offers summary */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 5 }} mb={6} w="100%" minW={0}>
          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0} h="100%">
            <Heading size="sm" color={ACCENT} mb={3}>
              Profile & placement status
            </Heading>
            <Progress value={completionPercentage} colorScheme="blue" borderRadius="full" size="sm" mb={3} />
            <Text fontWeight="semibold" color={ACCENT} mb={2}>
              {completionPercentage}% complete
            </Text>
            {missingSections.length > 0 && (
              <Text fontSize="sm" color="gray.600" mb={2}>
                Missing: {missingSections.map((s) => s.label).join(", ")}
              </Text>
            )}
            <HStack mb={2}>
              <Icon as={resumeUploaded ? FaCheckCircle : FaTimesCircle} color={resumeUploaded ? "green.500" : "gray.400"} />
              <Text fontSize="sm">{resumeUploaded ? "Resume uploaded" : "Resume not uploaded"}</Text>
            </HStack>
            <HStack mb={2}>
              <Icon as={optIn ? FaCheckCircle : FaTimesCircle} color={optIn ? "green.500" : "gray.400"} />
              <Text fontSize="sm">Placement opt-in: {optIn ? "Yes" : "No"}</Text>
            </HStack>
            <HStack mb={4}>
              <Icon as={placementPolicyAgreed ? FaCheckCircle : FaTimesCircle} color={placementPolicyAgreed ? "green.500" : "gray.400"} />
              <Text fontSize="sm">Placement policy: {placementPolicyAgreed ? "Agreed" : "Not agreed"}</Text>
            </HStack>
            <Wrap spacing={2}>
              <Button size="sm" as={RouterLink} to="/student/profile" colorScheme="blue" variant="outline">
                Complete profile
              </Button>
              {!resumeUploaded && (
                <Button size="sm" as={RouterLink} to="/student/profile?section=resume" colorScheme="teal" variant="outline">
                  Upload resume
                </Button>
              )}
              {!placementPolicyAgreed && (
                <Button size="sm" as={RouterLink} to="/student/placements/policy" colorScheme="orange" variant="outline">
                  Agree to policy
                </Button>
              )}
            </Wrap>
          </Box>

          <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} minW={0} h="100%">
            <Heading size="sm" color={ACCENT} mb={3}>
              Offers summary
            </Heading>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="semibold" color={ACCENT}>
                Total: {jobOffers.length}
              </Text>
              {highestCtc != null && !Number.isNaN(highestCtc) && (
                <Text fontSize="sm" color="gray.600">
                  Highest CTC: {highestCtc} LPA
                </Text>
              )}
              <HStack gap={2} flexWrap="wrap">
                <Badge colorScheme="green">Accepted: {acceptedOffers.length}</Badge>
                <Badge colorScheme="yellow">Pending: {pendingOffers.length}</Badge>
              </HStack>
            </VStack>
            <Button size="sm" mt={4} as={RouterLink} to="/student/placements/offers" colorScheme="blue" variant="outline">
              View all offers
            </Button>
          </Box>
        </SimpleGrid>

        {/* Portfolio overview */}
        <Box bg={CARD_BG} p={4} borderRadius={CARD_RADIUS} shadow={CARD_SHADOW} mb={6} w="100%" minW={0}>
          <Heading size="sm" color={ACCENT} mb={3}>
            Portfolio overview
          </Heading>
          {portfolioCounts ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 6 }} gap={4}>
              {[
                { key: "projects", label: "Projects", icon: FaChartBar, path: "/student/profile?section=projects" },
                { key: "internships", label: "Internships", icon: FaBriefcase, path: "/student/profile?section=internships" },
                { key: "trainings", label: "Trainings", icon: FaChalkboardTeacher, path: "/student/profile?section=trainings" },
                { key: "certifications", label: "Certifications", icon: FaCertificate, path: "/student/profile?section=certifications" },
                { key: "publications", label: "Publications", icon: FaBook, path: "/student/profile?section=publications" },
                { key: "extraCurricular", label: "Extra-curricular", icon: FaMedal, path: "/student/profile?section=extra-curricular" },
              ].map(({ key, label, icon: IconItem, path }) => (
                <Link key={key} as={RouterLink} to={path} _hover={{ textDecoration: "none" }}>
                  <Box
                    p={3}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="gray.100"
                    _hover={{ borderColor: ACCENT_LIGHT, shadow: "md" }}
                    textAlign="center"
                  >
                    <Icon as={IconItem} color={ACCENT} mb={2} />
                    <Text fontSize="sm" fontWeight="semibold" color={ACCENT}>
                      {portfolioCounts[key] ?? 0}
                    </Text>
                    <Text fontSize="xs" color="gray.600">{label}</Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.500">Complete your profile to see portfolio counts.</Text>
          )}
          <Button size="sm" mt={4} as={RouterLink} to="/student/profile" variant="ghost">
            Edit portfolio
          </Button>
        </Box>

      </Box>
    </Box>
  );
};
