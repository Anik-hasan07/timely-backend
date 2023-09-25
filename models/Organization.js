const Organization = require('../schema/Organization');

exports.create = (name, teamsOrgId) => {
	const newOrganization = new Organization({
		name,
		teamsOrgId,
	});

	return newOrganization.save();
};
exports.organizationExist = async (teamsOrgId) =>
	Organization.findOne({ teamsOrgId });
