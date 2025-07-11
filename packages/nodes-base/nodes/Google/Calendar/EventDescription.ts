import type { INodeProperties } from 'n8n-workflow';

import { TIMEZONE_VALIDATION_REGEX } from './GenericFunctions';

export const eventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['event'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add a event to calendar',
				action: 'Create an event',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an event',
				action: 'Delete an event',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an event',
				action: 'Get an event',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many events from a calendar',
				action: 'Get many events',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an event',
				action: 'Update an event',
			},
		],
		default: 'create',
	},
];

export const eventFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                 event:getAll                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Calendar',
		name: 'calendar',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Google Calendar to operate on',
		modes: [
			{
				displayName: 'Calendar',
				name: 'list',
				type: 'list',
				placeholder: 'Select a Calendar...',
				typeOptions: {
					searchListMethod: 'getCalendars',
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				validation: [
					{
						type: 'regex',
						properties: {
							// calendar ids are emails. W3C email regex with optional trailing whitespace.
							regex:
								'(^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*(?:[ \t]+)*$)',
							errorMessage: 'Not a valid Google Calendar ID',
						},
					},
				],
				extractValue: {
					type: 'regex',
					regex: '(^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)',
				},
				placeholder: 'name@google.com',
			},
		],
		displayOptions: {
			show: {
				resource: ['event'],
			},
		},
	},

	/* -------------------------------------------------------------------------- */
	/*                                 event:create                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Start',
		name: 'start',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
				'@version': [{ _cnd: { lt: 1.3 } }],
			},
		},
		default: '',
		description: 'Start time of the event',
	},
	{
		displayName: 'End',
		name: 'end',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
				'@version': [{ _cnd: { lt: 1.3 } }],
			},
		},
		default: '',
		description: 'End time of the event',
	},
	{
		displayName: 'Start',
		name: 'start',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
				'@version': [{ _cnd: { gte: 1.3 } }],
			},
		},
		default: '={{ $now }}',
		description:
			'Start time of the event, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
	},
	{
		displayName: 'End',
		name: 'end',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
				'@version': [{ _cnd: { gte: 1.3 } }],
			},
		},
		default: "={{ $now.plus(1, 'hour') }}",
		description:
			'End time of the event, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
	},
	{
		displayName: 'Use Default Reminders',
		name: 'useDefaultReminders',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
			},
		},
		default: true,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['create'],
				resource: ['event'],
			},
		},
		options: [
			{
				displayName: 'All Day',
				name: 'allday',
				type: 'options',
				options: [
					{
						name: 'Yes',
						value: 'yes',
					},
					{
						name: 'No',
						value: 'no',
					},
				],
				default: 'no',
				description: 'Whether the event is all day or not',
			},
			{
				displayName: 'Attendees',
				name: 'attendees',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Attendee',
				},
				default: '',
				description: 'The attendees of the event. Multiple ones can be separated by comma.',
			},
			{
				displayName: 'Color Name or ID',
				name: 'color',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getColors',
				},
				default: '',
				description:
					'The color of the event. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Conference Data',
				name: 'conferenceDataUi',
				placeholder: 'Add Conference',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						displayName: 'Conference Link',
						name: 'conferenceDataValues',
						values: [
							{
								displayName: 'Type Name or ID',
								name: 'conferenceSolution',
								type: 'options',
								description:
									'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
								typeOptions: {
									loadOptionsMethod: 'getConferenceSolutions',
									loadOptionsDependsOn: ['calendar'],
								},
								default: '',
							},
						],
					},
				],
				description: 'Creates a conference link (Hangouts, Meet etc) and attaches it to the event',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Guests Can Invite Others',
				name: 'guestsCanInviteOthers',
				type: 'boolean',
				default: true,
				description: 'Whether attendees other than the organizer can invite others to the event',
			},
			{
				displayName: 'Guests Can Modify',
				name: 'guestsCanModify',
				type: 'boolean',
				default: false,
				description: 'Whether attendees other than the organizer can modify the event',
			},
			{
				displayName: 'Guests Can See Other Guests',
				name: 'guestsCanSeeOtherGuests',
				type: 'boolean',
				default: true,
				description:
					"Whether attendees other than the organizer can see who the event's attendees are",
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Opaque identifier of the event',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Geographic location of the event as free-form text',
			},
			{
				displayName: 'Max Attendees',
				name: 'maxAttendees',
				type: 'number',
				default: 0,
				description:
					'The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned.',
			},
			{
				displayName: 'Repeat Frequency',
				name: 'repeatFrecuency',
				type: 'options',
				options: [
					{
						name: 'Daily',
						value: 'Daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
					{
						name: 'Monthly',
						value: 'monthly',
					},
					{
						name: 'Yearly',
						value: 'yearly',
					},
				],
				default: '',
			},
			{
				displayName: 'Repeat How Many Times?',
				name: 'repeatHowManyTimes',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
			},
			{
				displayName: 'Repeat Until',
				name: 'repeatUntil',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'RRULE',
				name: 'rrule',
				type: 'string',
				default: '',
				description:
					'Recurrence rule. When set, the parameters Repeat Frequency, Repeat How Many Times and Repeat Until are ignored.',
			},
			{
				displayName: 'Send Updates',
				name: 'sendUpdates',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Notifications are sent to all guests',
					},
					{
						name: 'External Only',
						value: 'externalOnly',
						description: 'Notifications are sent to non-Google Calendar guests only',
					},
					{
						name: 'None',
						value: 'none',
						description:
							'No notifications are sent. This value should only be used for migration use case.',
					},
				],
				description: 'Whether to send notifications about the creation of the new event',
				default: '',
			},
			{
				displayName: 'Show Me As',
				name: 'showMeAs',
				type: 'options',
				options: [
					{
						name: 'Available',
						value: 'transparent',
						description: 'The event does not block time on the calendar',
					},
					{
						name: 'Busy',
						value: 'opaque',
						description: 'The event does block time on the calendar',
					},
				],
				default: 'opaque',
				description: 'Whether the event blocks time on the calendar',
			},
			{
				displayName: 'Summary',
				name: 'summary',
				type: 'string',
				default: '',
				description: 'Title of the event',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{
						name: 'Confidential',
						value: 'confidential',
						description: 'The event is private. This value is provided for compatibility reasons.',
					},
					{
						name: 'Default',
						value: 'default',
						description: 'Uses the default visibility for events on the calendar',
					},
					{
						name: 'Private',
						value: 'private',
						description: 'The event is private and only event attendees may view event details',
					},
					{
						name: 'Public',
						value: 'public',
						description:
							'The event is public and event details are visible to all readers of the calendar',
					},
				],
				default: 'default',
				description: 'Visibility of the event',
			},
		],
	},
	{
		displayName: 'Reminders',
		name: 'remindersUi',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Reminder',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['create'],
				useDefaultReminders: [false],
			},
		},
		options: [
			{
				name: 'remindersValues',
				displayName: 'Reminder',
				values: [
					{
						displayName: 'Method',
						name: 'method',
						type: 'options',
						options: [
							{
								name: 'Email',
								value: 'email',
							},
							{
								name: 'Popup',
								value: 'popup',
							},
						],
						default: '',
					},
					{
						displayName: 'Minutes Before',
						name: 'minutes',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 40320,
						},
						default: 0,
					},
				],
			},
		],
		description:
			"If the event doesn't use the default reminders, this lists the reminders specific to the event",
	},

	/* -------------------------------------------------------------------------- */
	/*                                 event:delete                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['event'],
			},
		},
		default: '',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				operation: ['delete'],
				resource: ['event'],
			},
		},
		options: [
			{
				displayName: 'Send Updates',
				name: 'sendUpdates',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Notifications are sent to all guests',
					},
					{
						name: 'External Only',
						value: 'externalOnly',
						description: 'Notifications are sent to non-Google Calendar guests only',
					},
					{
						name: 'None',
						value: 'none',
						description:
							'No notifications are sent. This value should only be used for migration use case.',
					},
				],
				description: 'Whether to send notifications about the creation of the new event',
				default: '',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                                 event:get                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['event'],
			},
		},
		default: '',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				operation: ['get'],
				resource: ['event'],
			},
		},
		options: [
			{
				displayName: 'Max Attendees',
				name: 'maxAttendees',
				type: 'number',
				default: 0,
				description:
					'The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned.',
			},
			{
				displayName: 'Return Next Instance of Recurring Event',
				name: 'returnNextInstance',
				type: 'boolean',
				default: false,
				description:
					'Whether to return the next instance of a recurring event instead of the event itself',
				displayOptions: {
					show: {
						'@version': [{ _cnd: { gte: 1.3 } }],
					},
				},
			},
			{
				displayName: 'Timezone',
				name: 'timeZone',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description:
					'Time zone used in the response. The default is the time zone of the calendar.',
				modes: [
					{
						displayName: 'Timezone',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Timezone...',
						typeOptions: {
							searchListMethod: 'getTimezones',
							searchable: true,
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: TIMEZONE_VALIDATION_REGEX,
									errorMessage: 'Not a valid Timezone',
								},
							},
						],
						extractValue: {
							type: 'regex',
							regex: '([-+/_a-zA-Z0-9]*)',
						},
						placeholder: 'Europe/Berlin',
					},
				],
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                 event:getAll                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['event'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['event'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'After',
		name: 'timeMin',
		type: 'dateTime',
		default: '={{ $now }}',
		description:
			'At least some part of the event must be after this time, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
		displayOptions: {
			show: {
				'@version': [{ _cnd: { gte: 1.3 } }],
				operation: ['getAll'],
				resource: ['event'],
			},
		},
	},
	{
		displayName: 'Before',
		name: 'timeMax',
		type: 'dateTime',
		default: '={{ $now.plus({ week: 1 }) }}',
		description:
			'At least some part of the event must be before this time, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
		displayOptions: {
			show: {
				'@version': [{ _cnd: { gte: 1.3 } }],
				operation: ['getAll'],
				resource: ['event'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: {
				operation: ['getAll'],
				resource: ['event'],
			},
		},
		options: [
			{
				displayName: 'After',
				name: 'timeMin',
				type: 'dateTime',
				default: '',
				description:
					'At least some part of the event must be after this time, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
				displayOptions: {
					hide: {
						'@version': [{ _cnd: { gte: 1.3 } }],
					},
				},
			},
			{
				displayName: 'Before',
				name: 'timeMax',
				type: 'dateTime',
				default: '',
				description:
					'At least some part of the event must be before this time, use <a href="https://docs.n8n.io/code/cookbook/luxon/" target="_blank">expression</a> to set a date, or switch to fixed mode to choose date from widget',
				displayOptions: {
					hide: {
						'@version': [{ _cnd: { gte: 1.3 } }],
					},
				},
			},
			{
				displayName: 'Expand Events',
				name: 'singleEvents',
				type: 'boolean',
				default: false,
				description:
					'Whether to expand recurring events into instances and only return single one-off events and instances of recurring events, but not the underlying recurring events themselves',
				displayOptions: {
					hide: {
						'@version': [{ _cnd: { gte: 1.3 } }],
					},
				},
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				placeholder: 'e.g. items(ID,status,summary)',
				default: '',
				description:
					"Specify fields to return, by default a predefined by Google set of commonly used fields would be returned. To return all fields, use '*', <a href='https://developers.google.com/calendar/api/guides/performance#partial' target='_blank'>more info</a>.",
			},
			{
				displayName: 'iCalUID',
				name: 'iCalUID',
				type: 'string',
				default: '',
				description: 'Specifies event ID in the iCalendar format to be included in the response',
			},
			{
				displayName: 'Max Attendees',
				name: 'maxAttendees',
				type: 'number',
				default: 0,
				description:
					'The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned.',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'options',
				options: [
					{
						name: 'Start Time',
						value: 'startTime',
						description:
							'Order by the start date/time (ascending). This is only available when querying single events (i.e. the parameter singleEvents is True).',
					},
					{
						name: 'Updated',
						value: 'updated',
						description: 'Order by last modification time (ascending)',
					},
				],
				default: '',
				description: 'The order of the events returned in the result',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				description:
					'Free text search terms to find events that match these terms in any field, except for extended properties',
			},
			{
				displayName: 'Recurring Event Handling',
				name: 'recurringEventHandling',
				type: 'options',
				default: 'expand',
				options: [
					{
						name: 'All Occurrences',
						value: 'expand',
						description: 'Return all instances of recurring event for specified time range',
					},
					{
						name: 'First Occurrence',
						value: 'first',
						description: 'Return event with specified recurrence rule',
					},
					{
						name: 'Next Occurrence',
						value: 'next',
						description: 'Return next instance of recurring event',
					},
				],
				displayOptions: {
					show: {
						'@version': [{ _cnd: { gte: 1.3 } }],
					},
				},
			},
			{
				displayName: 'Show Deleted',
				name: 'showDeleted',
				type: 'boolean',
				default: false,
				description:
					'Whether to include deleted events (with status equals "cancelled") in the result',
			},
			{
				displayName: 'Show Hidden Invitations',
				name: 'showHiddenInvitations',
				type: 'boolean',
				default: false,
				description: 'Whether to include hidden invitations in the result',
			},

			{
				displayName: 'Timezone',
				name: 'timeZone',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				description:
					'Time zone used in the response. The default is the time zone of the calendar.',
				modes: [
					{
						displayName: 'Timezone',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Timezone...',
						typeOptions: {
							searchListMethod: 'getTimezones',
							searchable: true,
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						validation: [
							{
								type: 'regex',
								properties: {
									regex: TIMEZONE_VALIDATION_REGEX,
									errorMessage: 'Not a valid Timezone',
								},
							},
						],
						extractValue: {
							type: 'regex',
							regex: '([-+/_a-zA-Z0-9]*)',
						},
						placeholder: 'Europe/Berlin',
					},
				],
			},
			{
				displayName: 'Updated Min',
				name: 'updatedMin',
				type: 'dateTime',
				default: '',
				description:
					"Lower bound for an event's last modification time (as a RFC3339 timestamp) to filter by. When specified, entries deleted since this time will always be included regardless of showDeleted.",
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                 event:update                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['event'],
			},
		},
		default: '',
	},
	{
		displayName: 'Modify',
		name: 'modifyTarget',
		type: 'options',
		options: [
			{
				name: 'Recurring Event Instance',
				value: 'instance',
			},
			{
				name: 'Recurring Event',
				value: 'event',
			},
		],
		default: 'instance',
		displayOptions: {
			show: {
				'@version': [{ _cnd: { gte: 1.3 } }],
				resource: ['event'],
				operation: ['update'],
				eventId: [{ _cnd: { includes: '_' } }],
			},
		},
	},
	{
		displayName: 'Use Default Reminders',
		name: 'useDefaultReminders',
		type: 'boolean',
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['event'],
			},
		},
		default: true,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['update'],
				resource: ['event'],
			},
		},
		options: [
			{
				displayName: 'All Day',
				name: 'allday',
				type: 'options',
				options: [
					{
						name: 'Yes',
						value: 'yes',
					},
					{
						name: 'No',
						value: 'no',
					},
				],
				default: 'no',
				description: 'Whether the event is all day or not',
			},
			{
				displayName: 'Attendees',
				name: 'attendeesUi',
				type: 'fixedCollection',
				placeholder: 'Add Attendees',
				default: {
					values: {
						mode: 'add',
						attendees: [],
					},
				},
				options: [
					{
						displayName: 'Values',
						name: 'values',
						values: [
							{
								displayName: 'Mode',
								name: 'mode',
								type: 'options',
								default: 'add',
								options: [
									{
										name: 'Add Attendees Below [Default]',
										value: 'add',
									},
									{
										name: 'Replace Attendees with Those Below',
										value: 'replace',
									},
								],
							},
							{
								displayName: 'Attendees',
								name: 'attendees',
								type: 'string',
								typeOptions: {
									multipleValues: true,
									multipleValueButtonText: 'Add Attendee',
								},
								default: '',
								description: 'The attendees of the event. Multiple ones can be separated by comma.',
							},
						],
					},
				],
				displayOptions: {
					show: {
						'@version': [{ _cnd: { gte: 1.2 } }],
					},
				},
			},
			{
				displayName: 'Attendees',
				name: 'attendees',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Attendee',
				},
				default: '',
				description: 'The attendees of the event. Multiple ones can be separated by comma.',
				displayOptions: {
					show: {
						'@version': [1, 1.1],
					},
				},
			},
			{
				displayName: 'Color Name or ID',
				name: 'color',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getColors',
				},
				default: '',
				description:
					'The color of the event. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'End',
				name: 'end',
				type: 'dateTime',
				default: '',
				description: 'End time of the event',
			},
			{
				displayName: 'Guests Can Invite Others',
				name: 'guestsCanInviteOthers',
				type: 'boolean',
				default: true,
				description: 'Whether attendees other than the organizer can invite others to the event',
			},
			{
				displayName: 'Guests Can Modify',
				name: 'guestsCanModify',
				type: 'boolean',
				default: false,
				description: 'Whether attendees other than the organizer can modify the event',
			},
			{
				displayName: 'Guests Can See Other Guests',
				name: 'guestsCanSeeOtherGuests',
				type: 'boolean',
				default: true,
				description:
					"Whether attendees other than the organizer can see who the event's attendees are",
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'Opaque identifier of the event',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Geographic location of the event as free-form text',
			},
			{
				displayName: 'Max Attendees',
				name: 'maxAttendees',
				type: 'number',
				default: 0,
				description:
					'The maximum number of attendees to include in the response. If there are more than the specified number of attendees, only the participant is returned.',
			},
			{
				displayName: 'Repeat Frequency',
				name: 'repeatFrecuency',
				type: 'options',
				options: [
					{
						name: 'Daily',
						value: 'Daily',
					},
					{
						name: 'Weekly',
						value: 'weekly',
					},
					{
						name: 'Monthly',
						value: 'monthly',
					},
					{
						name: 'Yearly',
						value: 'yearly',
					},
				],
				default: '',
			},
			{
				displayName: 'Repeat How Many Times?',
				name: 'repeatHowManyTimes',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
			},
			{
				displayName: 'Repeat Until',
				name: 'repeatUntil',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'RRULE',
				name: 'rrule',
				type: 'string',
				default: '',
				description:
					'Recurrence rule. When set, the parameters Repeat Frequency, Repeat How Many Times and Repeat Until are ignored.',
			},
			{
				displayName: 'Send Updates',
				name: 'sendUpdates',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Notifications are sent to all guests',
					},
					{
						name: 'External Only',
						value: 'externalOnly',
						description: 'Notifications are sent to non-Google Calendar guests only',
					},
					{
						name: 'None',
						value: 'none',
						description:
							'No notifications are sent. This value should only be used for migration use case.',
					},
				],
				description: 'Whether to send notifications about the creation of the new event',
				default: '',
			},
			{
				displayName: 'Show Me As',
				name: 'showMeAs',
				type: 'options',
				options: [
					{
						name: 'Available',
						value: 'transparent',
						description: 'The event does not block time on the calendar',
					},
					{
						name: 'Busy',
						value: 'opaque',
						description: 'The event does block time on the calendar',
					},
				],
				default: 'opaque',
				description: 'Whether the event blocks time on the calendar',
			},
			{
				displayName: 'Start',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Start time of the event',
			},
			{
				displayName: 'Summary',
				name: 'summary',
				type: 'string',
				default: '',
				description: 'Title of the event',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{
						name: 'Confidential',
						value: 'confidential',
						description: 'The event is private. This value is provided for compatibility reasons.',
					},
					{
						name: 'Default',
						value: 'default',
						description: 'Uses the default visibility for events on the calendar',
					},
					{
						name: 'Public',
						value: 'public',
						description:
							'The event is public and event details are visible to all readers of the calendar',
					},
					{
						name: 'Private',
						value: 'private',
						description: 'The event is private and only event attendees may view event details',
					},
				],
				default: 'default',
				description: 'Visibility of the event',
			},
		],
	},
	{
		displayName: 'Reminders',
		name: 'remindersUi',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Reminder',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['update'],
				useDefaultReminders: [false],
			},
		},
		options: [
			{
				name: 'remindersValues',
				displayName: 'Reminder',
				values: [
					{
						displayName: 'Method',
						name: 'method',
						type: 'options',
						options: [
							{
								name: 'Email',
								value: 'email',
							},
							{
								name: 'Popup',
								value: 'popup',
							},
						],
						default: '',
					},
					{
						displayName: 'Minutes Before',
						name: 'minutes',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 40320,
						},
						default: 0,
					},
				],
			},
		],
		description:
			"If the event doesn't use the default reminders, this lists the reminders specific to the event",
	},
];
