# anywidget gallery

A showcase of widgets built with [anywidget](https://github.com/manzt/anywidget), a library that makes it easy to create reusable widgets across [marimo](https://github.com/marimo-team/marimo), Jupyter, and more.

<p align="center">
  <a href="https://anywidget.gallery" target="_blank"><strong>Gallery</strong></a> ·
  <a href="https://anywidget.dev" target="_blank"><strong>anywidget</strong></a>
</p>

## Contributing a widget

To add your anywidget to the gallery, create a new directory in the `data` folder with your widget's name and add a `config.yaml` file with the required metadata and screenshots.

Example `config.yaml`:

```yaml
name: Quak
description: a scalable data profiler
homePageUrl: https://manzt.github.io/quak/
environments: [marimo, jupyter, colab]
notebookUrl: https://raw.githubusercontent.com/marimo-team/marimo/refs/heads/main/examples/third_party/anywidget/reactive_quak.py
githubRepo: manzt/quak
tags: [visualization, charts, data science]
image: thumbnail.jpg
gif: thumbnail.gif
packageName: quak
```

## Development

See [gallery/README.md](gallery/README.md).
