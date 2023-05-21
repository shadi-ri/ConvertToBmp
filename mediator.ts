//Mediator Bonus Task
import { fs, Jimp, exifParser, INPUT_PATH, OUTPUT_PATH, DEFAULT_PHOTO_NAME } from './dependencies';


class ImageHandler {
  async loadImage(filePath: string) {
    return await Jimp.read(filePath);
  }

  async saveImage(image: any, path: string): Promise<void> {
    await image.writeAsync(path);
  }

  resizeImage(image: any, width: number, height: number) {
    if (image.bitmap.width > width || image.bitmap.height > height) {
      image.resize(width, Jimp.AUTO);
    }
    return image;
  }
}

class ExifHandler {
  parseExif(filePath: string){
    return exifParser.create(fs.readFileSync(filePath)).parse();
  }

  saveExifToJson(exifData: any, path: string): void {
    if (exifData?.tags?.Make) {
      fs.writeFileSync(path, JSON.stringify(exifData, null, 2));
    }
  }
}

class Mediator {
  private imageHandler: ImageHandler;
  private exifHandler: ExifHandler;

  constructor() {
    this.imageHandler = new ImageHandler();
    this.exifHandler = new ExifHandler();
  }

  async processImage(filename: string): Promise<void> {
    const filePath = INPUT_PATH + filename;
    const bmpPath = OUTPUT_PATH + filename.replace(/\.[^/.]+$/, ".bmp");
    const outputFilePath = OUTPUT_PATH + filename.replace(/\.[^/.]+$/, ".jpg");

    try {
      let image = await this.imageHandler.loadImage(filePath);
      await this.imageHandler.saveImage(image, bmpPath);
      console.log('Image converted to BMP');

      // Reload the original image for further processing
      image = await this.imageHandler.loadImage(filePath);

      // Check size and resize if necessary
      image = this.imageHandler.resizeImage(image, 1024, 1024);
      console.log('Image resized');

      await this.imageHandler.saveImage(image, outputFilePath);
      console.log('Image converted to JPEG');

     // Parse EXIF data from Image and save as JSON
     const exifData = this.exifHandler.parseExif(filePath);
      if (exifData?.tags?.Make) {
        const jsonFilename = OUTPUT_PATH + exifData.tags.Make + '.json';
        this.exifHandler.saveExifToJson(exifData, jsonFilename);
        console.log('EXIF data saved as JSON');
      }

    // Delete BMP file, this had to be added because of a color issue while converting BMP
    fs.unlinkSync(bmpPath);
      console.log('BMP file deleted');

      console.log('Image processed');
    } catch (err) {
      console.error('Error processing image:', err);
    }
  }
}

const filename = process.argv[2] || DEFAULT_PHOTO_NAME;
new Mediator().processImage(filename);
