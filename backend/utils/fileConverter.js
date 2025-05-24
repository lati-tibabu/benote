const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");

const convertFileToMarkdown = async (filePath) => {
  const fileExtension = filePath.split(".").pop().toLowerCase();

  let title = "Untitled Note";
  let content = "";

  try {
    if (fileExtension === "pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else if (fileExtension === "txt") {
      content = fs.readFileSync(filePath, "utf-8");
    } else {
      content = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (error, text) => {
          if (error) reject(error);
          resolve(text);
        });
      });
    }

    title = content.split("\n")[0] || title; // Use the first line as the title
    content = content.trim();

    return { title, content };
  } catch (error) {
    console.error("Error converting file:", error);
    throw new Error("Failed to convert file to Markdown.");
  }
};

module.exports = { convertFileToMarkdown };
