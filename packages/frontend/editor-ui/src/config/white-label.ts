/**
 * White Label Configuration for AI Employee
 * This configuration controls which features are hidden in the UI
 */

export const WHITE_LABEL_CONFIG = {
	// Hide all enterprise features
	hideEnterpriseFeatures: true,

	// Routes that should be hidden/redirected
	hiddenRoutes: [
		'settings-usage',
		'settings-sso',
		'settings-ldap',
		'settings-log-streaming',
		'settings-source-control',
		'settings-external-secrets',
		'worker-view',
		'workflow-history',
	],

	// Banners that should not be displayed
	hiddenBanners: [
		'TRIAL',
		'TRIAL_OVER',
		'NON_PRODUCTION_LICENSE',
		'EMAIL_CONFIRMATION',
		'V1',
	],

	// Settings menu items to hide
	hiddenSettingsItems: [
		'settings-usage',
		'settings-sso',
		'settings-ldap',
		'settings-log-streaming',
		'settings-source-control',
		'settings-external-secrets',
	],

	// Main sidebar items to hide
	hiddenSidebarItems: [
		'worker-view',
	],

	// Features to disable
	disabledFeatures: {
		cloudPlans: true,
		usage: true,
		license: true,
		sso: true,
		ldap: true,
		logStreaming: true,
		sourceControl: true,
		externalSecrets: true,
		workflowHistory: true,
		workersView: true,
		upgradeCTAs: true,
		executionLimits: true,
		telemetry: true,
	},

	// Custom branding
	branding: {
		name: 'AI Employee',
		url: 'https://aiemployee.com',
		docsUrl: 'https://docs.aiemployee.com',
		communityUrl: 'https://community.aiemployee.com',
		supportEmail: 'support@aiemployee.com',
	},
};

// Helper function to check if a route should be hidden
export function isRouteHidden(routeName: string): boolean {
	return WHITE_LABEL_CONFIG.hiddenRoutes.includes(routeName);
}

// Helper function to check if a banner should be hidden
export function isBannerHidden(bannerName: string): boolean {
	return WHITE_LABEL_CONFIG.hiddenBanners.includes(bannerName);
}

// Helper function to check if a feature is disabled
export function isFeatureDisabled(featureName: keyof typeof WHITE_LABEL_CONFIG.disabledFeatures): boolean {
	return WHITE_LABEL_CONFIG.disabledFeatures[featureName] ?? false;
}

// Helper function to get branding info
export function getBranding() {
	return WHITE_LABEL_CONFIG.branding;
}