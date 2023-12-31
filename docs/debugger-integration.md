# Debugger integration

The Debugger worker is referenced from [react-native](https://github.com/facebook/react-native/blob/master/local-cli/server/util/) debugger-ui, so it's only working if you're enabled `Debug JS Remotely`, you can debug your app in Chrome Developer Tools, we keep the following tabs:

- `Console`
- `Sources`
- `Network` (Inspect Network requests if you are enabled [Network Inspect](network-inspect-of-chrome-devtools.md))
- `Memory`

## Multiple React Native packager (custom port) support

We can use [`react-native-debugger-open`](../npm-package) package to detect RN packager port, it will open an another window automatically if another debugger workers are running.

If you don't use [the npm package](../npm-package) and want to change port, click `Debugger` -> `New Window` (`Command⌘ + T` for macOS, `Ctrl + T` for Linux / Windows) in application menu, you need to type an another RN packager port. The default port is use [`Expo`](https://github.com/expo/expo) (and [`create-react-native-app`](https://github.com/react-community/create-react-native-app)) default port.

For macOS (10.12+), it used native tabs feature, see [the support page](https://support.apple.com/en-us/HT206998) for known how to use and setting.

## Debugging tips

#### Global variables in console

When you enabled remote debugging, RNDebugger should switched context to `RNDebuggerWorker.js` automatically, so you can get global variables of React Native runtime in the console.

- `$r`: You selected element on react-devtools.
- `showAsyncStorageContentInDev()` - Log AsyncStorage content
- `$reactNative.*` - Get react-native modules. For example, you can get `$reactNative.AsyncStorage`

#### Enable `Debug Remotely` programmatically

For enable `Debug Remotely` without using dev menu, you can use the built-in `DevSettings` native module:

```js
import { NativeModules } from 'react-native'

if (__DEV__) {
  NativeModules.DevSettings.setIsDebuggingRemotely(true)
}
```

If you're using Expo, you can still use the method, but it probably only works with `jsEngine: jsc` in `app.json`, `jsEngine: hermes` may not works.

## Other documentations

- [Getting Started](getting-started.md)
- [React DevTools Integration](react-devtools-integration.md)
- [Redux DevTools Integration](redux-devtools-integration.md)
- [Apollo Client DevTools Integration](apollo-client-devtools-integration.md)
- [Shortcut references](shortcut-references.md)
- [Network inspect of Chrome Developer Tools](network-inspect-of-chrome-devtools.md)
- [Enable open in editor in console](enable-open-in-editor-in-console.md)
- [Config file in home directory](config-file-in-home-directory.md)
- [Troubleshooting](troubleshooting.md)
- [Contributing](contributing.md)
