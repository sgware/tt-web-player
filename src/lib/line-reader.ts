export function createLineReader(
  onLine: (line: string) => void,
): (data: string | ArrayBuffer) => void {
  const decoder = new TextDecoder();
  let partial = "";

  return (data) => {
    const text =
      typeof data === "string" ? data : decoder.decode(data, { stream: true });

    let start = 0;
    let newline = text.indexOf("\n");
    while (newline >= 0) {
      const line = partial + text.slice(start, newline);
      partial = "";
      if (line.trim()) onLine(line);
      start = newline + 1;
      newline = text.indexOf("\n", start);
    }
    partial += text.slice(start);
  };
}
