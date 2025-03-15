const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'assets', 'app.ico'), // Set the icon for the packaged app
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'AVoidlauncher', // Name of the application
        authors: 'sh1kto', // Author name
        iconUrl: path.join(__dirname, 'assets', 'app.ico'), // Icon URL for the installer
        setupIcon: path.join(__dirname, 'assets', 'app.ico'), // Icon for the setup executable
        loadingGif: path.join(__dirname, 'assets', 'loading.gif'), // Optional: Add a loading GIF for the installer
        noMsi: true, // Disable MSI installer (optional)
        setupExe: 'AVoidlauncherSetup.exe', // Name of the setup executable
        // Configure installation directory
        outputDirectory: path.join(__dirname, 'out', 'make', 'squirrel.windows', 'x64'),
        // Configure installer behavior
        createDesktopShortcut: true, // Always create a desktop shortcut
        createStartMenuShortcut: true, // Always add to the Start Menu
        shortcutName: 'AVoidlauncher', // Name of the shortcut
        // Ask the user if they want to create a desktop shortcut
        allowElevation: true, // Allow elevation (required for Program Files installation)
        allowToChangeInstallationDirectory: true, // Allow the user to change the installation directory
        // Set the default installation directory to Program Files
        defaultInstallDir: 'C:\\Program Files\\AVoidlauncher',
        // Customize the installer UI
        title: 'AVoidlauncher Installer', // Title of the installer window
        description: 'Install AVoidlauncher to manage your apps easily.', // Description of the installer
        // Optional: Add a license agreement
        license: path.join(__dirname, 'assets', 'license.txt'), // Path to the license file
        // Optional: Add a welcome image
        splashImage: path.join(__dirname, 'assets', 'welcome.png'), // Path to the welcome image
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        icon: path.join(__dirname, 'assets', 'app.png'), // Icon for Debian packages (PNG format)
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        icon: path.join(__dirname, 'assets', 'app.png'), // Icon for RPM packages (PNG format)
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};