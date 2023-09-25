const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	teamsUserId: {
		type: String,
		required: true,
	},
	userName: {
		type: String,
		required: true,
	},

	userEmail: {
		type: String,
		required: true,
	},
	userPhoto: {
		type: String,
		required: false,
	},
	role: {
		type: String,
		required: true,
		enum: ['Admin', 'User', 'SuperAdmin'],
	},
	organizationId: {
		ref: 'organizations',
		type: mongoose.Types.ObjectId,
	},
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
