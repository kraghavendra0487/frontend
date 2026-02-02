import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, VStack, Heading, Text } from '@chakra-ui/react';
import { PlacementService } from '../../services/placement.service';
import { PlacementOverviewTab } from '../ViewAllStudents';
import { useBackgroundRefresh } from '../../hooks/useBackgroundRefresh';
import AdminLayout from '../../components/AdminLayout';

export default function PlacementOverviewPage() {
  const [placementOverviewData, setPlacementOverviewData] = useState([]);
  const [placementSalaryStats, setPlacementSalaryStats] = useState({});
  const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

  const fetchPlacementOverview = useCallback(async (opts = {}) => {
    const { silent = false } = opts;
    try {
      const data = await PlacementService.getPlacementOverview(selectedAcademicYear || undefined);
      setPlacementOverviewData(data.rows || []);
      setPlacementSalaryStats(data.schoolOverview || {});
      if (data.academicYears && data.academicYears.length > 0) {
        setAvailableAcademicYears(data.academicYears);
      }
    } catch (e) {
      if (!silent) console.error('Placement overview:', e);
      if (!silent) {
        setPlacementOverviewData([]);
        setPlacementSalaryStats({});
      }
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    fetchPlacementOverview();
  }, [fetchPlacementOverview]);

  useBackgroundRefresh(fetchPlacementOverview);

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
              Placement Overview
            </Heading>
            <Text color="gray.600" fontSize="md">
              School-wise placement statistics, batch strength, and salary information.
            </Text>

            <Box w="full" pt={2}>
              <PlacementOverviewTab
                rows={placementOverviewData}
                salaryStats={placementSalaryStats}
                academicYears={availableAcademicYears}
                selectedYear={selectedAcademicYear}
                onYearChange={setSelectedAcademicYear}
              />
            </Box>
          </VStack>
        </Container>
      </Box>
    </AdminLayout>
  );
}
