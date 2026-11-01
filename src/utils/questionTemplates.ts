import { QuizQuestion } from '../types';

/**
 * Standard CSV Template content with UTF-8 BOM for Excel compatibility
 */
export function getExcelTemplateContent(): string {
  const headers = [
    'Nội dung câu hỏi',
    'Môn học',
    'Khối lớp',
    'Chủ đề/Bài học',
    'Dạng câu hỏi (single/multiple/true_false/fill_blank)',
    'Mức độ (easy/medium/hard/expert)',
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D',
    'Đáp án đúng',
    'Lời giải chi tiết',
    'Điểm số',
    'Thẻ (cách nhau bởi dấu phẩy)'
  ];

  const sampleRows = [
    [
      'Tập hợp các ước tự nhiên của số 12 là:',
      'Toán học',
      'Khối 6',
      'Ước và bội',
      'single',
      'easy',
      '{1; 2; 3; 4; 6; 12}',
      '{1; 2; 3; 6; 12}',
      '{2; 3; 4; 6; 12}',
      '{0; 1; 2; 3; 4; 6; 12}',
      '{1; 2; 3; 4; 6; 12}',
      'Ước của 12 là các số tự nhiên mà 12 chia hết cho nó: 1, 2, 3, 4, 6, 12.',
      '1',
      'Số học, Ước và bội'
    ],
    [
      'Số nào sau đây là số nguyên tố?',
      'Toán học',
      'Khối 6',
      'Số nguyên tố',
      'single',
      'easy',
      '29',
      '33',
      '49',
      '51',
      '29',
      '29 chỉ có 2 ước tự nhiên là 1 và 29 nên là số nguyên tố.',
      '1',
      'Số nguyên tố, Số học'
    ],
    [
      'Mọi số nguyên tố đều là số lẻ.',
      'Toán học',
      'Khối 6',
      'Số nguyên tố',
      'true_false',
      'medium',
      'Đúng',
      'Sai',
      '',
      '',
      'Sai',
      'Số 2 là số nguyên tố chẵn duy nhất.',
      '1',
      'Lý thuyết, Số nguyên tố'
    ],
    [
      'Tam giác đều có ba cạnh bằng nhau và ba góc bằng ... độ.',
      'Toán học',
      'Khối 6',
      'Hình học trực quan',
      'fill_blank',
      'medium',
      '',
      '',
      '',
      '',
      '60',
      'Tam giác đều có 3 góc bằng nhau, mỗi góc bằng 180 / 3 = 60 độ.',
      '1',
      'Hình học, Tam giác đều'
    ]
  ];

  const escapeCSV = (val: string) => `"${String(val).replace(/"/g, '""')}"`;

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...sampleRows.map(row => row.map(escapeCSV).join(','))
  ];

  // Prepend UTF-8 BOM \uFEFF so Excel displays Vietnamese correctly
  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Standard Word (.doc / text) Template content
 */
export function getWordTemplateContent(): string {
  return `MẪU SOẠN THẢO CÂU HỎI THI / NGÂN HÀNG CÂU HỎI (CHUẨN GDPT 2018)
============================================================
Hướng dẫn:
- Mỗi câu hỏi bắt đầu bằng "Câu [số]: [Nội dung câu hỏi]"
- Môn học: [Tên môn], Khối: [Khối lớp], Mức độ: [Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao]
- Các phương án trắc nghiệm: A. [Phương án] / B. [Phương án] / C. [Phương án] / D. [Phương án]
- Đáp án: [Phương án đúng] (VD: Đáp án: A hoặc Đáp án: 29)
- Lời giải: [Nội dung giải thích chi tiết]
============================================================

Câu 1: Tập hợp các ước tự nhiên của số 12 là:
[Môn: Toán học | Khối: Khối 6 | Mức độ: Nhận biết | Chủ đề: Ước và bội]
A. {1; 2; 3; 4; 6; 12}
B. {1; 2; 3; 6; 12}
C. {2; 3; 4; 6; 12}
D. {0; 1; 2; 3; 4; 6; 12}
Đáp án: A
Lời giải: Ước của 12 là các số tự nhiên mà 12 chia hết cho nó: 1, 2, 3, 4, 6, 12.

Câu 2: Số nào sau đây là số nguyên tố?
[Môn: Toán học | Khối: Khối 6 | Mức độ: Nhận biết | Chủ đề: Số nguyên tố]
A. 29
B. 33
C. 49
D. 51
Đáp án: A
Lời giải: 29 chỉ có 2 ước tự nhiên là 1 và 29 nên là số nguyên tố. 33 chia hết cho 3, 49 chia hết cho 7, 51 chia hết cho 3.

Câu 3: Mọi số nguyên tố đều là số lẻ.
[Môn: Toán học | Khối: Khối 6 | Mức độ: Thông hiểu | Dạng: Đúng/Sai]
A. Đúng
B. Sai
Đáp án: B
Lời giải: Số 2 là số nguyên tố chẵn duy nhất.

Câu 4: Tam giác đều có ba cạnh bằng nhau và ba góc bằng ... độ.
[Môn: Toán học | Khối: Khối 6 | Mức độ: Thông hiểu | Dạng: Điền khuyết]
Đáp án: 60
Lời giải: Tam giác đều có ba góc bằng nhau, mỗi góc bằng 180 / 3 = 60 độ.
`;
}

