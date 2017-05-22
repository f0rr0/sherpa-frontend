"use strict";

export function betterModulo(x, n) {
  return ((x % n) + n) % n;
}

export function cleanLongitude(lng) {
  return betterModulo(lng + 180, 360) - 180;
}

export function bounded(number, lower, upper) {
  return Math.max(Math.min(number, upper), lower);
}

export function cleanLatitude(lat) {
  return bounded(lat, -90, 90);
}

export function cleanLongLat([lng, lat]) {
  return [cleanLongitude(lng), cleanLatitude(lat)];
}

export function cleanBoundingBoxArray([bottomLng, leftLat, topLng, rightLat]) {
 return [cleanLongitude(bottomLng), cleanLatitude(leftLat), cleanLongitude(topLng), cleanLatitude(rightLat)];
}

export function cleanBoundingBoxCorners({topLeft, bottomRight}) {
  return {
    topLeft: cleanLongLat(topLeft),
    bottomRight: cleanLongLat(bottomRight),
  };
}