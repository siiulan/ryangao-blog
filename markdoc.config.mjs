import { Markdoc, component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

const text = { type: String };
const required = { type: String, required: true };

export default defineMarkdocConfig({
  nodes: {
    fence: {
      ...nodes.fence,
      transform(node, config) {
        const { name, attributes, children } = nodes.fence.transform(node, config);
        return new Markdoc.Tag(name, attributes, [new Markdoc.Tag('code', {}, children)]);
      },
    },
    image: {
      render: component('./src/components/InlineImage.astro'),
      attributes: { src: required, alt: text, title: text },
    },
  },
  tags: {
    Figure: {
      render: component('./src/components/MediaFigure.astro'),
      attributes: { src: required, alt: required, caption: text },
    },
    Video: {
      render: component('./src/components/MediaVideo.astro'),
      attributes: { src: required, title: required, caption: text, captions: text },
    },
  },
});
