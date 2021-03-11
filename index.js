var debug = require('debug')('metalsmith:imageAspectRatio');
var multimatch = require('multimatch');
var sizeOf = require('image-size');

module.exports = plugin;

function plugin(opts) {
    opts.documentPattern = opts.documentPattern || '**/*.html';
    opts.imagePattern = opts.imagePattern || ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'];

    var totalImagesFixed = 0;
    var imageRegex = /<img(.*?)>/g;
    var imageSourceRegex = /src\s*=\s*"(.+?)"/;
    var images = {};

    return function (files, metalsmith, done) {
        setImmediate(done);

        // Collect image information
        Object.keys(files).forEach(function (file) {
            if (multimatch(file, opts.imagePattern).length) {
                var image = files[file];

                // Save image dimensions for later use
                images[file] = sizeOf(image.contents);

                debug('imageAspectRatio got dimensions for: %s', file);
            }
        });

        // Go through documents and update the images
        Object.keys(files).forEach(function (file) {
            if (multimatch(file, opts.documentPattern).length) {
                var document = files[file];

                if (!document.contents) {
                    return;
                }

                var html = document.contents.toString();
                var imagesFound = html.match(imageRegex);

                if (!imagesFound) {
                    return;
                }

                totalImagesFixed += imagesFound.length;

                imagesFound.forEach((image) => {
                    // For each image found in current document
                    var src = image.match(imageSourceRegex);

                    if (src.length >= 1) {
                        var imageSource = src[1];
                        var matchingImage = images[imageSource.replace('../', '')];

                        if (!matchingImage) {
                            debug("imageAspectRatio couldn't find dimensions for %s", file);
                            return;
                        }

                        // Add aspect ratio based on the actual width/height
                        var aspectRatio = matchingImage.width / matchingImage.height;
                        var style = `aspect-ratio: ${aspectRatio}`;
                        var newImage = image.replace(
                            imageSourceRegex,
                            `src="${imageSource}" style="${style}" width="${matchingImage.width}"`
                        );

                        html = html.replace(image, newImage);
                    }
                });

                document.contents = Buffer.from(html);
            }
        });

        debug('imageAspectRatio is done. Successfully put aspect ratio on ' + totalImagesFixed + ' images.');
        done();
    };
}
