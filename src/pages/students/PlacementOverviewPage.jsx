import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { PlacementService } from '../../services/placement.service';
import { PlacementOverviewTab } from '../ViewAllStudents';
import { useBackgroundRefresh } from '../../hooks/useBackgroundRefresh';

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
    <Box w="full">
      <PlacementOverviewTab
        rows={placementOverviewData}
        salaryStats={placementSalaryStats}
        academicYears={availableAcademicYears}
        selectedYear={selectedAcademicYear}
        onYearChange={setSelectedAcademicYear}
      />
    </Box>
  );
}
