const User = require("../model/userSchema");
const Astrologer = require("../model/astrologerSchema");
const Notification = require("../model/notificationSchema");

// Moves every User that has the ASTROLOGER role into the Astrologer collection, same as approving an application.
// The Astrologer reuses the user's _id as accountId, so wallet and notifications stay linked.
// The User record is deleted only after its Astrologer profile exists with that same accountId.
// Users matched to a different existing Astrologer (by email/userId) are left untouched.
const syncAstrologerUsers = async () => {
    // `role` is the legacy single-value field some older users still carry.
    const users = await User.find({ $or: [{ roles: "ASTROLOGER" }, { role: "ASTROLOGER" }] })
        .select("+email +phoneNumber name roles role place dateOfBirth gender photo chat")
        .setOptions({ strictQuery: false })
        .lean();

    const lastAstrologer = await Astrologer.findOne().sort({ astrologerId: -1 }).select("astrologerId").lean();
    let nextAstrologerId = (lastAstrologer?.astrologerId || 0) + 1;
    const created = [];
    const moved = [];

    for (const user of users) {
        const email = user.email?.trim().toLowerCase();
        const linked = await Astrologer.exists({ accountId: user._id });
        if (linked) {
            await User.deleteOne({ _id: user._id });
            moved.push(user.name);
            continue;
        }
        const alreadyListed = await Astrologer.exists({
            $or: [
                { accountId: user._id },
                { userId: user._id },
                ...(email ? [{ email }, { notificationEmail: email }] : [])
            ]
        });
        if (alreadyListed) {
            continue;
        }

        const astrologer = await Astrologer.create({
            _id: user._id,
            accountId: user._id,
            astrologerId: nextAstrologerId++,
            roles: [...new Set([...(user.roles || []).filter(role => role !== "USER"), "ASTROLOGER"])],
            name: user.name || "Astrologer",
            email,
            notificationEmail: email,
            phoneNumber: user.phoneNumber || "",
            place: user.place || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            photo: user.photo || "",
            image: user.photo || "",
            type: "Vedic Astrology",
            price: "INR 20/min",
            status: "OFFLINE",
            sessionType: "CHAT",
            chat: user.chat || []
        });
        await Notification.updateMany(
            { recipientId: user._id, recipientRole: "USER" },
            { $set: { recipientId: astrologer._id, recipientRole: "ASTROLOGER" } }
        );
        await User.deleteOne({ _id: user._id });
        created.push(astrologer.name);
    }

    return { found: users.length, created: created.length, alreadyMoved: moved.length, names: created };
};

module.exports = { syncAstrologerUsers };
