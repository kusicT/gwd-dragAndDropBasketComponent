# Drag and Drop Basket v2.1

A custom HTML element component for implementing drag-and-drop functionality with basket acceptance/rejection of objects. Uses the native Drag and Drop API with support for touch devices.

## Features

- 🎯 Drag and Drop support using native HTML5 Drag and Drop API
- 📱 Touch event handling for mobile devices
- ✅ Accept/reject objects in baskets
- 🎨 Multiple visualization options for dropped objects (Insert, Stay, Stay Forever, Vanish)
- 🔔 Custom events for accepted and rejected drops
- ♻️ Web Component (Custom Element) architecture

## Installation

Create one ZIP archive from both files (manifest.json and DaDVasketV2.js) and use common import/install method in Google Web Designer project:
-> In Components panel search for Custom Components, hit PLUS button and select created zip in file explorer dialog.

## Usage

Place DaDBasket component into scene with mouse and in Properties panel search for DaDBasket attributes.

## Attributes

| Attribute                 | Type   | Description                                                          |
|--------- -----------------|--------|----------------------------------------------------------------------|
| `Accepted Ids`            | string | Comma-separated list of element IDs accepted by this basket          |
| `Rejected Ids`            | string | Comma-separated list of element IDs rejected by this basket          |
| `Accept Visualisation`    | string | Accepted object would: Insert, Stay, Stay Forever, Return, Vanish    |
| `Reject Visualisation `   | string | Rejected object would: Insert, Stay, Stay Forever, Return, Vanish    |
| `Dropped to wrong basket` | string | Behavior for wrong basket drops: Ignore, Event                       |

## Events

- **Object was accepted** - Fired when an accepted item is dropped into the basket
- **Object was rejected** - Fired when a rejected item is dropped into the basket

Events could fire any action provided by gwd event wizard depending on other object placed in scene including CSS definitions or custom javascript functions.

## Browser Support

- Modern browsers with support for:
  - HTML5 Drag and Drop API
  - Web Components (Custom Elements)
  - Touch Events

## License

See LICENSE file for details.
