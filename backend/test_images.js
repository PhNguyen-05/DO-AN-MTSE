const { PDFParse } = require('pdf-parse');
const fs = require('fs/promises');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');

async function test() {
  const files = await fs.readdir(uploadDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  if (!pdfFiles.length) {
    console.log('No PDFs found.');
    process.exit(0);
  }

  const pdfPath = path.join(uploadDir, pdfFiles[pdfFiles.length - 1]); // last uploaded PDF
  console.log('Testing PDF:', pdfPath);

  const buffer = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getImage({
      imageBuffer: true,
      imageDataUrl: false,
      imageThreshold: 120
    });
    console.log('Images page count:', result?.pages?.length || 0);
    let totalImages = 0;
    for (const page of result?.pages || []) {
      console.log(`Page ${page.pageNumber} has ${page.images?.length || 0} images`);
      totalImages += page.images?.length || 0;
      for (let i = 0; i < (page.images?.length || 0); i++) {
        const img = page.images[i];
        console.log(`  Image ${i + 1}: width=${img.width}, height=${img.height}, dataLength=${img.data ? img.data.length : 0}`);
      }
    }
    console.log('Total images found:', totalImages);
  } catch (err) {
    console.error('Error during getImage:', err);
  } finally {
    await parser.destroy();
  }

  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
