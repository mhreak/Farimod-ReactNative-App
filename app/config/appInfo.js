// config/appInfo.js
const appInfo = {
  name: "farimod",
  slug: "farimod-2",
  version: "1.1.0",
  versionNumber: 1.1, 
  packageName: "com.yeganeh0.farimod2",
  owner: "yeganeh0",


  stores: {
    cafeBazar: {
      app: `bazaar://details?id=com.yeganeh0.farimod2`,
      web: `https://cafebazaar.ir/app/com.yeganeh0.farimod2`,
    },
    googlePlay: {
      app: `market://details?id=com.yeganeh0.farimod2`,
      web: `https://play.google.com/store/apps/details?id=com.yeganeh0.farimod2`,
    },
  },


  api: {
    baseUrl: "http://89.42.208.49/api/MobileApp/",
    updateCheck: "AppRun/NotifyAppRun",
  },
};

export default appInfo;
