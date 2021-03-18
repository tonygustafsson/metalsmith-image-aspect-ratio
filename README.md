# Metalsmith Image Aspect Ratio

## What is Metalsmith?

It's a great static site generator that is often used to create HTML from Markdown and other markup languages.

More info: https://metalsmith.io/

## Why this plugin?

Images works great with Metalsmith, but they normally just look like this after compilation:

```
<img src="img/my-image.jpg" alt="MyAlt" title="MyTitle">
```

This gives the browser no clue about the width and height of the images without downloading it first. Which means that it will create jumpiness on the site while the images are loading.

Read more about Cumulative Layout Shift (CLS): https://web.dev/cls/

One way of solving this is to add width and height attribute to all images, but that won't work you have max-width: 100% on the images. Then the height still cannot be calculated before loading it. The modern way of fixing this issue is using the CSS attribute `aspect-ratio` which tells the browser how high the image are in relation to it's width. So if the browser sets the image to 100% it knows the news width and can thereby put the height.

Check browser compability: https://caniuse.com/mdn-css_properties_aspect-ratio

## How does the plugin work?

First it loops through all your images you have referenced in documents. It fetches the image height and width using the external library [ImageSize](https://www.npmjs.com/package/image-size).

In the next step it loops through all your documents and replacing the image src with additional information. So the example above becomes something like:

```
<img src="img/my-image.jpg" style="aspect-ratio: 0.6976744186046512" width="300" alt="MyAlt" title="My Title">
```

The real image is 300px wide and 0.6976744186046512 is calculated by dividing the width by the actual height.

## How to install

```javascript
npm install --save-dev metalsmith-image-aspect-ratio
```

## Limitations

This plugin only works for locally stored images, not from CDNs. In order to calculate the aspect ratio, the actual file needs to be measured. To do that, we would need to download the images from the CDN first. Might come in the future though.

## How to use

Add this to the top:

```javascript
var imageAspectRatio = require('metalsmith-image-aspect-ratio');
```

You then use it like so;

```javascript
Metalsmith(__dirnam).use(
    imageAspectRatio({
        pattern: '**/*.html',
        imageExtensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        imagesContainerClassName: '.article__content img',
    })
);
```

You should add imageAspectRatio() after it has compiled to HTML.

`pattern` defines which files to look for image references in (HTML documents most likely). `imageExtensions` defines which types of image extensions the plugin will look up sizes for. You will not get the aspect ratio for extensions not defined. Lastly `imagesContainerClassName` targets a DOM node on where to find the images in the document (pattern). The plugin needs a way of targeting the articles and not apply it to layouts and such.

If you are happy with the defaults you can just skip the options :)
