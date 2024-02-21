import { ConfigPlugin, InfoPlist, withInfoPlist } from "@expo/config-plugins";
import plist from "@expo/plist";
import Constants from "expo-constants";
import fs from "fs";
import path from "path";

export const withAppClipPlist: ConfigPlugin<{
  targetName: string;
  deploymentTarget: string;
  requestEphemeralUserNotification?: boolean;
  requestLocationConfirmation?: boolean;
}> = (
  config,
  {
    targetName,
    deploymentTarget,
    requestEphemeralUserNotification = false,
    requestLocationConfirmation = false,
  },
) => {
  return withInfoPlist(config, (config) => {
    const targetPath = path.join(
      config.modRequest.platformProjectRoot,
      targetName,
    );

    // Info.plist
    const filePath = path.join(targetPath, "Info.plist");

    const infoPlist: InfoPlist = {
      NSAppClip: {
        NSAppClipRequestEphemeralUserNotification:
          requestEphemeralUserNotification,
        NSAppClipRequestLocationConfirmation: requestLocationConfirmation,
      },
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: config.developmentClient,
        NSExceptionDomains: {
          localhost: {
            NSExceptionAllowsInsecureHTTPLoads: config.developmentClient,
          },
        },
        NSAllowsLocalNetworking: config.developmentClient,
      },
      CFBundleName: "$(PRODUCT_NAME)",
      CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
      CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
      CFBundleExecutable: "$(EXECUTABLE_NAME)",
      CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
      CFBundleShortVersionString: config.version,
      UIViewControllerBasedStatusBarAppearance: "NO",
      UILaunchStoryboardName: "SplashScreen",
      UIRequiresFullScreen: true,
      MinimumOSVersion: deploymentTarget,
    };

    config.ios?.infoPlist &&
      Object.keys(config.ios?.infoPlist).forEach((key: string) => {
        config.ios?.infoPlist && (infoPlist[key] = config.ios.infoPlist[key]);
      });

    fs.mkdirSync(path.dirname(filePath), {
      recursive: true,
    });
    fs.writeFileSync(filePath, plist.build(infoPlist));

    // Expo.plist
    const updatesConfig = Constants.expoConfig?.updates;
    if (updatesConfig) {
      const expoPlistFilePath = path.join(targetPath, "Supporting/Expo.plist");
      const expoPlist: InfoPlist = {
        EXUpdatesRuntimeVersion: Constants.expoConfig?.runtimeVersion,
        EXUpdatesURL: updatesConfig.url ?? "",
        EXUpdatesEnabled: updatesConfig?.enabled ?? false,
        EXUpdatesRequestHeaders: updatesConfig.requestHeaders ?? {},
        EXUpdatesCheckOnLaunch: "ALWAYS",
        EXUpdatesLaunchWaitMs: 0,
      };

      fs.mkdirSync(path.dirname(expoPlistFilePath), {
        recursive: true,
      });
      fs.writeFileSync(expoPlistFilePath, plist.build(expoPlist));
    }

    return config;
  });
};
