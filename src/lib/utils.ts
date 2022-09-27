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
