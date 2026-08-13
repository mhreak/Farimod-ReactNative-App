const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withRemovePermissions(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    if (!androidManifest.manifest.$) {
      androidManifest.manifest.$ = {};
    }
    androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const permissionsToRemove = [
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ];

    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    permissionsToRemove.forEach((permissionName) => {
      androidManifest.manifest['uses-permission'].push({
        $: {
          'android:name': permissionName,
          'tools:node': 'remove',
        },
      });
    });

    return config;
  });
};
