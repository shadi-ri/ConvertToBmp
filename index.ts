const fs = require('fs');
const Jimp = require('jimp');
const exifParser = require('exif-parser');

const INPUT_PATH = './in/';
const OUTPUT_PATH = './out/';
const DEFAULT_PHOTO_NAME = 'photo.jpg';

const changeFileExtension = (filename: string, extension: string) => {
  return OUTPUT_PATH + filename.replace(/\.[^/.]+$/, `.${extension}`);
}

const processImage = async (filename: string) => {
  const filePath = INPUT_PATH + filename;
  const bmpPath = changeFileExtension(filename, "bmp");
  const outputFilePath = changeFileExtension(filename, "jpg");

  try {
    let image = await Jimp.read(filePath);
    await image.writeAsync(bmpPath);
    console.log('Image converted to BMP');

    // Reload the original image in order not to lose colors
    image = await Jimp.read(filePath);

    // Check size and resize if necessary
    if (image?.bitmap?.width > 1024 || image?.bitmap?.height > 1024) {
      image.resize(1024, Jimp.AUTO);
      console.log('Image resized');
    }

    await image.writeAsync(outputFilePath);
    console.log('Image converted to JPEG');

    // Parse EXIF data from Image and save as JSON
    const exifData = exifParser.create(fs.readFileSync(filePath)).parse();
    if (exifData?.tags?.Make) {
      const jsonFilename = OUTPUT_PATH + exifData.tags.Make + '.json';
      fs.writeFileSync(jsonFilename, JSON.stringify(exifData, null, 2));
      console.log('EXIF data saved as JSON');
    }

    // Delete BMP file, this had to be added because of a color issue while converting BMP
    fs.unlinkSync(bmpPath);
    console.log('BMP file deleted');

    console.log('Image processed');
  } catch (err) {
    console.error('Error processing image:', err);
  }
};

const filename = process.argv[2] || DEFAULT_PHOTO_NAME;
processImage(filename);
