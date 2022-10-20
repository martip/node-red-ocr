# @martip/node-red-ocr

A [Node-RED](https://nodered.org/) node that performs OCR on an image, using the [Tesseract.js](https://tesseract.projectnaptha.com/) library.

## Install

Either use the `Node-RED Menu - Manage Palette - Install`, or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install @martip/node-red-ocr

## Usage

You pass the image as a buffer in the `msg.payload`.

Currently, the following languages are supported:

* English
* French
* German
* Italian
* Portuguese
* Spanish
