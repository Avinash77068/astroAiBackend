const mongoose = require('mongoose');
const connectDB = require('../database/db');
const User = require('../model/userSchema');
const Astrologer = require('../model/astrologerSchema');
const Notification = require('../model/notificationSchema');

const listPendingApplications = async (_req, res) => {
    try {
        await connectDB();
        const applications = await User.find({ astrologerApplicationStatus: 'PENDING' })
            .select('name email phoneNumber place dateOfBirth createdAt astrologerApplicationStatus')
            .sort({ createdAt: 1 })
            .lean();
        return res.json({ success: true, data: { applications } });
    } catch (_error) {
        return res.status(500).json({ success: false, message: 'Unable to load applications' });
    }
};

const getAdminDashboardStats = async (_req, res) => {
    try {
        await connectDB();
        const [customers, astrologers, pendingApplications, listedAstrologers] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            User.countDocuments({ role: 'ASTROLOGER' }),
            User.countDocuments({ astrologerApplicationStatus: 'PENDING' }),
            Astrologer.countDocuments()
        ]);

        return res.json({
            success: true,
            data: { customers, astrologers, pendingApplications, listedAstrologers }
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: 'Unable to load admin dashboard stats' });
    }
};

const reviewApplication = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;
        const { decision, pricePerMinute } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid applicant ID' });
        }
        if (!['APPROVE', 'REJECT'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Decision must be APPROVE or REJECT' });
        }

        const applicant = await User.findOne({ _id: userId, astrologerApplicationStatus: 'PENDING' });
        if (!applicant) {
            return res.status(404).json({ success: false, message: 'Pending application not found' });
        }

        let astrologerId;
        if (decision === 'APPROVE') {
            const rate = Number(pricePerMinute);
            if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
                return res.status(400).json({ success: false, message: 'Enter a valid rate per minute' });
            }
            if (!applicant.email) {
                return res.status(400).json({ success: false, message: 'Applicant must have an email before approval' });
            }

            const astrologer = await Astrologer.findOneAndUpdate(
                { userId: applicant._id },
                {
                    $set: {
                        name: applicant.name,
                        type: 'Vedic Astrology',
                        price: `INR ${rate}/min`,
                        notificationEmail: applicant.email.trim().toLowerCase(),
                        status: 'OFFLINE',
                        sessionType: 'CHAT'
                    }
                },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );
            astrologerId = astrologer._id;
            applicant.role = 'ASTROLOGER';
            applicant.astrologerApplicationStatus = 'APPROVED';
        } else {
            applicant.role = 'USER';
            applicant.astrologerApplicationStatus = 'REJECTED';
        }

        applicant.astrologerApplicationReviewedAt = new Date();
        applicant.astrologerApplicationReviewedBy = req.auth.id;
        await applicant.save();

        await Notification.create({
            recipientId: applicant._id,
            recipientRole: 'USER',
            type: 'APPLICATION',
            title: decision === 'APPROVE' ? 'Astrologer application approved' : 'Astrologer application update',
            body: decision === 'APPROVE'
                ? 'Your astrologer application is approved. Sign in again to open your astrologer dashboard.'
                : 'Your astrologer application was not approved. Your account remains a customer account.',
            data: { applicationStatus: applicant.astrologerApplicationStatus }
        });

        return res.json({
            success: true,
            data: {
                userId: applicant._id,
                role: applicant.role,
                applicationStatus: applicant.astrologerApplicationStatus,
                astrologerId
            }
        });
    } catch (error) {
        console.error('Astrologer application review failed:', error.message);
        return res.status(500).json({ success: false, message: 'Unable to review application' });
    }
};

module.exports = { getAdminDashboardStats, listPendingApplications, reviewApplication };