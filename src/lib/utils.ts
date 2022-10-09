class RandomColorGenerator {
  private cache: { [key: string]: string } = {};

  hashCode(s: string) {
    let n = s.split("").reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    n = Math.abs(n);
    const x = "0." + n.toString();
    return parseFloat(x);
  }
  generateColor(key: string) {
    if (key in this.cache) {
      return this.cache[key];
    } else {
      const color =
        "#" +
        (((1 << 24) * /* Math.random() */ this.hashCode(key)) | 0).toString(16);
      this.cache[key] = color;
      return color;
    }
  }
}

export const randomColorGenerator = new RandomColorGenerator();

export function generateForegroundColorBasedOnBackgroundColor(bgColor: string) {
  const color = parseInt(bgColor.replace("#", ""), 16);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 40 ? "#ffffff" : "#000000";
}
