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

//
//POST /api/v1/moment/create
//
//BODY:
//{
//    profile: <int, user's profile ID>,
//      lat: <float>,
//      lng: <float>,
//      location: <string, location via autocomplete, e.g. "New York City">,
//      state: <string, state via autocomplete, e.g. "New York">,
//      country: <string, country iso via autocomplete, e.g. "US">,
//      continent: <string, continent via autocomplete, e.g. "Europe">,
//      venue: <string, a place name (for IG, this is the location tag text) e.g. "World Trade Center">,
//      date: <string, this is the time the photo was taken, from EXIF if possible, as Epoch, e.g. "1448741862">,
//      caption: <string, caption for photo, e.g. "Having a great time in Vienna!">,
//      scrapeTime: <date, date of upload, e.g. "2016-09-14 16:24:43+00">
//}


export function createMoment(moment){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                console.log('sherpa id',user.sherpaID);
                console.log('sherpa token',user.sherpaToken);
                const queryData = encodeQueryData({
                    profile: user.sherpaID,
                    lat: moment.lat,
                    lng: moment.lng,
                    location: moment.location,
                    state: moment.state,
                    country: moment.country,
                    continent: moment.continent,
                    venue: moment.venue,
                    date: moment.shotDate,
                    caption: moment.caption,
                    scrapeTime: new Date()
                });

                console.log({
                    profile: user.sherpaID,
                    lat: moment.lat,
                    lng: moment.lng,
                    location: moment.location,
                    state: moment.state,
                    country: moment.country,
                    continent: moment.continent,
                    venue: moment.venue,
                    date: moment.date,
                    caption: moment.caption,
                    scrapeTime: new Date().toLocaleString()
                })

                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);

                console.log('create moment::',endpoint + version + "/moment/create")
                fetch(endpoint + version + "/moment/create", {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: queryData
                })
                    .then((rawServiceResponse)=> {
                        console.log(rawServiceResponse,'raw')
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    console.log('response',response);
                    //var parsedResponse=JSON.parse(response);
                    //fulfill(parsedResponse);
                }).catch(err=>reject(err));
            }
        });
    })
}

export function uploadMoment(imagePath,momentID){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            let files = [
                {
                    name: 'file[]',
                    filename: 'moment' + momentID + '.jpg',
                    filepath: imagePath,
                    filetype: 'image/jpg'
                }
            ];

            const {endpoint,version,user_uri} = sherpa;

            let opts = {
                url: endpoint + version + "/moment/" + momentID + "/upload",
                files: files,
                method: 'POST',                             // optional: POST or PUT
                headers: sherpaHeaders,  // optional
                params: {enctype: 'multipart/form-data'}              // optional
            };


            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            RNUploader.upload(opts, (err, response) => {
                if (err) {
                    console.log(err);
                    return;
                }

                let status = response.status;
                let responseString = response.data;
                let json = JSON.parse(responseString);

                console.log('upload complete with status ' + status+" "+ json);
                fulfill(status)
            });
        })
    })
}


export function createTrip(imagePath,moments) {
    return new Promise((fulfill, reject)=> {

    })
}