"use strict";

var Event_Camera_Roll = 'cameraRoll';
var Event_Camera = 'camera';
var Event_Push_Notification = 'pushNotifications';

var validateWebView = function validateWebView(webview) {
  if (!webview) {
    throw new Error('Webview should be setup to use React Native Wrapper from RN side.');
  }
};
/**
 * (PWA) sends a message to React Native
 *
 * @param { string } event a string for the event. It is what is used to match the event handler on the other React Native side.
 * @param { object } data any extra data or options to be passed to the React Native side
 */


var sendToReactNative = function sendToReactNative(event) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (!isReactNative()) return;
  window && window.postMessage(JSON.stringify({
    event: event,
    data: data
  }));
};
/**
 * (PWA) Registers to events coming from React Native. It augments the functionality
 * by (trying to) parse the message into JSON for convenience
 *
 * @param {Function} func function to be called when the event is triggered from the React Native side
 */


var listenToReactNative = function listenToReactNative(func) {
  if (!isReactNative()) return;

  if (!window) {
    throw new Error('Window object not found.');
  }

  window.receivedMessageFromReactNative = function (data) {
    try {
      var parsedData = JSON.parse(data);
      func(parsedData);
    } catch (err) {
      console.warn("Data received from React Native is not valid JSON. ".concat(data));
      func(data);
    }
  };
};
/**
 * (PWA) to unregister from listening to messages from React Native
 * typically add it componentWillUnmount()
 */


var unlistenToReactNative = function unlistenToReactNative() {
  if (!isReactNative()) return;

  if (!window) {
    throw new Error('Window object not found.');
  }

  delete window.receivedMessageFromReactNative;
};
/**
 * Alias to sendToReactNative passing Event_Camera_Roll
 */


var openCameraRoll = function openCameraRoll() {
  return sendToReactNative(Event_Camera_Roll);
};
/**
 * Alias to sendToReactNative passing Event_Camera
 */


var openCamera = function openCamera() {
  return sendToReactNative(Event_Camera);
};
/**
 * (PWA) Helper method to check if the PWA is loaded inside React Native or just in a web browser
 */


var isReactNative = function isReactNative() {
  var isReactNative = !!(window && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.reactNative) || !!window.originalPostMessage;
  console.warn("IsReactNative ".concat(isReactNative));
  return isReactNative;
};
/**
 * (React Native) sets up the event handlers on React Native side so that
 * when a PWA posts a message with { event: "event_name" } then
 * the function defined here (the one mapped to "event_name") will be triggered
 *
 * @param {hashmap} eventMap map of event names to event handlers
 */


var handleMessages = function handleMessages(eventMap) {
  return function (e) {
    if (e && e.nativeEvent && e.nativeEvent.data) {
      var eventData = typeof e.nativeEvent.data === 'string' ? JSON.parse(e.nativeEvent.data) : e.nativeEvent.data;
      var event = eventData.event,
          data = eventData.data;

      if (event && eventMap[event]) {
        return eventMap[event](data);
      } else {
        console.warn("no handler  for event: \"".concat(event, "\""));
      }
    }
  };
};
/**
 * (React Native) sends some data back to the PWA, for example, after photos
 * are selected in a Camera Roll in the native side, those photos can be sent back
 * to the PWA
 *
 * @param { WKWebView } webview references the webview in React Native
 * @param { string } event the event name
 * @param {*} data the data to send back to the PWA
 */


var sendToWebView = function sendToWebView(webview, event, data) {
  validateWebView(webview);
  var message = JSON.stringify({
    event: event,
    data: data
  });
  var func = webview.evaluateJavaScript || webview.injectJavaScript;
  func("receivedMessageFromReactNative('".concat(message, "')"));
};

module.exports = {
  Event_Camera_Roll: Event_Camera_Roll,
  Event_Camera: Event_Camera,
  Event_Push_Notification: Event_Push_Notification,

  /* From PWA to React Native */
  sendToReactNative: sendToReactNative,
  listenToReactNative: listenToReactNative,
  unlistenToReactNative: unlistenToReactNative,
  openCamera: openCamera,
  openCameraRoll: openCameraRoll,
  isReactNative: isReactNative,

  /* From React Native to PWA */
  handleMessages: handleMessages,
  sendToWebView: sendToWebView
};
