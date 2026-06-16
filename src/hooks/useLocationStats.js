/**
 * Computes per-location delivery stats from completed orders.
 * Returns a Map<locationId, { avgMinutes, count, minMinutes, maxMinutes }>
 */
export function computeLocationStats(orders = []) {
  const stats = new Map();

  orders.forEach(order => {
    if (order.status !== 'delivered') return;
    if (!order.departure_time || !order.completion_time) return;

    const mins = (new Date(order.completion_time) - new Date(order.departure_time)) / 60000;
    if (mins <= 0 || mins > 600) return; // ignore bad data

    const locId = order.delivery_location_id;
    if (!locId) return;

    if (!stats.has(locId)) {
      stats.set(locId, { total: 0, count: 0, min: Infinity, max: -Infinity, locationName: order.delivery_location_name });
    }
    const s = stats.get(locId);
    s.total += mins;
    s.count += 1;
    s.min = Math.min(s.min, mins);
    s.max = Math.max(s.max, mins);
  });

  // Convert to final shape
  const result = new Map();
  stats.forEach((s, locId) => {
    result.set(locId, {
      avgMinutes: Math.round(s.total / s.count),
      count: s.count,
      minMinutes: Math.round(s.min),
      maxMinutes: Math.round(s.max),
      locationName: s.locationName,
    });
  });
  return result;
}

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}