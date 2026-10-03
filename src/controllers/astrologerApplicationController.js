const mongoose = require('mongoose');
const connectDB = require('../database/db');
const User = require('../model/userSchema');
const Astrologer = require('../model/astrologerSchema');
const Notification = require('../model/notificationSchema');
const Wallet = require('../model/walletSchema');
const { normalizeRoles } = require('../services/authTokenService');

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

const getAdminDashboardStats = async (req, res) => {
    try {
        await connectDB();
        const [customers, pendingApplications, listedAstrologers] = await Promise.all([
            User.countDocuments({ roles: 'USER' }),
            User.countDocuments({ astrologerApplicationStatus: 'PENDING' }),
            Astrologer.countDocuments()
        ]);
        const astrologers = await Astrologer.countDocuments({ roles: 'ASTROLOGER' });

        let astrologerMessageStats = {};
        if (req.auth?.roles?.includes('ASTROLOGER') && req.auth.astrologerId) {
            const [messageStats] = await User.aggregate([
                { $unwind: '$chat' },
                {
                    $match: {
                        'chat.astrologerId': new mongoose.Types.ObjectId(req.auth.astrologerId),
                        'chat.sender': 'user'
                    }
                },
                {
                    $group: {
                        _id: null,
                        peopleMessaged: { $addToSet: '$_id' },
                        totalMessages: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        peopleMessaged: { $size: '$peopleMessaged' },
                        totalMessages: 1
                    }
                }
            ]);
            astrologerMessageStats = {
                peopleMessaged: messageStats?.peopleMessaged || 0,
                totalMessages: messageStats?.totalMessages || 0
            };
        }

        return res.json({
            success: true,
            data: { customers, astrologers, pendingApplications, listedAstrologers, ...astrologerMessageStats }
        });
    } catch (_error) {
        return res.status(500).json({ success: false, message: 'Unable to load admin dashboard stats' });
    }
};

const moveApprovedApplicant = async (applicant, pricePerMinute) => {
    const email = applicant.email.trim().toLowerCase();
    let astrologer = await Astrologer.findOne({
        $or: [
            { accountId: applicant._id },
            { userId: applicant._id },
            { notificationEmail: email },
            { email }
        ]
    }).select('+email +phoneNumber +notificationEmail +accountId +roles userId chat');

    const existingRoles = (applicant.roles || ['USER']).filter(role => role !== 'USER');
    const roles = normalizeRoles([...existingRoles, 'ASTROLOGER']);
    if (!astrologer) {
        astrologer = new Astrologer({
            _id: applicant._id,
            accountId: applicant._id,
            roles,
            chat: applicant.chat || []
        });
    } else {
        const savedChatIds = new Set((astrologer.chat || []).map(message => message._id?.toString()).filter(Boolean));
        const applicantChat = (applicant.chat || []).filter(message => !savedChatIds.has(message._id?.toString()));
        astrologer.accountId = applicant._id;
        astrologer.roles = roles;
        astrologer.chat = [...(astrologer.chat || []), ...applicantChat];
    }

    astrologer.name = applicant.name;
    astrologer.email = email;
    astrologer.notificationEmail = email;
    astrologer.phoneNumber = applicant.phoneNumber || '';
    astrologer.place = applicant.place || '';
    astrologer.dateOfBirth = applicant.dateOfBirth || '';
    astrologer.gender = applicant.gender || '';
    astrologer.photo = applicant.photo || '';
    astrologer.image = applicant.photo || astrologer.image || '';
    astrologer.type = astrologer.type || 'Vedic Astrology';
    astrologer.price = `INR ${pricePerMinute}/min`;
    astrologer.status = 'OFFLINE';
    astrologer.sessionType = 'CHAT';
    astrologer.astrologerApplicationStatus = 'APPROVED';
    astrologer.userId = undefined;
    if (!astrologer.astrologerId) {
        const last = await Astrologer.findOne().sort({ astrologerId: -1 }).select('astrologerId').lean();
        astrologer.astrologerId = (last?.astrologerId || 0) + 1;
    }
    await astrologer.save();

    await Wallet.findOneAndUpdate(
        { userId: applicant._id },
        { $setOnInsert: { userId: applicant._id, balanceMinor: 0, currency: 'INR' } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Notification.updateMany(
        { recipientId: applicant._id, recipientRole: 'USER' },
        { $set: { recipientId: astrologer._id, recipientRole: 'ASTROLOGER' } }
    );
    await Notification.create({
        recipientId: astrologer._id,
        recipientRole: 'ASTROLOGER',
        type: 'APPLICATION',
        title: 'Astrologer application approved',
        body: 'Your application is approved. Sign in again to open your astrologer dashboard.',
        data: { applicationStatus: 'APPROVED' }
    });

    await User.deleteOne({ _id: applicant._id });
    return astrologer;
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

        if (decision === 'REJECT') {
            applicant.astrologerApplicationStatus = 'REJECTED';
            await applicant.save();
            await Notification.create({
                recipientId: applicant._id,
                recipientRole: 'USER',
                type: 'APPLICATION',
                title: 'Astrologer application update',
                body: 'Your astrologer application was not approved. Your account remains a customer account.',
                data: { applicationStatus: 'REJECTED' }
            });
            return res.json({
                success: true,
                data: { accountId: applicant._id, roles: applicant.roles || ['USER'], applicationStatus: 'REJECTED' }
            });
        }

        const rate = Number(pricePerMinute);
        if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
            return res.status(400).json({ success: false, message: 'Enter a valid rate per minute' });
        }
        if (!applicant.email) {
            return res.status(400).json({ success: false, message: 'Applicant must have an email before approval' });
        }

        const astrologer = await moveApprovedApplicant(applicant, rate);
        return res.json({
            success: true,
            data: {
                accountId: astrologer.accountId,
                roles: astrologer.roles,
                applicationStatus: 'APPROVED',
                astrologerId: astrologer._id
            }
        });
    } catch (error) {
        console.error('Astrologer application review failed:', error.message);
        return res.status(500).json({ success: false, message: 'Unable to review application' });
    }
};

module.exports = { getAdminDashboardStats, listPendingApplications, reviewApplication };