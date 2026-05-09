import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class FileExtractor {
  static async extractText(filePath, mimeType) {
    try {
      switch (mimeType) {
        case 'text/plain':
          return await this.extractFromTxt(filePath);
        case 'application/pdf':
          return await this.extractFromPdf(filePath);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(filePath);
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text: ${error.message}`);
    }
  }

  static async extractFromTxt(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf8');
      return text;
    } catch (error) {
      throw new Error(`Failed to read text file: ${error.message}`);
    }
  }

  static async extractFromPdf(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF file: ${error.message}`);
    }
  }

  static async extractFromDocx(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to parse DOCX file: ${error.message}`);
    }
  }

  static getSupportedMimeTypes() {
    return [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  static isSupported(mimeType) {
    return this.getSupportedMimeTypes().includes(mimeType);
  }
}
