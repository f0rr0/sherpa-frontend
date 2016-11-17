
export function boundsToRegion(bounds) {
    const latitudeDelta = Math.abs(bounds.topLeft.latitude - bounds.bottomRight.latitude);
    const longitudeDelta = Math.abs(bounds.topLeft.longitude - bounds.bottomRight.longitude);

    return {
        latitude: bounds.topLeft.latitude - (latitudeDelta / 2),
        longitude: bounds.topLeft.longitude + (longitudeDelta / 2),
        latitudeDelta,
        longitudeDelta,
    };
}