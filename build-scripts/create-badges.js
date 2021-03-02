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
      renderedLogo: `<path d="M 16.047178,7.5233067 A 0.42899937,0.42899937 0 0 0 15.743753,7.6518664 L 8.8392452,14.653921 a 0.34327261,0.34327261 0 0 0 -0.098765,0.24146 0.34546604,0.34546604 0 0 0 0.3451006,0.345101 h 1.2816972 v 4.919571 c 0,0.158597 0.128194,0.286791 0.286791,0.286791 h 4.842192 v -2.244371 l -1.858937,-1.861131 a 1.4744759,1.4744759 0 0 1 -0.577179,0.117776 c -0.815165,0 -1.475572,-0.662174 -1.475572,-1.477949 0,-0.815836 0.660467,-1.476852 1.475572,-1.476852 0.815228,0 1.475695,0.661077 1.475695,1.476852 0,0.20466 -0.04143,0.399876 -0.116679,0.577117 l 1.076978,1.076977 v -3.274921 c -0.540925,-0.219099 -0.923376,-0.749789 -0.923376,-1.369678 0,-0.815836 0.661626,-1.47801 1.476792,-1.47801 0.815226,0 1.475633,0.662174 1.475633,1.47801 0,0.619889 -0.381352,1.150579 -0.922278,1.369678 v 3.274921 l 1.075758,-1.076977 A 1.4747805,1.4747805 0 0 1 17.56205,14.981169 c 0,-0.815836 0.661687,-1.476852 1.476792,-1.476852 0.815226,0 1.475694,0.661077 1.475694,1.476852 0,0.815775 -0.660468,1.477949 -1.475694,1.477949 a 1.4744759,1.4744759 0 0 1 -0.577118,-0.117776 l -1.858814,1.861192 v 2.244371 h 4.842191 a 0.28648701,0.28648701 0 0 0 0.286792,-0.286791 v -4.919571 h 1.286388 a 0.3464409,0.3464409 0 0 0 0.241583,-0.09871 c 0.136053,-0.13313 0.137821,-0.351863 0.0047,-0.487917 l -1.532676,-1.56727 v -2.470479 c 0,-0.158597 -0.128194,-0.28801 -0.286792,-0.28801 h -1.197189 c -0.158598,0 -0.286792,0.129413 -0.286792,0.28801 v 0.672349 L 16.356575,7.6506478 A 0.42991329,0.42991329 0 0 0 16.047178,7.5233067 Z m 0.0024,3.8759223 c -0.326091,0 -0.590278,0.265101 -0.590278,0.591435 0,0.326274 0.264187,0.590217 0.590278,0.590217 a 0.58997314,0.58997314 0 0 0 0.590216,-0.590217 c 0,-0.326334 -0.264126,-0.591435 -0.590216,-0.591435 z m -2.989335,2.991663 a 0.58997314,0.58997314 0 0 0 -0.590218,0.590277 c 0,0.326274 0.264188,0.591435 0.590218,0.591435 0.32609,0 0.590277,-0.265161 0.590277,-0.591435 a 0.58997314,0.58997314 0 0 0 -0.590277,-0.590277 z m 5.978634,0 c -0.32603,0 -0.591436,0.263943 -0.591436,0.590277 0,0.326274 0.265406,0.591435 0.591436,0.591435 0.326091,0 0.590278,-0.265161 0.590278,-0.591435 a 0.58997314,0.58997314 0 0 0 -0.590278,-0.590277 z"/>`,
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
  color = "#41BDF5",
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

    const text = `<text fill="${textColor}" x="${
      (leftWidth + messageWidth / 2) * 10
    }" y="175" font-weight="bold" transform="scale(.1)" textLength="${
      (messageWidth - 24) * 10
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

redirects.forEach((redirect) => {
  const badge = myBadge({
    message: redirect.badge || redirect.name,
  });
  fs.writeFileSync(
    path.resolve(OUTPUT_DIR, `${redirect.redirect}.svg`),
    optimize(badge).data
  );
});
