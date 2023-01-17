const pdfKit = require('pdfkit');
const fs = require('fs');

function createPdf() {
try {
let fontNormal = 'Helvetica';
let fontBold = 'Helvetica-Bold'
let pdfDoc = new pdfKit();
// let fileName = './files/sample.pdf';
let fileName = './home/administrator/Downloads/Aug_2021..pdf'
let image1 = './home/administrator/Pictures/download (3).jpeg';
let image2 = './home/administrator/Pictures/images.jpeg';
// let image2 = './images/image2.jpg';
let sampleText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
let stream = fs.createWriteStream(fileName);
pdfDoc.pipe(stream);
pdfDoc.text("Node.js PDF document creation with PDFKit library", 5, 5);
pdfDoc.rect(5, 20, 550, 100).stroke("#ff0000");
pdfDoc.text(sampleText, 10, 22);
pdfDoc.font(fontBold).text("This is awesome toolkit", 5, 140);
pdfDoc.stroke("#000").font(fontNormal).text("Name: ThunderMan101", 5, 155, { underline: true });
pdfDoc.addPage();
pdfDoc.text("Node.js PDF document creation with PDFKit library", 5, 5);
pdfDoc.image(image1, 50, 20, { width: 150, height: 150, align: "center" });
pdfDoc.image(image2, 250, 20, { width: 150, height: 150, align: "center" });

pdfDoc.fontSize(20).fillColor('red').text('ParallelCodes', 50, 300, {
link: 'https://parallelcodes.com/',
underline: true
}
);
pdfDoc.end();
console.log("pdf generate successfully");
} catch (error) {
console.log("Error occurred", error);
}
}

createPdf();