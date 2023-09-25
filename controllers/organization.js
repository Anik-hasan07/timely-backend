/* eslint-disable no-underscore-dangle */
const { errorResponseHandler, validate } = require('../helpers/index');
const Organization = require('../models/Organization');
const { organizationNameRules } = require('../helpers/validationRules');
const { specialCharacterCheck } = require('../helpers/lib/validator/validate');

exports.createOrganization = async (ctx) => {
	try {
		const { organizationName, teamsOrgId } = ctx.request.body;
		validate(
			{
				organizationName,
				teamsOrgId,
			},
			organizationNameRules
		);

		if (specialCharacterCheck(organizationName[0])) {
			ctx.response.fail(
				{},
				"Organization name can't start with special characters"
			);
		}

		const result = await Organization.create(organizationName, teamsOrgId);

		ctx.response.ok(
			{ organizationId: result._id },
			'organization created successfully'
		);
	} catch (err) {
		errorResponseHandler(ctx, err);
	}
};
