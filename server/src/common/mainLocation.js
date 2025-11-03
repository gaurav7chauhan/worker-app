export function parseLocation(location) {
  if (!location || typeof location !== 'object') {
    throw new AppError('Invalid location: missing object', { status: 400 });
  }

  if (location.type !== 'Point' || !Array.isArray(location.coordinates)) {
    throw new AppError(
      'Invalid location: must be GeoJSON Point with coordinates [lng, lat]',
      { status: 400 }
    );
  }

  if (location.coordinates.length !== 2) {
    throw new AppError(
      'Invalid location: coordinates must be exactly [lng, lat]',
      { status: 400 }
    );
  }

  const [lngRaw, latRaw] = location.coordinates;

  const lng = Number(lngRaw);
  const lat = Number(latRaw);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw new AppError('Invalid location: lng/lat must be numbers', {
      status: 400,
    });
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new AppError('Invalid location: lng in [-180,180], lat in [-90,90]', {
      status: 400,
    });
  }
  return { lng, lat };
}
