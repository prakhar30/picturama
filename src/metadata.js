import * as fs from 'fs'

import * as Promise from 'bluebird'
import ExifParser from 'exif-parser'

const readFile = Promise.promisify(fs.readFile)
const fileStat = Promise.promisify(fs.stat)


export function readMetadataOfImage(imagePath) {
  return readExifOfImage(imagePath)
    .then(extractMetaDataFromExif)
    .catch(error => {
      console.log(`Reading EXIF data from ${imagePath} failed: ${error}`)
      return fileStat(imagePath)
        .then(stat => ({
          createdAt: stat.birthtime,
          orientation: 1,
          tags: []
        }))
    })
}


function readExifOfImage(imagePath) {
  return readFile(imagePath)
    .then(buffer => {
      const parser = ExifParser.create(buffer)
      return parser.parse()
    })
}


function extractMetaDataFromExif(exifData) {
  const exifTags = exifData.tags
  let metaData = {
    exposureTime: exifTags.ExposureTime,
    iso:          exifTags.ISO,
    aperture:     exifTags.FNumber,
    focalLength:  exifTags.FocalLength,
    createdAt:    new Date((exifTags.DateTimeOriginal || exifTags.DateTime || exifTags.CreateDate || exifTags.ModifyDate) * 1000),
    orientation:  exifTags.Orientation || 1,
      // Details on orientation: https://www.impulseadventure.com/photo/exif-orientation.html
    tags:         []
  };

  // TODO: Translate from `exiv2` result into `exif-parser` result
  //if (exData.hasOwnProperty('Xmp.dc.subject'))
  //  metaData.tags = exData['Xmp.dc.subject'].split(', ');

  return metaData;
};