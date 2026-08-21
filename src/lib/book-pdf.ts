/** Printed CTS-5123V page → PDF file page. Cover/front matter is 5 PDF pages. */

export function printedToPdfPage(printed: string): number {
  const first = printed.split(/[–-]/)[0].trim();
  const n = parseInt(first.replace(/[A-Za-z]/g, ""), 10);
  if (!Number.isFinite(n) || n < 1) return 6;
  const letter = (first.match(/[A-Za-z]+/) || [""])[0].toUpperCase();
  let page = n + 5;
  if (n > 84 || (n === 84 && letter === "A")) page += 1;
  if (n > 85 || (n === 85 && letter === "A")) page += 1;
  return page;
}

export function firstPrintedPage(printed: string): string {
  return printed.split(/[–-]/)[0].trim();
}
