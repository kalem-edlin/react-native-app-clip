import { ConfigPlugin, IOSConfig, withPlugins } from "@expo/config-plugins";
// import Constants from "expo-constants";

import { withAppClipEntitlements } from "./withAppClipEntitlements";
import { withAppClipPlist } from "./withAppClipPlist";
import { withConfig } from "./withConfig";
import { withPodfile } from "./withPodfile";
import { withXcode } from "./withXcode";

const withAppClip: ConfigPlugin<{
  name: string;
  groupIdentifier?: string;
  deploymentTarget?: string;
  requestEphemeralUserNotification?: boolean;
  requestLocationConfirmation?: boolean;
  appleSignin?: boolean;
  excludedPackages: string[];
}> = (
  config,
  {
    name = "Clip",
    groupIdentifier,
    deploymentTarget = "14.0",
    requestEphemeralUserNotification,
    requestLocationConfirmation,
    appleSignin = true,
    excludedPackages,
  }
) => {
  const bundleIdentifier = `${config.ios?.bundleIdentifier}.Clip`;
  const targetName = `${IOSConfig.XcodeUtils.sanitizedName(config.name)}Clip`;
  const supportsTablet = /*Constants.expoConfig?.ios?.supportsTablet ??*/ false;

  config = withPlugins(config, [
    [
      withConfig,
      {
        bundleIdentifier,
        targetName,
        groupIdentifier,
        appleSignin,
      },
    ],
    [withAppClipEntitlements, { targetName, groupIdentifier, appleSignin }],
    [withPodfile, { targetName, excludedPackages }],
    [
      withAppClipPlist,
      {
        targetName,
        deploymentTarget,
        requestEphemeralUserNotification,
        requestLocationConfirmation,
      },
    ],
    [
      withXcode,
      {
        name,
        targetName,
        bundleIdentifier,
        deploymentTarget,
        supportsTablet,
      },
    ],
  ]);

  return config;
};

export default withAppClip;
