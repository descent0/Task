const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

class PDFService {
  constructor() {
    this.defaultMargin = 50
    this.pageWidth = 595.28 // A4 width
    this.pageHeight = 841.89 // A4 height
  }

  async generateArticlePDF(article, outputPath = null) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: this.defaultMargin,
          size: 'A4',
          info: {
            Title: article.title,
            Author: article.createdBy?.name || 'Unknown Author',
            Subject: 'Article Export from ArticleHub',
            Creator: 'ArticleHub MERN Application',
            CreationDate: new Date()
          }
        })

        const chunks = []
        
        // Collect PDF data
        doc.on('data', chunk => chunks.push(chunk))
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks)
          
          if (outputPath) {
            fs.writeFileSync(outputPath, pdfBuffer)
            resolve({ buffer: pdfBuffer, filePath: outputPath })
          } else {
            resolve({ buffer: pdfBuffer })
          }
        })

        doc.on('error', reject)

        // Add content to PDF
        this.addHeader(doc, article)
        this.addMetadata(doc, article)
        this.addContent(doc, article)
        this.addFooter(doc, article)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  addHeader(doc, article) {
    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(article.title, { align: 'left', width: 500 })
    
    doc.moveDown(0.5)
    
    // Underline
    doc.strokeColor('#3b82f6')
       .lineWidth(2)
       .moveTo(this.defaultMargin, doc.y)
       .lineTo(this.pageWidth - this.defaultMargin, doc.y)
       .stroke()
    
    doc.moveDown(1)
  }

  addMetadata(doc, article) {
    const metadata = [
      { label: 'Author', value: article.createdBy?.name || 'Unknown Author' },
      { label: 'Email', value: article.createdBy?.email || 'N/A' },
      { label: 'Created', value: new Date(article.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })},
      { label: 'Last Updated', value: new Date(article.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })},
      { label: 'Views', value: article.viewCount?.toString() || '0' }
    ]

    // Metadata box background
    doc.rect(this.defaultMargin, doc.y, this.pageWidth - 2 * this.defaultMargin, 120)
       .fillAndStroke('#f8fafc', '#e2e8f0')
    
    doc.moveDown(0.5)
    
    // Metadata content
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#4b5563')

    metadata.forEach((item, index) => {
      const x = this.defaultMargin + 20
      const y = doc.y + (index * 18)
      
      doc.font('Helvetica-Bold')
         .text(`${item.label}:`, x, y, { width: 80 })
         .font('Helvetica')
         .text(item.value, x + 85, y, { width: 350 })
    })

    doc.y += metadata.length * 18 + 10

    // Tags
    if (article.tags && article.tags.length > 0) {
      doc.font('Helvetica-Bold')
         .text('Tags:', this.defaultMargin + 20, doc.y)
      
      let tagY = doc.y
      article.tags.forEach((tag, index) => {
        const tagText = `#${tag}`
        const tagWidth = doc.widthOfString(tagText) + 16
        
        // Check if tag fits on current line
        if (doc.x + tagWidth > this.pageWidth - this.defaultMargin) {
          doc.x = this.defaultMargin + 70
          tagY += 20
        }
        
        doc.rect(doc.x, tagY - 2, tagWidth, 16)
           .fillAndStroke('#dbeafe', '#3b82f6')
           .fillColor('#1e40af')
           .font('Helvetica')
           .fontSize(9)
           .text(tagText, doc.x + 8, tagY + 2)
        
        doc.x += tagWidth + 8
      })
      
      doc.y = tagY + 20
    }

    doc.moveDown(1)
  }

  addContent(doc, article) {
    // Summary section (if available)
    if (article.summary) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Summary', { align: 'left' })
      
      doc.moveDown(0.3)
      
      doc.rect(this.defaultMargin, doc.y, this.pageWidth - 2 * this.defaultMargin, 2)
         .fill('#fbbf24')
      
      doc.moveDown(0.5)
      
      doc.fontSize(11)
         .font('Helvetica-Oblique')
         .fillColor('#374151')
         .text(article.summary, { align: 'justify', lineGap: 4 })
      
      doc.moveDown(1)
    }

    // Main content section
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Content', { align: 'left' })
    
    doc.moveDown(0.3)
    
    doc.rect(this.defaultMargin, doc.y, this.pageWidth - 2 * this.defaultMargin, 2)
       .fill('#3b82f6')
    
    doc.moveDown(0.8)

    // Process content (basic Markdown to PDF conversion)
    this.processMarkdownContent(doc, article.content)
  }

  processMarkdownContent(doc, content) {
    const lines = content.split('\n')
    
    lines.forEach(line => {
      line = line.trim()
      
      // Skip empty lines
      if (!line) {
        doc.moveDown(0.3)
        return
      }

      // Headers
      if (line.startsWith('### ')) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text(line.substring(4), { lineGap: 6 })
        doc.moveDown(0.3)
      } else if (line.startsWith('## ')) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text(line.substring(3), { lineGap: 6 })
        doc.moveDown(0.4)
      } else if (line.startsWith('# ')) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#1f2937')
           .text(line.substring(2), { lineGap: 8 })
        doc.moveDown(0.5)
      }
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#4b5563')
           .text(`• ${line.substring(2)}`, { 
             indent: 20,
             lineGap: 3,
             align: 'justify'
           })
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s/)) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#4b5563')
           .text(line, { 
             indent: 20,
             lineGap: 3,
             align: 'justify'
           })
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        doc.fontSize(10)
           .font('Helvetica-Oblique')
           .fillColor('#6b7280')
           .text(line.substring(2), { 
             indent: 30,
             lineGap: 3,
             align: 'justify'
           })
      }
      // Bold text (basic **text** support)
      else if (line.includes('**')) {
        this.processBoldText(doc, line)
      }
      // Regular paragraphs
      else {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#374151')
           .text(line, { 
             align: 'justify',
             lineGap: 4
           })
        doc.moveDown(0.2)
      }
    })
  }

  processBoldText(doc, text) {
    // Simple bold text processing
    const parts = text.split('**')
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        doc.font('Helvetica')
           .fontSize(10)
           .fillColor('#374151')
           .text(parts[i], { continued: i < parts.length - 1 })
      } else {
        // Bold text
        doc.font('Helvetica-Bold')
           .text(parts[i], { continued: i < parts.length - 1 })
      }
    }
    
    doc.moveDown(0.2)
  }

  addFooter(doc, article) {
    const pages = doc.bufferedPageRange()
    
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i)
      
      // Footer line
      doc.strokeColor('#e5e7eb')
         .lineWidth(1)
         .moveTo(this.defaultMargin, this.pageHeight - 60)
         .lineTo(this.pageWidth - this.defaultMargin, this.pageHeight - 60)
         .stroke()
      
      // Footer text
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text(
           `Generated by ArticleHub | ${new Date().toLocaleDateString()}`,
           this.defaultMargin,
           this.pageHeight - 45,
           { align: 'left' }
         )
         .text(
           `Page ${i + 1} of ${pages.count}`,
           this.defaultMargin,
           this.pageHeight - 45,
           { align: 'right' }
         )
    }
  }

  // Generate filename for PDF
  generateFilename(article) {
    const title = article.title
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 50)
    
    const date = new Date().toISOString().split('T')[0]
    return `article_${title}_${date}.pdf`
  }
}

module.exports = new PDFService()