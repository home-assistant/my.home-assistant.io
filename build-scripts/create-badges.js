const path = require("path");
const fs = require("fs");
const redirects = require("../redirect.json");
const { optimize } = require("svgo");
const TextToSVG = require('text-to-svg');

const OUTPUT_DIR = path.resolve(__dirname, "../public/badges");

function escapeXml(s) {
  if (s === undefined || typeof s !== "string") {
    return undefined;
  } else {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

function createAccessibleText(message) {
  return message + " My Home Assistant";
}

function renderAriaAttributes({ accessibleText }) {
  return `role="img" aria-label="${escapeXml(accessibleText)}"`;
}

function renderTitle({ accessibleText }) {
  return `<title>${escapeXml(accessibleText)}</title>`;
}

function renderBadge({ width, height, accessibleText }, main) {
  return `
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 ${width} ${height}"
    height="40"
    ${renderAriaAttributes({ accessibleText })}
    style="border-radius:24px;width:auto;"
  >
  ${renderTitle({ accessibleText })}
  <rect width="${width}" height="${height}" rx="${height / 2}" fill="#18BCF2"/>
  ${main}
  <g style="transform: translate(${width - 497}px, 0);">
      <rect x="344" y="16" width="137" height="64" rx="32" fill="#F2F4F9"/>
      <path d="M394.419 37.0469V60.5H390.122V46.7969L384.716 60.5H380.559L375.216 46.9062V60.5H371.028V37.0469H375.216L382.638 55.4062L390.122 37.0469H394.419ZM403.784 37.0469L409.128 46.9375L414.472 37.0469H419.238L411.269 51.1875V60.5H406.878V51.1875L398.847 37.0469H403.784Z" fill="#18BCF2"/>
      <g>
          <path d="M457 60C457 61.65 455.65 63 454 63H430C428.35 63 427 61.65 427 60V51C427 49.35 427.95 47.05 429.12 45.88L439.88 35.12C441.05 33.95 442.96 33.95 444.12 35.12L454.88 45.88C456.05 47.05 457 49.35 457 51V60Z" fill="#18BCF2"/>
          <path d="M442 45.5C443.105 45.5 444 44.6046 444 43.5C444 42.3954 443.105 41.5 442 41.5C440.895 41.5 440 42.3954 440 43.5C440 44.6046 440.895 45.5 442 45.5Z" fill="#F2F4F9" stroke="#F2F4F9"/>
          <path d="M449.5 53.5C450.605 53.5 451.5 52.6046 451.5 51.5C451.5 50.3954 450.605 49.5 449.5 49.5C448.395 49.5 447.5 50.3954 447.5 51.5C447.5 52.6046 448.395 53.5 449.5 53.5Z" fill="#F2F4F9" stroke="#F2F4F9" stroke-miterlimit="10"/>
          <path d="M434.5 57.5C435.605 57.5 436.5 56.6046 436.5 55.5C436.5 54.3954 435.605 53.5 434.5 53.5C433.395 53.5 432.5 54.3954 432.5 55.5C432.5 56.6046 433.395 57.5 434.5 57.5Z" fill="#F2F4F9" stroke="#F2F4F9" stroke-miterlimit="10"/>
          <path d="M442 43.48V63L434.5 55.5" stroke="#F2F4F9" fill="none" stroke-width="2.25" stroke-miterlimit="10"/>
          <path d="M449.5 51.46L442.09 58.87" stroke="#F2F4F9" fill="none" stroke-width="2.25" stroke-miterlimit="10"/>
      </g>
  </g>
</svg>`;
}

function myBadge({
  message,
}) {
  const height = 96;

  const accessibleText = createAccessibleText(message);

  message = message.toUpperCase();

  const { metrics, svg } = renderMessagePath(message, { x: 40, y: 46.8, fontSize: 33.5, letterSpacing: .02, anchor: 'left middle', attributes: { fill: "white" } });

  return renderBadge(
    {
      width: Math.round(metrics.width + 40 + 173),
      accessibleText,
      height,
    },
    svg
  );
}

function renderMessagePath(message, options) {
  const textToSVG = TextToSVG.loadSync('build-scripts/fonts/Figtree-Bold.otf');
  const svg = textToSVG.getPath(message, options);
  const metrics = textToSVG.getMetrics(message, options);
  return { metrics, svg };
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function writeBadge(filename, message) {
  const badge = myBadge({
    message,
  });
  fs.writeFileSync(
    path.resolve(OUTPUT_DIR, `${filename}.svg`),
    optimize(badge).data
  );
}

redirects.forEach((redirect) =>
  writeBadge(redirect.redirect, redirect.badge || redirect.name)
);

// writeBadge("homeassistant", "Home Assistant");