/**
 * Triggers browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ParsedQuestionItem {
  index: number;
  question: string;
  type: 'single' | 'multiple' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';
  options: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  grade: string;
  subject: string;
  topic?: string;
  points: number;
  tags: string[];
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
}

/**
 * Parses CSV lines handling quotes and UTF-8
 */
export function parseCSV(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Map difficulty string to standard difficulty
 */
export function normalizeDifficulty(diff: string): 'easy' | 'medium' | 'hard' | 'expert' {
  const d = (diff || '').toLowerCase().trim();
  if (d.includes('nhận biết') || d === 'easy' || d === 'de' || d === 'dễ') return 'easy';
  if (d.includes('thông hiểu') || d === 'medium' || d === 'vua' || d === 'vừa') return 'medium';
  if (d.includes('vận dụng cao') || d === 'expert' || d === 'rat_kho' || d === 'rất khó') return 'expert';
  if (d.includes('vận dụng') || d === 'hard' || d === 'kho' || d === 'khó') return 'hard';
  return 'medium';
}

/**
 * Parse text or docx-like format for Vietnamese exam standard
 */
export function parseWordQuestionText(text: string): ParsedQuestionItem[] {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // Match questions starting with "Câu 1:", "Câu 2.", "Bài 1:" etc.
  const questionBlocks = cleanText.split(/(?=\n?Câu\s+\d+[\s:.-]|\n?Bài\s+\d+[\s:.-])/i).filter(b => b.trim());

  const parsedItems: ParsedQuestionItem[] = [];

  questionBlocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Header line: e.g. "Câu 1: Nội dung câu hỏi"
    let headerLine = lines[0];
    let questionText = headerLine.replace(/^(Câu|Bài)\s+\d+[\s:.-]+/i, '').trim();

    // Check if next lines are still question content before options
    let lineIdx = 1;
    let subject = 'Toán học';
    let grade = 'Khối 6';
    let topic = 'Chương trình chuẩn';
    let difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium';
    let type: 'single' | 'multiple' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay' = 'single';

    // Metadata bracket check e.g. [Môn: Toán học | Khối: 6 | Mức độ: Nhận biết]
    if (lines[lineIdx] && lines[lineIdx].startsWith('[') && lines[lineIdx].endsWith(']')) {
      const meta = lines[lineIdx].slice(1, -1);
      const parts = meta.split('|').map(p => p.trim());
      parts.forEach(p => {
        const [k, v] = p.split(/[:=]/).map(s => s?.trim());
        if (!k || !v) return;
        if (/môn/i.test(k)) subject = v;
        if (/khối/i.test(k)) grade = v.startsWith('Khối') ? v : `Khối ${v}`;
        if (/mức độ/i.test(k) || /độ khó/i.test(k)) difficulty = normalizeDifficulty(v);
        if (/chủ đề/i.test(k) || /bài/i.test(k)) topic = v;
        if (/dạng/i.test(k)) {
          if (/đúng.*sai/i.test(v)) type = 'true_false';
          if (/điền/i.test(v)) type = 'fill_blank';
          if (/nhiều/i.test(v)) type = 'multiple';
        }
      });
      lineIdx++;
    }

    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (let i = lineIdx; i < lines.length; i++) {
      const line = lines[i];
      // Options A. B. C. D.
      const optMatch = line.match(/^([A-D])[\s.)-]+(.*)$/i);
      if (optMatch) {
        options.push(optMatch[2].trim());
        continue;
      }

      // Đáp án: A hoặc Đáp án đúng: ...
      const ansMatch = line.match(/^(Đáp\s*án|Key|Answer)[\s:.-]+(.*)$/i);
      if (ansMatch) {
        const rawAns = ansMatch[2].trim();
        if (/^[A-D]$/i.test(rawAns)) {
          const letterIdx = rawAns.toUpperCase().charCodeAt(0) - 65;
          correctAnswer = options[letterIdx] || rawAns;
        } else {
          correctAnswer = rawAns;
        }
        continue;
      }

      // Lời giải: ...
      const expMatch = line.match(/^(Lời\s*giải|Giải\s*thích|Explanation)[\s:.-]+(.*)$/i);
      if (expMatch) {
        explanation = expMatch[2].trim();
        continue;
      }

      // If we don't have options yet, append to questionText
      if (options.length === 0 && !correctAnswer) {
        questionText += '\n' + line;
      } else if (explanation) {
        explanation += ' ' + line;
      }
    }

    // Auto determine type
    if (options.length === 2 && options.some(o => /đúng/i.test(o)) && options.some(o => /sai/i.test(o))) {
      type = 'true_false';
    } else if (options.length === 0 && correctAnswer) {
      type = 'fill_blank';
    }

    // Validation
    const errors: string[] = [];
    if (!questionText.trim()) errors.push('Thiếu nội dung câu hỏi');
    if (type === 'single' && options.length < 2) errors.push('Trắc nghiệm cần ít nhất 2 phương án lựa chọn');
    if (!correctAnswer) errors.push('Thiếu đáp án đúng');

    parsedItems.push({
      index: index + 1,
      question: questionText.trim(),
      type,
      options,
      correctAnswer: correctAnswer || options[0] || 'A',
      explanation: explanation.trim(),
      difficulty,
      grade,
      subject,
      topic,
      points: 1,
      tags: [subject, topic].filter(Boolean),
      isValid: errors.length === 0,
      errors,
      isDuplicate: false
    });
  });

  return parsedItems;
}

