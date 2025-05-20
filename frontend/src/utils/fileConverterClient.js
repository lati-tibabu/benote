import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

export const convertFileToMarkdown = async (file) => {
  const fileExtension = file.name.split(".").pop().toLowerCase();

  let title = "Untitled Note";
  let content = "";

  try {
    if (fileExtension === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        content += pageText + "\n";
      }
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      content = result.value;
    } else if (fileExtension === "txt") {
      content = await file.text();
    } else {
      throw new Error("Unsupported file type.");
    }

    title = content.split("\n")[0] || title; // Use the first line as the title
    content = content.trim();

    return { title, content };
  } catch (error) {
    console.error("Error converting file:", error);
    throw new Error("Failed to convert file to Markdown.");
  }
};
