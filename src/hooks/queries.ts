import { useCallback } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { BookingRequest, EventTypeCode, FreeSoonItem, LatLng, QuickFilter, QuoteRequest, SortKey, VenueDetail, VenueListItem, VenueQuery } from '../types';
import { useLocation } from '../store/location';
import { startOfToday, toMonthKey } from '../lib/dates';
import { STALE } from '../lib/queryClient';

const round = (n: number) => Math.round(n * 1000) / 1000; // ~100 m — keshni keraksiz yangilamaslik uchun

export const venueKey = (slug: string, from: LatLng) => ['venue', slug, from] as const;
export const calendarKey = (hallId: string, month: string) => ['calendar', hallId, month] as const;

export function useVenues(
  opts: { q?: string; filter?: QuickFilter; event_type?: EventTypeCode; sort?: SortKey; radiusKm?: number } = {},
) {
  const { coords, radiusKm, ready } = useLocation();
  const { radiusKm: override, ...rest } = opts;
  const params: VenueQuery = { lat: round(coords.lat), lng: round(coords.lng), radius_km: override ?? radiusKm, ...rest };
  return useQuery({
    queryKey: ['venues', params],
    queryFn: ({ signal }) => api.listVenues(params, signal),
    placeholderData: keepPreviousData,
    staleTime: STALE.list,
    // Haqiqiy joylashuv aniqlanguncha kutamiz: noto'g'ri koordinata bilan keraksiz so'rov va "miltillash" bo'lmasin
    enabled: ready,
  });
}

export function useFreeSoon(days = 3) {
  const { coords, radiusKm, ready } = useLocation();
  const params = { lat: round(coords.lat), lng: round(coords.lng), radius_km: radiusKm, days };
  return useQuery({ queryKey: ['free-soon', params], queryFn: ({ signal }) => api.freeSoon(params, signal), staleTime: STALE.list, enabled: ready });
}

export function useVenue(slug: string | undefined) {
  const { coords, ready } = useLocation();
  const from = { lat: round(coords.lat), lng: round(coords.lng) };
  return useQuery({
    queryKey: venueKey(slug ?? '', from),
    queryFn: ({ signal }) => api.getVenue(slug!, from, signal),
    enabled: !!slug && ready,
    staleTime: STALE.detail,
  });
}

export function useCalendar(hallId: string | undefined, month: string) {
  return useQuery({
    queryKey: calendarKey(hallId ?? '', month),
    queryFn: ({ signal }) => api.getCalendar(hallId!, month, signal),
    enabled: !!hallId,
    placeholderData: keepPreviousData,
    staleTime: STALE.calendar,
  });
}

export function useQuote(req: QuoteRequest | null) {
  return useQuery({
    queryKey: ['quote', req],
    queryFn: ({ signal }) => api.quote(req!, signal),
    enabled: !!req,
    placeholderData: keepPreviousData,
    staleTime: STALE.quote,
  });
}

/**
 * Foydalanuvchi kartani bosishga TAYYORLANGANDA (onPressIn / hover) to'yxona sahifasi va uning joriy oy kalendari
 * oldindan yuklanadi. Sahifa ochilganda ma'lumot allaqachon shu yerda — yuklanish ko'rinmaydi.
 * (Aks holda: sahifa ochiladi → to'yxona yuklanadi → zal ma'lum bo'ladi → kalendar yuklanadi — ketma-ket kutish.)
 */
export function usePrefetchVenue() {
  const qc = useQueryClient();
  const { coords, ready } = useLocation();
  const lat = round(coords.lat);
  const lng = round(coords.lng);
  return useCallback((slug: string) => {
    if (!ready) return;
    const from = { lat, lng };
    void qc
      .prefetchQuery({ queryKey: venueKey(slug, from), queryFn: ({ signal }) => api.getVenue(slug, from, signal), staleTime: STALE.detail })
      .then(() => {
        const hall = qc.getQueryData<VenueDetail>(venueKey(slug, from))?.halls[0];
        if (!hall) return;
        const m = startOfToday();
        const month = toMonthKey(new Date(m.getFullYear(), m.getMonth(), 1));
        return qc.prefetchQuery({ queryKey: calendarKey(hall.id, month), queryFn: ({ signal }) => api.getCalendar(hall.id, month, signal), staleTime: STALE.calendar });
      })
      .catch(() => {});
  }, [qc, lat, lng, ready]);
}

/** Ro'yxat/"tez orada bo'sh" keshidan shu to'yxonaning ixcham ma'lumoti — sahifa to'liq yuklanguncha rasm va nom darhol ko'rinadi */
export function useVenuePreview(slug: string | undefined): VenueListItem | undefined {
  const qc = useQueryClient();
  if (!slug) return undefined;
  for (const [, data] of qc.getQueriesData<VenueListItem[]>({ queryKey: ['venues'] })) {
    const hit = data?.find((v) => v.slug === slug);
    if (hit) return hit;
  }
  for (const [, data] of qc.getQueriesData<FreeSoonItem[]>({ queryKey: ['free-soon'] })) {
    const hit = data?.find((x) => x.venue.slug === slug);
    if (hit) return hit.venue;
  }
  return undefined;
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
