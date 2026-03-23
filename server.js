const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Simulate AI detection analysis
function analyzeFile(file) {
  const isVideo = file.mimetype.startsWith('video/');
  const fileSizeKB = file.size / 1024;
  
  // Simulate detection indicators
  const indicators = [];
  let score = 0;

  // Random but deterministic-ish scoring based on file properties
  const seed = (file.size + file.originalname.length) % 100;
  const baseScore = (seed / 100) * 4 + Math.random() * 6; // 0-10
  score = Math.min(10, Math.max(0.5, baseScore));

  // Generate plausible indicators based on score
  if (score > 7) {
    indicators.push({ type: 'high', label: 'Unnatural texture patterns detected', confidence: Math.round(85 + Math.random() * 12) });
    indicators.push({ type: 'high', label: 'GAN fingerprint artifacts found', confidence: Math.round(78 + Math.random() * 15) });
    if (isVideo) {
      indicators.push({ type: 'high', label: 'Temporal inconsistencies in frames', confidence: Math.round(80 + Math.random() * 10) });
      indicators.push({ type: 'medium', label: 'Unnatural facial movement patterns', confidence: Math.round(70 + Math.random() * 15) });
    }
    indicators.push({ type: 'medium', label: 'Metadata anomalies detected', confidence: Math.round(65 + Math.random() * 20) });
  } else if (score > 4) {
    indicators.push({ type: 'medium', label: 'Minor texture irregularities found', confidence: Math.round(55 + Math.random() * 20) });
    indicators.push({ type: 'medium', label: 'Possible upscaling artifacts', confidence: Math.round(50 + Math.random() * 25) });
    if (isVideo) {
      indicators.push({ type: 'low', label: 'Slight frame blending anomalies', confidence: Math.round(40 + Math.random() * 20) });
    }
    indicators.push({ type: 'low', label: 'Compression pattern inconsistency', confidence: Math.round(35 + Math.random() * 25) });
  } else {
    indicators.push({ type: 'low', label: 'Natural noise distribution detected', confidence: Math.round(20 + Math.random() * 20) });
    indicators.push({ type: 'low', label: 'Authentic metadata structure', confidence: Math.round(15 + Math.random() * 20) });
  }

  const roundedScore = Math.round(score * 10) / 10;
  
  let verdict = '';
  let verdictClass = '';
  if (roundedScore >= 7) {
    verdict = 'Likely AI-Generated';
    verdictClass = 'danger';
  } else if (roundedScore >= 4) {
    verdict = 'Possibly AI-Assisted';
    verdictClass = 'warning';
  } else {
    verdict = 'Likely Authentic';
    verdictClass = 'safe';
  }

  const models = isVideo
    ? ['Sora', 'Runway Gen-3', 'Pika Labs', 'Stable Video Diffusion', 'Kling AI']
    : ['Midjourney', 'DALL·E 3', 'Stable Diffusion XL', 'Firefly', 'Imagen 3'];

  const topModel = score > 5 ? models[Math.floor(Math.random() * models.length)] : null;

  return {
    score: roundedScore,
    verdict,
    verdictClass,
    indicators,
    topModel,
    isVideo,
    analysisTime: Math.round(800 + Math.random() * 1200),
    fileInfo: {
      name: file.originalname,
      size: fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(2)} MB` : `${fileSizeKB.toFixed(1)} KB`,
      type: file.mimetype
    }
  };
}

// Analysis endpoint
app.post('/api/analyze', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const result = analyzeFile(req.file);
    
    // Clean up uploaded file
    fs.unlink(req.file.path, () => {});
    
    // Simulate processing delay
    setTimeout(() => {
      res.json({ success: true, result });
    }, result.analysisTime);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Shield AI Backend running on port ${PORT}`);
});