/**
 * Parses CSV table rows into ParsedQuestionItem array
 */
export function parseCSVQuestions(csvText: string): ParsedQuestionItem[] {
  const rows = parseCSV(csvText);
  if (rows.length <= 1) return [];

  // Skip header if first row has header keywords
  const firstRow = rows[0].join(' ').toLowerCase();
  const dataRows = firstRow.includes('câu hỏi') || firstRow.includes('question') ? rows.slice(1) : rows;

  return dataRows.map((row, idx) => {
    const questionText = row[0] || '';
    const subject = row[1] || 'Toán học';
    const grade = row[2] || 'Khối 6';
    const topic = row[3] || 'Chung';
    const typeStr = (row[4] || 'single').toLowerCase();
    const type = (['single', 'multiple', 'true_false', 'fill_blank', 'short_answer', 'essay'].includes(typeStr)
      ? typeStr
      : 'single') as any;
    const difficulty = normalizeDifficulty(row[5] || 'medium');

    const optA = row[6] || '';
    const optB = row[7] || '';
    const optC = row[8] || '';
    const optD = row[9] || '';
    const rawOptions = [optA, optB, optC, optD].filter(Boolean);

    let rawCorrect = row[10] || '';
    if (rawCorrect === 'A' && optA) rawCorrect = optA;
    if (rawCorrect === 'B' && optB) rawCorrect = optB;
    if (rawCorrect === 'C' && optC) rawCorrect = optC;
    if (rawCorrect === 'D' && optD) rawCorrect = optD;

    const explanation = row[11] || '';
    const points = Number(row[12]) || 1;
    const tags = row[13] ? row[13].split(',').map(t => t.trim()) : [subject, topic];

    const errors: string[] = [];
    if (!questionText.trim()) errors.push('Thiếu nội dung câu hỏi');
    if (type === 'single' && rawOptions.length < 2) errors.push('Cần ít nhất 2 phương án lựa chọn');
    if (!rawCorrect) errors.push('Thiếu đáp án đúng');

    return {
      index: idx + 1,
      question: questionText.trim(),
      type,
      options: rawOptions,
      correctAnswer: rawCorrect,
      explanation: explanation.trim(),
      difficulty,
      grade,
      subject,
      topic,
      points,
      tags,
      isValid: errors.length === 0,
      errors,
      isDuplicate: false
    };
  });
}

/**
 * Checks for duplicates between parsed items and existing question bank
 */
export function detectDuplicates(
  parsed: ParsedQuestionItem[],
  existingQuestions: QuizQuestion[]
): ParsedQuestionItem[] {
  const existingSet = new Set(
    existingQuestions.map(q => q.question.toLowerCase().trim().replace(/[^\p{L}\p{N}]/gu, ''))
  );

  const seenInBatch = new Set<string>();

  return parsed.map(item => {
    const normalized = item.question.toLowerCase().trim().replace(/[^\p{L}\p{N}]/gu, '');
    let isDuplicate = false;
    let duplicateReason = '';

    if (existingSet.has(normalized)) {
      isDuplicate = true;
      duplicateReason = 'Trùng với câu hỏi đã có sẵn trong ngân hàng';
    } else if (seenInBatch.has(normalized)) {
      isDuplicate = true;
      duplicateReason = 'Trùng lặp với câu hỏi khác ngay trong tệp tải lên';
    }

    seenInBatch.add(normalized);

    return {
      ...item,
      isDuplicate,
      duplicateReason: isDuplicate ? duplicateReason : undefined
    };
  });
}
