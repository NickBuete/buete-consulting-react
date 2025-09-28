import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createClinic,
  createHmrReview,
  createPatient,
  createPrescriber,
  fetchClinics,
  fetchPatients,
  fetchPrescribers,
  fetchReviews,
} from '../services/hmr';
import type {
  Clinic,
  CreateClinicPayload,
  CreateHmrReviewPayload,
  CreatePatientPayload,
  CreatePrescriberPayload,
  HmrReview,
  Patient,
  Prescriber,
  DashboardSnapshot,
} from '../types/hmr';

interface HmrDashboardState {
  patients: Patient[];
  prescribers: Prescriber[];
  clinics: Clinic[];
  reviews: HmrReview[];
  loading: boolean;
  error: string | null;
}

const initialState: HmrDashboardState = {
  patients: [],
  prescribers: [],
  clinics: [],
  reviews: [],
  loading: true,
  error: null,
};

export const useHmrDashboard = () => {
  const [state, setState] = useState<HmrDashboardState>(initialState);

  const loadData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [patients, prescribers, clinics, reviews] = await Promise.all([
        fetchPatients(),
        fetchPrescribers(),
        fetchClinics(),
        fetchReviews({ includeCompleted: false }),
      ]);

      setState({
        patients,
        prescribers,
        clinics,
        reviews,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load HMR data';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats: DashboardSnapshot = useMemo(() => {
    const followUpsDue = state.reviews.filter((review) => {
      if (!review.followUpDueAt || review.status === 'CLAIMED') {
        return false;
      }
      const dueDate = new Date(review.followUpDueAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate <= today;
    }).length;

    return {
      totalPatients: state.patients.length,
      prescriberCount: state.prescribers.length,
      activeReviews: state.reviews.length,
      followUpsDue,
    };
  }, [state.patients.length, state.prescribers.length, state.reviews]);

  const handleCreatePatient = useCallback(
    async (payload: CreatePatientPayload) => {
      await createPatient(payload);
      await loadData();
    },
    [loadData],
  );

  const handleCreatePrescriber = useCallback(
    async (payload: CreatePrescriberPayload) => {
      await createPrescriber(payload);
      await loadData();
    },
    [loadData],
  );

  const handleCreateClinic = useCallback(
    async (payload: CreateClinicPayload) => {
      const clinic = await createClinic(payload);
      await loadData();
      return clinic;
    },
    [loadData],
  );

  const handleCreateReview = useCallback(
    async (payload: CreateHmrReviewPayload) => {
      await createHmrReview(payload);
      await loadData();
    },
    [loadData],
  );

  return {
    ...state,
    stats,
    refresh: loadData,
    createPatient: handleCreatePatient,
    createPrescriber: handleCreatePrescriber,
    createClinic: handleCreateClinic,
    createReview: handleCreateReview,
  };
};
