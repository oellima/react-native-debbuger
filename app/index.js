import { findAPortNotInUse } from 'portscanner'
import { webFrame } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import launchEditor from 'react-dev-utils/launchEditor'
import { PersistGate } from 'redux-persist/integration/react'
import './setup'
import App from './containers/App'
import configureStore from './store/configureStore'
import { beforeWindowClose } from './actions/debugger'
import { invokeDevMethod } from './utils/devMenu'
import { client, tryADBReverse } from './utils/adb'
import config from './utils/config'
import { toggleOpenInEditor, isOpenInEditorEnabled } from './utils/devtools'
import { GlobalStyle } from './globalStyles'

const currentWindow = getCurrentWindow()

webFrame.setZoomFactor(1)
webFrame.setVisualZoomLevelLimits(1, 1)

// Prevent dropped file
document.addEventListener('drop', (e) => {
  e.preventDefault()
  e.stopPropagation()
})
document.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.stopPropagation()
})

let store
let persistor
const handleReady = () => {
  const { defaultReactDevToolsPort = 19567 } = config
  findAPortNotInUse(Number(defaultReactDevToolsPort)).then((port) => {
    window.reactDevToolsPort = port
    const root = createRoot(document.getElementById('root'))
    root.render(
      <>
        <GlobalStyle />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </>,
    )
  })
}

;({ store, persistor } = configureStore(handleReady))

// Provide for user
window.adb = client
window.adb.reverseAll = tryADBReverse
window.adb.reversePackager = () =>
  tryADBReverse(store.getState().debugger.location.port)

window.checkWindowInfo = () => {
  const debuggerState = store.getState().debugger
  return {
    isWorkerRunning: !!debuggerState.worker,
    location: debuggerState.location,
    isPortSettingRequired: debuggerState.isPortSettingRequired,
  }
}

window.beforeWindowClose = () =>
  new Promise((resolve) => {
    if (store.dispatch(beforeWindowClose())) {
      setTimeout(resolve, 200)
    } else {
      resolve()
    }
  })

// For security, we should disable nodeIntegration when user use this open a website
const originWindowOpen = window.open
window.open = (url, frameName, features = '') => {
  const featureList = features.split(',')
  featureList.push('nodeIntegration=0')
  return originWindowOpen.call(window, url, frameName, featureList.join(','))
}

window.openInEditor = (file, lineNumber) => launchEditor(file, lineNumber)
window.toggleOpenInEditor = () => {
  const { port } = store.getState().debugger.location
  return toggleOpenInEditor(currentWindow, port)
}
window.isOpenInEditorEnabled = () => isOpenInEditorEnabled(currentWindow)

window.invokeDevMethod = (name) => invokeDevMethod(name)()

// Package will missing /usr/local/bin,
// we need fix it for ensure child process work
// (like launchEditor of react-devtools)
if (
  process.env.NODE_ENV === 'production' &&
  process.platform === 'darwin' &&
  process.env.PATH.indexOf('/usr/local/bin') === -1
) {
  process.env.PATH = `${process.env.PATH}:/usr/local/bin`
}
