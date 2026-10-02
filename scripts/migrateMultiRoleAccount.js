require('dotenv').config();

const connectDB = require('../src/database/db');
const User = require('../src/model/userSchema');
const Astrologer = require('../src/model/astrologerSchema');
const Notification = require('../src/model/notificationSchema');
const { normalizeRoles } = require('../src/services/authTokenService');

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const main = async () => {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email) throw new Error('Pass the account email as the first argument');

    await connectDB();
    const emailQuery = new RegExp(`^${escapeRegExp(email)}$`, 'i');
    const user = await User.collection.findOne({ email: emailQuery });
    let astrologer = await Astrologer.findOne({
        $or: [
            ...(user ? [{ userId: user._id }, { accountId: user._id }] : []),
            { notificationEmail: emailQuery },
            { email: emailQuery }
        ]
    }).select('+email +phoneNumber +notificationEmail +accountId +roles userId chat');

    if (!user && !astrologer) {
        throw new Error('Target account was not found in the configured database; no changes were made');
    }
    if (!astrologer) {
        throw new Error('Linked astrologer profile was not found; no records were moved');
    }

    const accountId = user?._id || astrologer.accountId || astrologer.userId || astrologer._id;
    const existingUserRoles = user
        ? normalizeRoles([...(user.roles || []), user.role || 'USER'])
        : [];
    const roles = normalizeRoles([
        ...(astrologer.roles || []).filter(role => role !== 'USER'),
        ...existingUserRoles.filter(role => role !== 'USER'),
        'ASTROLOGER',
        'ADMIN'
    ]);

    if (user) {
        astrologer.accountId = accountId;
        astrologer.roles = roles;
        astrologer.email = user.email || email;
        astrologer.notificationEmail = user.email || email;
        astrologer.phoneNumber = user.phoneNumber || '';
        astrologer.name = user.name || astrologer.name;
        astrologer.place = user.place || astrologer.place;
        astrologer.dateOfBirth = user.dateOfBirth || astrologer.dateOfBirth;
        astrologer.gender = user.gender || astrologer.gender;
        astrologer.photo = user.photo || astrologer.photo;
        if (Array.isArray(user.chat) && user.chat.length) {
            const existingIds = new Set((astrologer.chat || []).map(chat => chat._id?.toString()).filter(Boolean));
            astrologer.chat = [...(astrologer.chat || []), ...user.chat.filter(chat => !existingIds.has(chat._id?.toString()))];
        }
        astrologer.userId = undefined;
        await astrologer.save();

        await Notification.updateMany(
            { recipientId: user._id, recipientRole: 'USER' },
            { $set: { recipientId: astrologer._id, recipientRole: 'ASTROLOGER' } }
        );
        await User.collection.deleteOne({ _id: user._id });
    } else {
        astrologer.accountId = accountId;
        astrologer.roles = roles;
        astrologer.userId = undefined;
        await astrologer.save();
    }

    const remainingUsers = await User.collection.find({}, { projection: { _id: 1, role: 1, roles: 1 } }).toArray();
    if (remainingUsers.length) {
        await User.collection.bulkWrite(remainingUsers.map(account => ({
            updateOne: {
                filter: { _id: account._id },
                update: {
                    $set: { roles: normalizeRoles([...(account.roles || []), account.role || 'USER']) },
                    $unset: { role: '' }
                }
            }
        })));
    }

    console.log(JSON.stringify({
        movedUserRecord: Boolean(user),
        roles: astrologer.roles,
        accountIdPreserved: true,
        astrologerProfileId: astrologer._id.toString()
    }));
};

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Astrologer account migration failed:', error.message);
        process.exit(1);
    });