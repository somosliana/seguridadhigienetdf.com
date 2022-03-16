const yaml = require('js-yaml')
const fs = require('fs')
const htmlmin = require('html-minifier')
const externalLinks = require('eleventy-plugin-external-links')


function minifiedHTML(content, outputPath) {
  // https://www.11ty.dev/docs/config/#transforms-example-minify-html-output
  // Eleventy 1.0+: use this.inputPath and this.outputPath instead
  if (outputPath && outputPath.endsWith('.html')) {
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    })
    return minified
  }
  return content
}

function support404() {
  return {
    callbacks: {
      ready: function (err, bs) {
        bs.addMiddleware('*', (req, res) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' })
          res.write(fs.readFileSync('_site/404.html'))
          res.end()
        })
      },
    },
  }
}

function isProduction() {
  return process.env.NODE_ENV === 'production'
}

module.exports = function (config) {
  config.addPassthroughCopy('favicon.ico')
  config.addPassthroughCopy('images')
  config.addPassthroughCopy('styles.css')
  config.addPassthroughCopy({ 'netlifycms.yaml': '/admin/config.yml' })

  config.addDataExtension('yaml', contents => yaml.load(contents))
  config.addPlugin(externalLinks)

  if (isProduction()) {
    config.addTransform('minifyHtml', minifiedHTML)
  } else {
    config.setBrowserSyncConfig(support404())
  }

  return {
    dir: {
      input: '_pages',
      output: '_site',
      data: '../_data',
      includes: '../_includes',
      layouts: '../_layouts'
    },
  }
}