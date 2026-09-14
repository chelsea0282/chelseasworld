# Content library

The homepage is split into three layers:

1. `content/*.js` contains project records. Each record can include:
   - `documentation`: an array of paragraphs
   - `links`: media or external links with a `label` and `url`
   - `media`: local images or iframes with a `type`, `url`, and `title`
   - `placement`: optional homepage placement for featured windows
2. `content/library.js` is the information architecture. Its `navigation` and
   `featured` arrays decide where records appear on the homepage.
3. `style.css` or another registered stylesheet is the design system. Change
   `designSystem` in `library.js` to switch the homepage stylesheet. Register
   another system in `designSystems` before selecting it.

## Experiences

Standalone projects live in `content/experiences/`, grouped by project rather
than by technology:

- `escape/` is the FIRE(ESC)APE game, with its own `index.html`, `theme.css`,
   `content/`, and `js/` runtime.
- `data-explorations/` contains the type exploration and its source text.
- `data-garden/`, `day-in-my-life/`, and `audio-visualizer/` are separate p5
   experiences. Their HTML files are the entry points; their JavaScript and
   images stay beside them so relative asset paths remain local.

The homepage library links to these entry points, but does not own their
internal runtime code. This keeps a project portable while still making it
discoverable as website content.

To add a project, create one content record, load it in `index.html` before
`library.js`, then add its id to `navigation` or `featured`. The project record
does not need to know anything about the visual design system.

The type exploration's optional compromise and sentiment experiments are
currently commented out, so their absent libraries are no longer loaded by the
entry point.