import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI proxy endpoint
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, type, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({ fallback: true, message: 'API key not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Bạn là Trợ lý Giáo dục Thông minh cho giáo viên trong hệ thống SMART CLASS.
Nhiệm vụ: ${type}
Ngữ cảnh: ${JSON.stringify(context || {})}
Yêu cầu: ${prompt}

Hãy trả về phản hồi định dạng Markdown chi tiết, sư phạm, chuẩn mực tiếng Việt, rõ ràng.`,
      });

      return res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error('AI generation error:', error);
      return res.status(500).json({ error: error.message || 'AI generation failed' });
    }
  });

  // Extract text from Document (DOCX / PDF / TXT)
  app.post('/api/extract-doc', async (req, res) => {
    try {
      const { fileBase64, fileName } = req.body;
      if (!fileBase64) {
        return res.status(400).json({ success: false, error: 'Không nhận được dữ liệu tệp tin.' });
      }

      const cleanBase64 = fileBase64.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = (fileName || '').toLowerCase();

      let extractedText = '';

      if (ext.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } else if (ext.endsWith('.pdf')) {
        const result = await (pdfParse as any)(buffer);
        extractedText = result.text || '';
      } else if (ext.endsWith('.txt') || ext.endsWith('.csv')) {
        extractedText = buffer.toString('utf-8');
      } else {
        return res.status(400).json({
          success: false,
          error: `Định dạng tệp "${fileName}" chưa được hỗ trợ. Vui lòng tải lên tệp PDF, DOCX hoặc TXT.`
        });
      }

      const trimmed = extractedText.trim();
      if (!trimmed || trimmed.length < 20) {
        return res.status(400).json({
          success: false,
          error: 'Tệp tin không chứa đủ nội dung văn bản có thể đọc được (có thể là tệp rỗng hoặc PDF dạng quét scan).'
        });
      }

      const wordCount = trimmed.split(/\s+/).length;
      return res.json({
        success: true,
        text: trimmed.slice(0, 25000),
        charCount: trimmed.length,
        wordCount
      });
    } catch (err: any) {
      console.error('Doc extraction error:', err);
      return res.status(500).json({
        success: false,
        error: `Không thể trích xuất nội dung từ tệp: ${err.message || 'Lỗi xử lý tài liệu'}`
      });
    }
  });

  // Scrape and extract text from Web URL
  app.post('/api/scrape-url', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'Vui lòng cung cấp đường dẫn URL hợp lệ.' });
      }

      const trimmedUrl = url.trim();
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return res.status(400).json({ success: false, error: 'URL phải bắt đầu bằng http:// hoặc https://' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(trimmedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return res.status(400).json({
          success: false,
          error: `Không thể truy cập trang web (Mã phản hồi HTTP: ${response.status} ${response.statusText}). Hãy kiểm tra xem liên kết có yêu cầu đăng nhập hoặc chặn truy cập hay không.`
        });
      }

      const html = await response.text();

      // Extract page title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Strip scripts, styles, noscript, svg, navigation boilerplate
      let cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText || cleanText.length < 50) {
        return res.status(400).json({
          success: false,
          error: 'Trang web không có đủ nội dung văn bản (có thể trang dùng JavaScript render phía client).'
        });
      }

      const wordCount = cleanText.split(/\s+/).length;

      return res.json({
        success: true,
        title,
        text: cleanText.slice(0, 15000),
        wordCount,
        charCount: cleanText.length
      });
    } catch (err: any) {
      console.error('URL scraping error:', err);
      const isTimeout = err.name === 'AbortError';
      return res.status(400).json({
        success: false,
        error: isTimeout
          ? 'Quá thời gian kết nối tới trang web (Timeout 12s). Trang web phản hồi quá chậm.'
          : `Không thể kết nối tới trang web: ${err.message || 'Lỗi mạng hoặc địa chỉ không tồn tại.'}`
      });
    }
  });

  // AI question generation endpoint with Anti-Hallucination grounding & multimodal support
  app.post('/api/ai/generate-questions', async (req, res) => {
    try {
      const {
        topic = 'Kiểm tra tổng hợp',
        subject = 'Toán học',
        grade = 'Khối 6',
        count = 5,
        questionType = 'single',
        difficultyDist = { easy: 40, medium: 40, hard: 20, expert: 0 },
        sourceMethod = 'text',
        sourceText = '',
        sourceUrls = [],
        imageBase64,
        imageMimeType
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({ fallback: true, message: 'API key not configured' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là Trợ lý Giáo dục Thông minh chuyên gia soạn đề thi và ngân hàng câu hỏi theo chương trình Giáo dục Phổ thông mới (GDPT 2018).

NHIỆM VỤ: Soạn ${count} câu hỏi môn ${subject} (${grade}) về chủ đề: "${topic}".
DẠNG CÂU HỎI: ${questionType === 'single' ? 'Trắc nghiệm 1 đáp án đúng (A, B, C, D)' : questionType === 'multiple' ? 'Trắc nghiệm nhiều đáp án đúng' : questionType === 'true_false' ? 'Đúng/Sai' : questionType === 'fill_blank' ? 'Điền khuyết' : 'Hỗn hợp phù hợp'}

PHÂN BỔ MỨC ĐỘ NHẬN THỨC:
- Nhận biết (easy): ${difficultyDist.easy || 40}%
- Thông hiểu (medium): ${difficultyDist.medium || 40}%
- Vận dụng (hard): ${difficultyDist.hard || 20}%
- Vận dụng cao (expert): ${difficultyDist.expert || 0}%

PHƯƠNG THỨC ĐẦU VÀO ĐƯỢC CHỌN: "${sourceMethod}"
NGUỒN TÀI LIỆU CUNG CẤP (BẮT BUỘC BÁM SÁT ĐỂ CHỐNG HALLUCINATION):
${sourceText ? sourceText.slice(0, 15000) : 'Không có văn bản đính kèm, hãy quan sát kỹ hình ảnh được đính kèm hoặc nội dung liên kết để biên soạn câu hỏi.'}
${sourceUrls && sourceUrls.length > 0 ? 'Nguồn liên kết: ' + sourceUrls.join(', ') : ''}

NGUYÊN TẮC CHỐNG HALLUCINATION:
1. Câu hỏi và đáp án phải dựa trên sự thật khoa học, dữ liệu trong bài học/nguồn tài liệu hoặc hình ảnh thực tế được cung cấp.
2. Với các câu hỏi mà nguồn tài liệu không đề cập trực tiếp hoặc thiếu dữ kiện, gắn cờ "needsReview: true" và ghi rõ lý do trong explanation.
3. Không tự bịa đặt số liệu hoặc dẫn chứng sai lệch.

YÊU CẦU TRẢ VỀ:
Chỉ trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown \`\`\`json hoặc bất kỳ lời dẫn nào) với cấu trúc:
[
  {
    "question": "Nội dung câu hỏi rõ ràng, sư phạm",
    "type": "${questionType === 'mixed' ? 'single' : questionType}",
    "options": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "correctAnswer": "Phương án đúng chính xác",
    "explanation": "Giải thích chi tiết các bước giải hoặc căn cứ trích dẫn",
    "difficulty": "easy",
    "points": 1,
    "topic": "${topic}",
    "grade": "${grade}",
    "subject": "${subject}",
    "tags": ["Từ khóa 1", "Từ khóa 2"],
    "sourceType": "ai",
    "needsReview": false
  }
]`;

      let contentsPayload: any;
      if (sourceMethod === 'image' && imageBase64) {
        const cleanImg = imageBase64.replace(/^data:.*?;base64,/, '');
        contentsPayload = [
          prompt,
          {
            inlineData: {
              mimeType: imageMimeType || 'image/jpeg',
              data: cleanImg
            }
          }
        ];
      } else {
        contentsPayload = prompt;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsPayload,
      });

      let rawText = response.text || '';
      rawText = rawText.trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ success: true, questions: parsed });
        }
      } catch (jsonErr) {
        console.warn('Could not parse Gemini raw JSON, falling back:', jsonErr);
      }

      return res.json({ success: false, fallback: true, message: 'Invalid JSON format from AI' });
    } catch (error: any) {
      console.error('AI question generation error:', error);
      return res.status(500).json({ error: error.message || 'AI question generation failed' });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
