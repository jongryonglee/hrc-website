/**
 * public/images の PNG を WebP に変換し、横幅が大きいものはリサイズする。
 * favicon.png は 32×32 の PNG に縮小して置き換える。
 * 再実行: node scripts/optimize-static-images.cjs
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
/** グリッド・ヒーロー用途に十分な解像度（4K スクリーンショット等を抑える） */
const MAX_WIDTH = 900;

async function processPng(inputPath) {
  const outPath = inputPath.replace(/\.png$/i, ".webp");
  const img = sharp(inputPath);
  const meta = await img.metadata();
  let pipeline = img;
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }
  await pipeline
    .webp({ quality: 85, effort: 6, alphaQuality: 90 })
    .toFile(outPath);
  const before = fs.statSync(inputPath).size;
  const after = fs.statSync(outPath).size;
  fs.unlinkSync(inputPath);
  console.log(
    path.basename(inputPath),
    "→",
    path.basename(outPath),
    `${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  );
}

async function optimizeFavicon() {
  const faviconPath = path.join(ROOT, "public", "favicon.png");
  const before = fs.statSync(faviconPath).size;
  if (before < 15 * 1024) {
    console.log("favicon.png は既に軽量のためスキップ");
    return;
  }
  const tmp = path.join(ROOT, "public", "favicon.optimized.png");
  await sharp(faviconPath)
    .resize(32, 32, { fit: "cover", position: "centre" })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, faviconPath);
  const after = fs.statSync(faviconPath).size;
  console.log(
    "favicon.png",
    `${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB (32×32)`,
  );
}

async function main() {
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".png"));
  if (files.length === 0) {
    console.log(
      "public/images に PNG がありません（既に WebP 変換済みの可能性）。画像変換はスキップします。",
    );
  } else {
    for (const f of files) {
      await processPng(path.join(IMAGES_DIR, f));
    }
  }
  await optimizeFavicon();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
