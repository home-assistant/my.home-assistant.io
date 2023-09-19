const anafanafo = require("anafanafo");
const path = require("path");
const fs = require("fs");
const redirects = require("../redirect.json");
const { optimize } = require("svgo");

const OUTPUT_DIR = path.resolve(__dirname, "../public/badges");

const fontFamily = 'font-family="Verdana,Geneva,DejaVu Sans,sans-serif"';

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

function roundUpToOdd(val) {
  return val % 2 === 0 ? val + 1 : val;
}

function preferredWidthOf(str, options) {
  // Increase chances of pixel grid alignment.
  return roundUpToOdd(anafanafo(str, options) | 0);
}

function renderLogo({
  logo,
  badgeHeight,
  horizPadding,
  logoWidth = 14,
  logoPadding = 0,
}) {
  if (!logo) {
    return {
      totalLogoWidth: 14 + logoPadding,
      renderedLogo: `<path d="m16.262 3.9999c-0.32893 0-0.65787 0.12168-0.90695 0.36415l-8.4525 8.2267c-0.062745 0.06129-0.12359 0.1289-0.18253 0.20371-0.058942 0.07391-0.11598 0.15323-0.17017 0.23796a4.0318 3.8227 0 0 0-0.52668 1.371c-0.00285 0.01713-0.00856 0.03515-0.00951 0.05138-0.012359 0.09284-0.019013 0.18298-0.019013 0.26951v7.4957c0 0.68684 0.57706 1.2493 1.2834 1.2493h7.8944l-3.4757-3.3837a1.7008 1.6125 0 0 1-0.5685 0.09374c-0.96684 0-1.754-0.76615-1.754-1.7072 0-0.94102 0.78716-1.7072 1.754-1.7072 0.96684 0 1.754 0.76616 1.754 1.7072 0 0.19379-0.03518 0.37947-0.09697 0.55343l2.7066 2.6347v-9.6517a1.8063 1.7126 0 0 1-0.98395-1.5323c0-0.94012 0.78716-1.7063 1.754-1.7063s1.754 0.76615 1.754 1.7072c0 0.67241-0.40214 1.2529-0.98395 1.5314v6.7692l2.6914-2.6202a1.8472 1.7513 0 0 1-0.08176-0.51648c0-0.94192 0.78716-1.7081 1.754-1.7081 0.96684 0 1.754 0.76616 1.754 1.7081 0 0.94102-0.78716 1.7072-1.754 1.7072-0.2139 0-0.4183-0.03966-0.60653-0.10816l-3.7571 3.6577v2.5707h8.2138c0.61794 0 1.137-0.42995 1.2568-0.9978 0.01711-0.08112 0.02662-0.16495 0.02662-0.25058v-7.4957a2.2341 2.1182 0 0 0-0.01901-0.2686 4.01 3.8019 0 0 0-0.53618-1.4223 3.0612 2.9024 0 0 0-0.17017-0.23886 2.2436 2.1272 0 0 0-0.18253-0.20281l-8.4525-8.2276a1.2625 1.197 0 0 0-0.90695-0.36505z"/>`,
    };
  } else {
    const logoHeight = 14;
    const y = (badgeHeight - logoHeight) / 2;
    const x = horizPadding;
    return {
      totalLogoWidth: logoWidth + logoPadding,
      renderedLogo: `<image x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" xlink:href="${escapeXml(
        logo
      )}"/>`,
    };
  }
}

function createAccessibleText({ label, message }) {
  const labelPrefix = label ? `${label}: ` : "";
  return labelPrefix + message;
}

function renderAriaAttributes({ accessibleText }) {
  return `role="img" aria-label="${escapeXml(accessibleText)}"`;
}

function renderTitle({ accessibleText }) {
  return `<title>${escapeXml(accessibleText)}</title>`;
}

