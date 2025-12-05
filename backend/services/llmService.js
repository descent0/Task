const { GoogleGenerativeAI } = require('@google/generative-ai')

class LLMService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables')
    }

    console.log('🔑 Gemini API Key found, initializing...')
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // **Updated valid models - try multiple options**
    this.modelNames = [
      'gemini-pro',           // most common stable model
      'models/gemini-pro',    // full path format
      'gemini-1.0-pro',       // older version
      'text-bison-001'        // fallback text model
    ]

    this.currentModel = null
    this.currentModelName = null
  }

  // -------- PUBLIC METHOD --------
  async summarize(content) {
    const clean = this.validateContent(content)
    
    try {
      return await this.summarizeWithGemini(clean)
    } catch (error) {
      console.log('🔄 Gemini failed, using fallback summarization...')
      return this.fallbackSummarize(clean)
    }
  }

  // -------- DETECT WORKING GEMINI MODEL --------
  async getWorkingModel() {
    if (this.currentModel) return this.currentModel

    console.log('🔍 Searching for available Gemini models...')
    
    for (const modelName of this.modelNames) {
      try {
        console.log(`🧪 Testing model: ${modelName}`)
        const model = this.genAI.getGenerativeModel({ model: modelName })

        // Simple test to check if model works
        const test = await model.generateContent("Say OK")
        const response = await test.response
        const text = response.text()

        if (text && text.trim()) {
          console.log(`✅ Model ${modelName} works! Response: ${text.trim()}`)
          this.currentModel = model
          this.currentModelName = modelName
          return model
        }

      } catch (err) {
        console.log(`❌ Model ${modelName} failed:`, err.message)
        
        // Log additional error details for debugging
        if (err.status) {
          console.log(`   Status: ${err.status}`)
        }
        if (err.response?.data) {
          console.log(`   Response data:`, err.response.data)
        }
      }
    }

    throw new Error("No working Gemini models found. Check your API key, model names, or quotas.")
  }

  // -------- SUMMARIZATION LOGIC --------
  async summarizeWithGemini(content) {
    try {
      const model = await this.getWorkingModel()
      const prompt = this.buildSummarizationPrompt(content)

      const result = await model.generateContent(prompt)
      const response = await result.response
      const summary = response.text()?.trim()

      if (!summary) throw new Error("Summary returned empty")

      return {
        summary,
        provider: 'gemini',
        model: this.currentModelName,
        wordCount: this.countWords(summary)
      }

    } catch (error) {
      console.error("Gemini summarization error:", error)

      if (error.message?.includes("API_KEY_INVALID")) {
        throw new Error("Invalid Gemini API key")
      }

      if (error.message?.includes("QUOTA_EXCEEDED")) {
        throw new Error("Gemini quota exceeded. Try again later.")
      }

      throw new Error(`Gemini summarization failed: ${error.message}`)
    }
  }

  // -------- PROMPT BUILDER --------
  buildSummarizationPrompt(content) {
    const wc = this.countWords(content)
    const target = Math.max(50, Math.min(200, Math.floor(wc * 0.2)))

    return `
Summarize the following article:

Requirements:
- Length approx ${target} words
- Capture key ideas
- Preserve meaning & tone
- Professional and clear

Article:
${content}

Summary:
`
  }

  // -------- UTILITIES --------
  countWords(text) {
    return text.trim().split(/\s+/).length
  }

  validateContent(content) {
    if (!content || typeof content !== "string")
      throw new Error("Content must be a non-empty string")

    const trimmed = content.trim()

    return trimmed
  }

  // -------- FALLBACK SUMMARIZATION --------
  fallbackSummarize(content) {
    console.log('📝 Using fallback text summarization...')
    
    // Simple extractive summarization
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    const wordCount = this.countWords(content)
    const targetSentences = Math.max(2, Math.min(5, Math.floor(sentences.length * 0.3)))
    
    // Take first few sentences and some from middle/end
    const summary = sentences
      .slice(0, Math.ceil(targetSentences / 2))
      .concat(sentences.slice(-Math.floor(targetSentences / 2)))
      .join('. ')
      .trim() + '.'
    
    return {
      summary,
      provider: 'fallback',
      model: 'extractive-text',
      wordCount: this.countWords(summary)
    }
  }

  // Optional: for API testing route
  async testConnection() {
    try {
      const sample = "This is a test article for Gemini summarization."

      const result = await this.summarizeWithGemini(sample)
      return {
        success: true,
        provider: "gemini",
        model: result.model,
        summaryPreview: result.summary.slice(0, 150) + "..."
      }

    } catch (error) {
      return {
        success: false,
        provider: "gemini",
        message: error.message
      }
    }
  }
}

module.exports = new LLMService()
