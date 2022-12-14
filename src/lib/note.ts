export interface Summary {
  summary: string;
  images: string[]; // If has `title`, then images[0] is cover.
}

export function generateSummaryFromMarkdown(markdown: string): Summary {
  let title = "",
    summary = "",
    images: string[] = [];
  markdown = markdown.replace(/^---([\w\W]+?\n---)/, "").trim(); // Remove front matter
  let contentString = markdown;

  const titleMatch = markdown.match(/^#\s.+$/gim);
  if (titleMatch && titleMatch.length) {
    title = titleMatch[0].replace(/^#/, "").trim();
  }

  const coverImagesMatch = markdown.match(/(?:^|\[)!\[.*?\]\(.+?\)/gim);
  if (coverImagesMatch && coverImagesMatch.length) {
    coverImagesMatch.forEach((mdImage) => {
      const match = mdImage.match(/\(([^)"]+?)\)/);
      if (match && match[1]) {
        images.push(match[1].trim());
      }
    });
    images = images
      .filter(
        (image, index, self) => index === self.findIndex((m) => m === image)
      )
      .slice(0, 9); // Get unique images and limit to 9
  }

  summary = title
    ? title
    : contentString
        .split("\n")
        .filter(
          (x) =>
            x.trim().length > 0 &&
            !x.match(/!\[.*?\]\(.+?\)/) && // Remove image
            !x.match(/<!--\s*@.+?-->/) // Remove widget
        )
        .map((x) => x.replace(/#+\s(.+)\s*$/, "$1").trim()) // Replace headers to normal
        .map((x) => x.replace(/\*\*(.+?)\*\*/g, "$1").trim()) // Remove bold
        .map((x) => x.replace(/\*(.+?)\*/g, "$1").trim()) // Remove italic
        .slice(0, 10)
        .join("\n");
  if (summary.length > 64) {
    summary = summary.slice(0, 64) + "..."; // Get first 10 lines and 64 characters
  }

  return {
    summary,
    images,
  };
}

/**
 * To lowercase, remove punctuations, and spaces. Support unicode.
 * @param tagName
 */
export function sanitizeTag(tagName: string) {
  return tagName
    .toLowerCase()
    .replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~，。【】『』（）“；：‘]/g,
      ""
    )
    .replace(/\s/g, "");
}
