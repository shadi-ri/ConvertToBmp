const fs = require('fs');
const Jimp = require('jimp');
const exifParser = require('exif-parser');

const INPUT_PATH = './in/';
const OUTPUT_PATH = './out/';
const DEFAULT_PHOTO_NAME = 'photo.jpg';

export { fs, Jimp, exifParser, INPUT_PATH, OUTPUT_PATH, DEFAULT_PHOTO_NAME };
