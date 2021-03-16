var debug = require('debug')('metalsmith:imageAspectRatio');
var multimatch = require('multimatch');
var sizeOf = require('image-size');
var cheerio = require('cheerio');

module.exports = plugin;

function plugin(opts) {
    opts.documentPattern = opts.documentPattern || '**/*.html';
    opts.imagePattern = opts.imagePattern || ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'];

    var totalImagesFixed = 0;
    var images = {};

    return function (files, metalsmith, done) {
        setImmediate(done);

        // Collect image information
        Object.keys(files).forEach(function (file) {
            if (multimatch(file, opts.imagePattern).length) {
                var image = files[file];

                // Save image dimensions for later use
                images[file] = sizeOf(image.contents);
            }
        });

        // Go through documents and update the images
        Object.keys(files).forEach(function (file) {
            if (multimatch(file, opts.documentPattern).length) {
                var document = files[file];

                if (!document.contents) {
                    return;
                }

                var $ = cheerio.load(document.contents.toString());
                var $imagesFound = $('.article__content img');

                totalImagesFixed += $imagesFound.length;

                $imagesFound.each(function () {
                    // For each image found in current document
                    var $image = $(this);
                    var matchingImage = images[$image.attr('src').replace('../', '')];

                    if (!matchingImage) {
                        debug("imageAspectRatio couldn't find dimensions for %s", $image.attr('src'));
                        return;
                    }

                    // Add aspect ratio based on the actual width/height
                    var aspectRatio = matchingImage.width / matchingImage.height;

                    $image.attr('width', matchingImage.width);
                    $image.css('aspect-ratio', aspectRatio);
                });

                document.contents = Buffer.from($.html());
            }
        });

        debug('imageAspectRatio is done. Successfully put aspect ratio on ' + totalImagesFixed + ' images.');
        done();
    };
}
