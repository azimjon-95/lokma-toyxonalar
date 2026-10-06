import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { BookingRequest, EventTypeCode, QuickFilter, QuoteRequest, SortKey } from '../types';
import { useLocation } from '../store/location';

const round = (n: number) => Math.round(n * 1000) / 1000; // ~100 m — keshni keraksiz yangilamaslik uchun

export function useVenues(
  opts: { q?: string; filter?: QuickFilter; event_type?: EventTypeCode; sort?: SortKey; radiusKm?: number } = {},
) {
  const { coords, radiusKm } = useLocation();
  const { radiusKm: override, ...rest } = opts;
  const params = { lat: round(coords.lat), lng: round(coords.lng), radius_km: override ?? radiusKm, ...rest };
  return useQuery({
    queryKey: ['venues', params],
    queryFn: () => api.listVenues(params),
    placeholderData: keepPreviousData,
  });
}

export function useFreeSoon(days = 3) {
  const { coords, radiusKm } = useLocation();
  const params = { lat: round(coords.lat), lng: round(coords.lng), radius_km: radiusKm, days };
  return useQuery({ queryKey: ['free-soon', params], queryFn: () => api.freeSoon(params) });
}

export function useVenue(slug: string | undefined) {
  const { coords } = useLocation();
  const from = { lat: round(coords.lat), lng: round(coords.lng) };
  return useQuery({
    queryKey: ['venue', slug, from],
    queryFn: () => api.getVenue(slug!, from),
    enabled: !!slug,
  });
}

export function useCalendar(hallId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['calendar', hallId, month],
    queryFn: () => api.getCalendar(hallId!, month),
    enabled: !!hallId,
    placeholderData: keepPreviousData,
  });
}

export function useQuote(req: QuoteRequest | null) {
  return useQuery({
    queryKey: ['quote', req],
    queryFn: () => api.quote(req!),
    enabled: !!req,
    placeholderData: keepPreviousData,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BookingRequest) => api.createBooking(req),
    onSuccess: (_b, req) => {
      qc.invalidateQueries({ queryKey: ['calendar', req.hall_id] });
      qc.invalidateQueries({ queryKey: ['venues'] });
      qc.invalidateQueries({ queryKey: ['free-soon'] });
    },
  });
}
