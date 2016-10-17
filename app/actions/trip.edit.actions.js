import {getQueryString,encodeQueryData} from '../utils/query.utils';
import config from '../data/config';
import * as types from '../constants/user.actiontypes'
const {instagram,sherpa}=config.auth[config.environment];
const SHERPA="SHERPA";
const INSTAGRAM="INSTAGRAM";
import React, { Linking,AlertIOS } from 'react-native';
import store from 'react-native-simple-store';
import DeviceInfo from 'react-native-device-info/deviceinfo';
import SafariView from "react-native-safari-view";
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'react-native-fetch-blob';


export function createMoment(moment){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                const queryData = {
                    "profile": user.profileID,
                    "lat": moment.lat,
                    "lng": moment.lng,
                    "location": moment.location,
                    "state": moment.state,
                    "country": moment.country,
                    "continent": moment.continent,
                    "venue": moment.venue,
                    "date": moment.shotDate.getTime() / 1000,
                    "caption": moment.caption,
                    "scrapeTime": new Date()
                };

                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/json");

                fetch(endpoint + version + "/moment/create", {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: JSON.stringify(queryData)
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    fulfill(JSON.parse(response))
                }).catch(err=>reject(err));
            }
        });
    })
}

export function uploadMoment(momentBlob){
    return new Promise((fulfill,reject)=> {
        const {endpoint,version} = sherpa;

        ImageResizer.createResizedImage(momentBlob.image.uri, 1000, 1000, "JPEG", 80).then((resizedImageUri) => {
            store.get('user').then((user) => {
                RNFetchBlob.fetch("POST", endpoint + version + "/moment/" + momentBlob.data.id + "/upload", {
                    'token' : user.sherpaToken,
                    'Content-Type' : 'multipart/form-data'
                }, [
                    { name : 'enctype', data : 'multipart/form-data'},
                    { name : 'image', filename : 'moment' + momentBlob.data.id + '.jpg', type:'image/jpeg', data: RNFetchBlob.wrap(resizedImageUri)}
                ]).then((resp) => {
                    fulfill(resp)
                }).catch((err) => {
                    reject(err);
                })
            });
        })
    })
}

export function getTripLocation(momentBlobs){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            if(user){

                var coords=[];
                for(var i=0;i<momentBlobs.length;i++){
                    coords.push({"lat":momentBlobs[i].moment.lat,"lng":momentBlobs[i].moment.lng});
                }


                const {endpoint,version,user_uri} = sherpa;
                const queryData = {
                    "points":coords,
                    "hometown":{"lat":user.serviceObject.hometownLatitude,"lng":user.serviceObject.hometownLongitude}
                };


                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/json");

                fetch(endpoint + version + "/cluster", {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: JSON.stringify(queryData)
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    fulfill(JSON.parse(response))
                }).catch(err=>reject(err));
            }else{
                reject('no user');
            }
        }
    )});
}


export function createTrip(tripBlob,tripLocation) {
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                const queryData = {
                    "trip":{
                        "state": tripLocation.state,
                        "country": tripLocation.country,
                        "continent": tripLocation.continent,
                        "name": tripBlob.name,
                        "owner": user.profileID,
                        "dateStart": tripBlob.startDate,
                        "dateEnd": tripBlob.endDate,
                        "type": tripLocation.type,
                        "location":tripLocation.location
                    },
                    "moments":tripBlob.momentIDs
                };

                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/json");

                fetch(endpoint + version + "/trip/create", {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: JSON.stringify(queryData)
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    fulfill(JSON.parse(response))
                }).catch(err=>reject(err));
            }
        });
    })
}


export function getGps(exifCoord, hemi) {

    let degrees = exifCoord.length > 0 ? exifCoord[0] : 0;
    let minutes = exifCoord.length > 1 ? exifCoord[1] : 0;
    seconds = exifCoord.length > 2 ?exifCoord[2] : 0;

    let flip = (hemi == 'W' || hemi == 'S') ? -1 : 1;

    return flip * (degrees + minutes / 60 + seconds / 3600);

}