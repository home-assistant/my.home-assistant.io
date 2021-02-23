const anafanafo = require("anafanafo");
const path = require("path");
const fs = require("fs");
const redirects = require("./redirect.js");

const OUTPUT_DIR = path.resolve(__dirname, "public/badges");

const fontFamily = 'font-family="Verdana,Geneva,DejaVu Sans,sans-serif"';

function colorsForBackground() {
  return { textColor: "#fff", shadowColor: "#010101" };
}

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
  if (logo) {
    const logoHeight = 14;
    const y = (badgeHeight - logoHeight) / 2;
    const x = horizPadding;
    return {
      hasLogo: true,
      totalLogoWidth: logoWidth + logoPadding,
      renderedLogo: `<image x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" xlink:href="${escapeXml(
        logo
      )}"/>`,
    };
  } else {
    return { hasLogo: false, totalLogoWidth: 0, renderedLogo: "" };
  }
}

function createAccessibleText({ label, message }) {
  const labelPrefix = label ? `${label}: ` : "";
  return labelPrefix + message;
}

function hasLinks({ links }) {
  const [leftLink, rightLink] = links || [];
  const hasLeftLink = leftLink && leftLink.length;
  const hasRightLink = rightLink && rightLink.length;
  const hasLink = hasLeftLink && hasRightLink;
  return { hasLink, hasLeftLink, hasRightLink };
}

function shouldWrapBodyWithLink({ links }) {
  const { hasLeftLink, hasRightLink } = hasLinks({ links });
  return hasLeftLink && !hasRightLink;
}

function renderAriaAttributes({ accessibleText, links }) {
  const { hasLink } = hasLinks({ links });
  return hasLink ? "" : `role="img" aria-label="${escapeXml(accessibleText)}"`;
}

function renderTitle({ accessibleText, links }) {
  const { hasLink } = hasLinks({ links });
  return hasLink ? "" : `<title>${escapeXml(accessibleText)}</title>`;
}

