const connectDB = require('../database/db');
const User = require('../model/userSchema');
const Astrologer = require('../model/astrologerSchema');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const uploadToCloudinary = file => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
            folder: 'astroai/profile-photos',
            public_id: String(file.accountId),
            overwrite: true,
            invalidate: true,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
        },
        (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(file.buffer);
});

const uploadProfilePhoto = async (req, res) => {
    try {
        await connectDB();
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Choose a profile photo first' });
        }
        if (!isCloudinaryConfigured) {
            return res.status(503).json({
                success: false,
                message: 'Photo uploads are not configured. Set the Cloudinary environment variables.'
            });
        }

        const roles = req.auth.roles || [req.auth.role];
        const isAstrologer = roles.includes('ASTROLOGER');
        const currentProfile = isAstrologer
            ? await Astrologer.findOne({
                $or: [
                    { accountId: req.auth.id },
                    { _id: req.auth.astrologerId || req.auth.id }
                ]
            }).select('_id accountId')
            : await User.findById(req.auth.id).select('_id');

        if (!currentProfile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        const accountId = isAstrologer
            ? currentProfile.accountId || req.auth.id
            : currentProfile._id;
        const uploadResult = await uploadToCloudinary({ ...req.file, accountId });
        const photo = uploadResult.secure_url;

        if (isAstrologer) {
            await Astrologer.updateOne({ _id: currentProfile._id }, { $set: { photo, image: photo } });
        } else {
            await User.updateOne({ _id: currentProfile._id }, { $set: { photo } });
        }

        return res.json({ success: true, data: { photo }, message: 'Profile photo updated' });
    } catch (error) {
        console.error('Profile photo upload failed:', error.message);
        return res.status(502).json({ success: false, message: 'Unable to upload profile photo' });
    }
};

module.exports = { uploadProfilePhoto };