import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
// Exclusões explícitas e mínimas (arquivo relativo -> motivo). Hoje nenhuma.
const EXCLUDED: string[] = [];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

/** Remove comentários de bloco e de linha (heurística simples; não toca em "//" dentro de URLs). */
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

const FORBIDDEN = [/\bfetch\s*\(/, /\baxios\b/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /https?:\/\//];

describe("guarda offline: sem uso de rede em src/ e app/", () => {
  const files = [...walk(path.join(ROOT, "src")), ...walk(path.join(ROOT, "app"))].filter(
    (f) => !EXCLUDED.includes(path.relative(ROOT, f).replace(/\\/g, "/")),
  );

  it("encontra arquivos para varrer", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN.map((r) => [String(r), r] as const))("nenhum arquivo casa %s", (_name, regex) => {
    const offenders = files
      .filter((f) => regex.test(stripComments(fs.readFileSync(f, "utf8"))))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });
});
