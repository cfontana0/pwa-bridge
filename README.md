# PWA Bridge

A library to ease communication between a PWA (or any Web application) and a React Native wrapper that hosts it.

This is to help "augment" a Web Application with functionality that is not available for PWAs on certain platforms, like Push notifications or Camera on iOS.

The Web App and the Native Wrapper can communicate through this bridge.

## How to use

Install the package in the projects that are using it - both the web application and the React Native Wrapper

`npm i --save cfontana0/pwa-bridge#v0.1`

The library provide methods to use from the `PWA` side, and others to use from the `React Native` side.

On the React Native side, host the PWA in a Web View

```js

import WKWebView from "react-native-wkwebview-reborn";

import RnBridge from 'pwa-bridge'

takePicture = () => {
    // some event handler
}
cameraRoll = () => {
    // some event handler
}
// in the render function
render() {
    <WKWebView
          ref={ref => { this.webview = ref; }}
          onMessage={RnBridge.handleMessages({
            [RnBridge.Event_Camera]: this.takePicture,
            [RnBridge.Event_Camera_Roll]: this.cameraRoll,
          })}
          style={{ flex: 1, height, width, borderWidth: 1 }}
          source={{ uri: "http://localhost:3000/#/" }}
          allowsBackForwardNavigationGestures
        />
}
```

Pass `RnBridge.handleMessage` to the `onMessage` method of the WebView. Pass the method a map of _event names_ and _handlers_. The _event names_ are just strings, and can be anything and they will be triggered if a matching event is published from the other side (the PWA side). Few events names are provided for convenience (`RnBridge.Event_Camera`, `RnBridge.Event_Camera_Roll` and `RnBridge.Event_Push_Notification` )

> Notice the use of `react-native-wkwebview-reborn` instead of `webview`. React Native comes with WebView component, which uses UIWebView on iOS. This component uses [WKWebView]((https://nshipster.com/wkwebview/)) introduced in iOS 8 with all the performance boost.

## Methods (PWA > React Native)

These are the functions available to use from the PWA side.

`sendToReactNative(eventName, data)` - sends a message to React Native publishing an event called _eventName_ with some _data_

`listenToReactNative(callback)` - Registers to events coming from React Native. It parses the message sent back into JSON for convenience.

`unlistenToReactNative()` - to unregister from listening to messages from React Native. Typically add it `componentWillUnmount()`.

`isReactNative` - Helper method to check if the PWA is loaded inside React Native or just in a web browser

`openCameraRoll`, `openCamera` are alias methods for `sendToReactNative` passing a pre-defined event_name

## Methods (React Native > PWA)

These are the functions available to use from the PWA side.

`handleMessages(options)` - sets up the event handlers on React Native side so that when a PWA posts a message with { event: "event_name" } then the function defined here (the one mapped to "event_name") will be triggered

`sendToWebView` -  sends some data back to the PWA, for example, after photos are selected in a Camera Roll in the native side, those photos can be sent back to the PWA. Or when a push notification is received, then this will forward it to the PWA.
