const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(file.mimetype)) {
            return callback(new Error('Choose a JPG, PNG, WebP, or HEIC image'));
        }
        return callback(null, true);
    }
});

const parseProfilePhoto = (req, res, next) => {
    upload.single('photo')(req, res, error => {
        if (error) {
            return res.status(400).json({ success: false, message: error.message || 'Invalid profile photo' });
        }
        return next();
    });
};

module.exports = { parseProfilePhoto };