"use strict";

exports.searchByKey= (arr,key, value) => {
    for (let i = 0, l = arr.length; i < l; i++){
        if (arr[i][key] === value ) {
            return arr[i];
        }
    }
    return {};
};