function renderBadge(
  { links, leftWidth, rightWidth, height, accessibleText },
  main
) {
  const width = leftWidth + rightWidth;
  const leftLink = escapeXml(links[0]);

  return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" style="border-radius: 4px;" ${renderAriaAttributes(
    { links, accessibleText }
  )}>
      ${renderTitle({ accessibleText, links })}
      ${
        shouldWrapBodyWithLink({ links })
          ? `<a target="_blank" xlink:href="${leftLink}">${main}</a>`
          : main
      }
      </svg>`;
}

function myBadge({
  label = "my",
  message,
  links = ["", ""],
  logo = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRpdGxlPkhvbWUgQXNzaXN0YW50IGljb248L3RpdGxlPjxwYXRoIGQ9Ik0xMS45OTIyIDEuMzk0NWEuNzA0MS43MDQxIDAgMDAtLjQ5OC4yMTFMLjE2MjEgMTMuMDk3N0EuNTYzNC41NjM0IDAgMDAwIDEzLjQ5NGEuNTY3LjU2NyAwIDAwLjU2NjQuNTY2NEgyLjY3djguMDc0M2MwIC4yNjAzLjIxMDQuNDcwNy40NzA3LjQ3MDdoNy45NDczdi0zLjY4MzZMOC4wMzcgMTUuODY3MmEyLjQyIDIuNDIgMCAwMS0uOTQ3My4xOTMzYy0xLjMzNzkgMC0yLjQyMTgtMS4wODY4LTIuNDIxOC0yLjQyNTcgMC0xLjMzOSAxLjA4NC0yLjQyMzkgMi40MjE4LTIuNDIzOSAxLjMzOCAwIDIuNDIyIDEuMDg1IDIuNDIyIDIuNDIzOSAwIC4zMzU5LS4wNjguNjU2My0uMTkxNS45NDcybDEuNzY3NiAxLjc2NzZ2LTUuMzc1QzEwLjIgMTAuNjE1IDkuNTcyMyA5Ljc0NCA5LjU3MjMgOC43MjY2YzAtMS4zMzkgMS4wODU5LTIuNDI1OCAyLjQyMzgtMi40MjU4IDEuMzM4IDAgMi40MjE5IDEuMDg2OCAyLjQyMTkgMi40MjU4IDAgMS4wMTc0LS42MjU5IDEuODg4NC0xLjUxMzcgMi4yNDh2NS4zNzVsMS43NjU2LTEuNzY3NmEyLjQyMDUgMi40MjA1IDAgMDEtLjE5MTQtLjk0NzJjMC0xLjMzOSAxLjA4Ni0yLjQyMzkgMi40MjM4LTIuNDIzOSAxLjMzOCAwIDIuNDIyIDEuMDg1IDIuNDIyIDIuNDIzOSAwIDEuMzM4OS0xLjA4NCAyLjQyNTctMi40MjIgMi40MjU3YTIuNDIgMi40MiAwIDAxLS45NDcyLS4xOTMzbC0zLjA1MDggMy4wNTQ3djMuNjgzNmg3Ljk0NzNhLjQ3MDIuNDcwMiAwIDAwLjQ3MDctLjQ3MDd2LTguMDc0M2gyLjExMTNhLjU2ODYuNTY4NiAwIDAwLjM5NjUtLjE2MmMuMjIzMy0uMjE4NS4yMjYyLS41Nzc1LjAwNzgtLjgwMDhsLTIuNTE1Ni0yLjU3MjNWNi40NzA3YzAtLjI2MDMtLjIxMDQtLjQ3MjctLjQ3MDctLjQ3MjdoLTEuOTY0OWMtLjI2MDMgMC0uNDcwNy4yMTI0LS40NzA3LjQ3Mjd2MS4xMDM1TDEyLjUgMS42MDM1YS43MDU2LjcwNTYgMCAwMC0uNTA3OC0uMjA5em0uMDAzOSA2LjM2MTRjLS41MzUyIDAtLjk2ODguNDM1MS0uOTY4OC45NzA3IDAgLjUzNTUuNDMzNi45Njg3Ljk2ODguOTY4N2EuOTY4My45NjgzIDAgMDAuOTY4Ny0uOTY4N2MwLS41MzU2LS40MzM1LS45NzA3LS45Njg3LS45NzA3ek03LjA4OTggMTIuNjY2YS45NjgzLjk2ODMgMCAwMC0uOTY4Ny45Njg4YzAgLjUzNTUuNDMzNi45NzA3Ljk2ODcuOTcwNy41MzUyIDAgLjk2ODgtLjQzNTIuOTY4OC0uOTcwN2EuOTY4My45NjgzIDAgMDAtLjk2ODgtLjk2ODh6bTkuODEyNSAwYy0uNTM1MSAwLS45NzA3LjQzMzItLjk3MDcuOTY4OCAwIC41MzU1LjQzNTYuOTcwNy45NzA3Ljk3MDcuNTM1MiAwIC45Njg4LS40MzUyLjk2ODgtLjk3MDdhLjk2ODMuOTY4MyAwIDAwLS45Njg4LS45Njg4WiIvPjwvc3ZnPg==",
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
  const { hasLogo, totalLogoWidth, renderedLogo } = renderLogo({
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
  } else if (hasLogo) {
    if (hasLabel) {
      labelWidth += 7;
    } else {
      labelWidth -= 7;
    }
  } else {
    labelWidth -= 11;
  }

  // Add 20 px of padding, plus approximately 1.5 px of letter spacing per
  // character.
  messageWidth += 20 + 1.5 * message.length;
  const leftWidth = hasLogo && !hasLabel ? 0 : labelWidth;
  const rightWidth =
    hasLogo && !hasLabel ? messageWidth + labelWidth : messageWidth;

  labelColor = hasLabel || hasLogo ? labelColor : color;

  color = escapeXml(color);
  labelColor = escapeXml(labelColor);

  let [leftLink, rightLink] = links;
  leftLink = escapeXml(leftLink);
  rightLink = escapeXml(rightLink);
  const { hasLeftLink, hasRightLink } = hasLinks({ links });

  const accessibleText = createAccessibleText({ label, message });

  function renderLabelText() {
    const { textColor } = colorsForBackground(labelColor);
    const labelTextX = ((labelWidth + totalLogoWidth) / 2) * 10;
    const labelTextLength = (labelWidth - (24 + totalLogoWidth)) * 10;
    const escapedLabel = escapeXml(label);

    const text = `<text fill="${textColor}" x="${labelTextX}" y="175" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>`;

    if (hasLeftLink && !shouldWrapBodyWithLink({ links })) {
      return `
          <a target="_blank" xlink:href="${leftLink}">
            <rect width="${leftWidth}" height="${height}" fill="rgba(0,0,0,0)"/>
            ${text}
          </a>
        `;
    } else {
      return text;
    }
  }

  function renderMessageText() {
    const { textColor } = colorsForBackground(color);

    const text = `<text fill="${textColor}" x="${
      (labelWidth + messageWidth / 2) * 10
    }" y="175" font-weight="bold" transform="scale(.1)" textLength="${
      (messageWidth - 24) * 10
    }">
        ${escapeXml(message)}</text>`;

    if (hasRightLink) {
      return `
          <a target="_blank" xlink:href="${rightLink}">
            <rect width="${rightWidth}" height="${height}" x="${labelWidth}" fill="rgba(0,0,0,0)"/>
            ${text}
          </a>
        `;
    } else {
      return text;
    }
  }

  return renderBadge(
    {
      links,
      leftWidth,
      rightWidth,
      accessibleText,
      height,
    },
    `
      <g shape-rendering="crispEdges">
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

function renderBadges(cb) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  redirects.forEach((redirect) => {
    const badge = myBadge({ message: redirect.redirect.replace("_", "") });
    fs.writeFileSync(
      path.resolve(OUTPUT_DIR, `${redirect.redirect}.svg`),
      badge
    );
  });
  cb();
}

exports.default = renderBadges;
