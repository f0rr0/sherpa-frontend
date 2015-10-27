/**
 * Get the value of a querystring
 * @param  {String} field The field to get the value of
 * @param  {String} url   The URL to get the value from
 * @return {String}       The field value
 */

export function getQueryString(field, url) {
    let reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    let string = reg.exec(url);
    return string ? string[1] : null;
}

/**
 * Get the value of a querystring
 * @param  {Object} data  JSON object containing the data to be encoded
 * @return {String}       Formatted and encoded query string
 */

export function encodeQueryData(data) {
    let ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
}