function renderBadge({ leftWidth, rightWidth, height, accessibleText }, main) {
  const width = leftWidth + rightWidth;

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${width}"
    height="${height}"
    style="border-radius: 4px;"
    ${renderAriaAttributes({ accessibleText })}
  >
      ${renderTitle({ accessibleText })}
      ${main}
  </svg>`;
}

function myBadge({
  label = "my",
  message,
  logo,
  logoWidth,
  logoPadding = 4,
  color = "#03a9f4",
  labelColor,
}) {
  // For the Badge is styled in all caps. Convert to caps here so widths can
  // be measured using the correct characters.
  label = label.toUpperCase();
  message = message.toUpperCase();

  let labelWidth = preferredWidthOf(label, { font: "10px Verdana" }) || 0;
  let messageWidth =
    preferredWidthOf(message, { font: "bold 10px Verdana" }) || 0;
  const height = 28;
  const hasLabel = label.length || labelColor;
  if (labelColor == null) {
    labelColor = "#555";
  }
  const horizPadding = 9;
  const { totalLogoWidth, renderedLogo } = renderLogo({
    logo,
    badgeHeight: height,
    horizPadding,
    logoWidth,
    logoPadding,
  });

  labelWidth += 10 + totalLogoWidth;
  if (label.length) {
    // Add 10 px of padding, plus approximately 1 px of letter spacing per
    // character.
    labelWidth += 10 + 2 * label.length;
  } else {
    if (hasLabel) {
      labelWidth += 7;
    } else {
      labelWidth -= 7;
    }
  }

  // Add 20 px of padding, plus approximately 1.5 px of letter spacing per
  // character.
  messageWidth += 20 + 1.5 * message.length;
  const leftWidth = !hasLabel ? 0 : labelWidth - 1.5;
  const rightWidth = !hasLabel ? messageWidth + labelWidth : messageWidth;

  color = escapeXml(color);
  labelColor = escapeXml(labelColor);

  const accessibleText = createAccessibleText({ label, message });

  function renderLabelText() {
    const textColor = "#fff";
    if (label === "MY") {
      return `
      <g style="stroke-width: .3; stroke: ${textColor};">
        <path d="m 31.903106,15.269123 0.04782,0.872727 q 0,0.07173 -0.01195,0.263013 0,0.191283 -0.143462,0.3467 -0.131507,0.143462 -0.334745,0.143462 -0.191281,0 -0.298878,-0.01195 -0.394521,0 -0.394521,-0.3467 0,-0.286923 0.263014,-2.307346 0.263013,-2.032378 0.334744,-2.618181 0.07173,-0.585803 0.119551,-0.980323 0.05978,-0.406476 0.08368,-0.597758 0.02391,-0.1912835 0.07173,-0.3825665 0.04782,-0.191282 0.143462,-0.310834 0.179327,-0.2271482 0.693399,-0.2271482 0.860772,0.4303862 1.769365,2.4388537 0.645578,1.43462 0.860771,1.817186 0.215194,0.382564 0.418431,0.526027 L 37.91655,9.7338865 q 0.251059,-0.179327 0.382565,-0.179327 0.382566,0 0.585804,0.3467 0.203237,0.3467005 0.334744,0.8488165 0.143462,0.490162 0.239103,1.087921 0.107597,0.597757 0.179327,1.255291 0.08369,0.64558 0.155417,1.267248 0.167373,1.494396 0.251059,1.87696 0.09564,0.382566 0.09564,0.549939 0,0.155417 -0.107596,0.310834 -0.107596,0.14346 -0.298879,0.14346 -0.191283,0 -0.382565,-0.14346 -0.191284,-0.155418 -0.239104,-0.370611 -0.03587,-0.227148 -0.08368,-0.585804 -0.03587,-0.358654 -0.09564,-0.800995 -0.05978,-0.454296 -0.119551,-0.944458 -0.05978,-0.502117 -0.119552,-0.956413 -0.05978,-0.454296 -0.107597,-0.800996 -0.04782,-0.358655 -0.07173,-0.537982 0,-0.239104 -0.01195,-0.442342 -0.01195,-0.203237 -0.09564,-0.251058 -0.08368,-0.04782 -0.263014,0.119552 -0.167372,0.155416 -0.478206,0.645579 -0.669489,1.040099 -1.936737,3.502862 -0.167372,0.298879 -0.442341,0.131508 -0.32279,-0.179329 -0.549937,-0.920548 L 32.536731,10.21209 q -0.286924,0.573847 -0.526027,3.801741 -0.03587,0.394521 -0.04782,0.66949 -0.05978,0.298879 -0.05978,0.585802 z"/>
        <path d="m 44.006573,21.772732 q -0.251058,0.561893 -0.597757,0.561893 -0.167373,0 -0.251059,-0.155418 -0.07173,-0.143461 0,-0.346699 0.263014,-1.11183 0.753175,-2.534494 0.502117,-1.422665 0.66949,-1.912827 -0.418431,-0.418431 -1.315068,-1.673722 -1.841096,-2.582316 -1.841096,-2.833374 0,-0.01195 0.01196,-0.02391 l 0.454293,-0.454296 q 0.944458,0.872727 2.462764,2.96488 0.382565,0.526028 0.609713,0.884683 0.251058,-0.502118 0.39452,-0.860773 0.143462,-0.37061 0.227149,-0.585803 0.09564,-0.227147 0.251058,-0.597758 0.406475,-0.992279 1.123786,-2.522539 0.107595,-0.04782 0.227148,-0.04782 0.298878,0 0.430386,0.155416 0.04782,0.05978 0.04782,0.143463 0,0.07173 -0.02391,0.143462 z"/>
        <path d="m 31.140745,18.796586 h 10.004768 c 0.279767,0 0.570315,0.05509 0.570315,0.357096 0,0.301994 -0.290558,0.73578 -0.570315,0.733141 l -9.961222,-0.09401 c -0.279756,-0.0026 -0.39613,-0.14911 -0.39613,-0.451105 0,-0.301995 0.07281,-0.545119 0.352584,-0.545119 z"/>
      </g>`;
    }
    const labelTextX = ((labelWidth + totalLogoWidth) / 2) * 10;
    const labelTextLength = (labelWidth - (24 + totalLogoWidth)) * 10;
    const escapedLabel = escapeXml(label);

    const text = `<text fill="${textColor}" x="${labelTextX}" y="175" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>`;
    return text;
  }

  function renderMessageText() {
    const textColor = "#fff";

    const text = `<text fill="${textColor}" x="${(leftWidth + messageWidth / 2) * 10
      }" y="175" font-weight="bold" transform="scale(.1)" textLength="${(messageWidth - 24) * 10
      }">${escapeXml(message)}</text>`;

    return text;
  }

  return renderBadge(
    {
      leftWidth,
      rightWidth,
      accessibleText,
      height,
    },
    ` <g shape-rendering="crispEdges">
        <rect width="${leftWidth}" height="${height}" fill="${labelColor}"/>
        <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="${color}"/>
      </g>
      <g fill="#fff" text-anchor="middle" ${fontFamily} text-rendering="geometricPrecision" font-size="100">
        ${renderedLogo}
        ${hasLabel ? renderLabelText() : ""}
        ${renderMessageText()}
      </g>`
  );
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

writeBadge("homeassistant", "Home Assistant");
