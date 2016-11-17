import React from 'react';

import {
    Text,
    View,
} from 'react-native';

import MapView from 'react-native-maps';

import each from 'lodash/each';
import some from 'lodash/some';
import map from 'lodash/map';
import flatten from 'lodash/flatten';

import { boundsToRegion } from './libs-maps';

import styles from './styles/clusterStyle';

const LATITUDE_PARTS = 13;
const LONGITUDE_PARTS = 10;

const MINIMAL_DELTA = 0.001;

class Point {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

class ClusterBounds {
    constructor(region, point) {
        this._region = region;
        this._point = point;

        if (this._region) {
            const latitude = region.latitudeDelta / LATITUDE_PARTS;
            const longitude = region.longitudeDelta / LONGITUDE_PARTS;

            this.topLeft = new Point(point.latitude + latitude, point.longitude - longitude);
            this.bottomRight = new Point(point.latitude - latitude, point.longitude + longitude);
        }
    }

    contains(point) {
        // max zoom detection to always show single markers
        if (!this._region
            || this._region.latitudeDelta < MINIMAL_DELTA
            || this._region.longitudeDelta < MINIMAL_DELTA) {
            return false;
        } else {
            return (point.longitude >= this.topLeft.longitude) &&
                (point.longitude <= this.bottomRight.longitude) &&
                (point.latitude <= this.topLeft.latitude) &&
                (point.latitude >= this.bottomRight.latitude);
        }
    }

    getRegion() {
        return boundsToRegion(this);
    }
}

class Cluster {
    constructor(region, marker, initialPoint) {
        this._bounds = new ClusterBounds(region, initialPoint);
        this._markers = [marker];
        this._points = [initialPoint];
    }

    contains(point) {
        return this._bounds.contains(point);
    }

    addPoint(point, marker) {
        this._points.push(point);
        this._markers.push(marker);
    }

    getMarkers() {
        return this._markers;
    }

    getCenter() {
        return this._points[0];
    }

    getRegion() {
        return this._bounds.getRegion();
    }

    getTotalPoints() {
        return this._points.length;
    }

    isClustered() {
        return this.getTotalPoints() > 3;
    }
}

export function getClusters(region, markers, onClusterPress){
    console.log('region',region)
    const clusters = [];

    console.log('get clusters');

    each(markers, marker => {
        const point = new Point(
            marker.props.coordinate.latitude,
            marker.props.coordinate.longitude);

        const found = some(clusters, cluster => {
            if (cluster.contains(point)) {
                cluster.addPoint(point, marker);
                return true;
            }
        });

        if (!found) {
            const cluster = new Cluster(region, marker, point);
            clusters.push(cluster);
        }
    });

    return flatten(map(clusters, (cluster, i) => {
        const center = cluster.getCenter();

        if (!cluster.isClustered()) {
            return cluster.getMarkers();
        }

        return (
            <MapView.Marker
                key={i}
                coordinate={{
                    latitude: center.latitude,
                    longitude: center.longitude,
                }}
                onPress={ev => onClusterPress(cluster, ev)}
            >
                <View style={styles.clusterContainer}>
                    <Text style={styles.clusterText}>
                        {cluster.getTotalPoints()}
                    </Text>
                </View>
            </MapView.Marker>
        );
    }));
}