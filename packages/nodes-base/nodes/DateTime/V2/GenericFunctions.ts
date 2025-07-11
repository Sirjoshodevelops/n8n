import { DateTime } from 'luxon';
import moment from 'moment-timezone';
import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export function parseDate(
	this: IExecuteFunctions,
	date: string | number | DateTime,
	options: Partial<{
		timezone: string;
		fromFormat: string;
	}> = {},
) {
	let parsedDate;

	if (date instanceof DateTime) {
		parsedDate = date;
	} else {
		// Check if the input is a number, don't convert to number if fromFormat is set
		if (!Number.isNaN(Number(date)) && !options.fromFormat) {
			//input is a number, convert to number in case it is a string formatted number
			date = Number(date);
			// check if the number is a timestamp in float format and convert to integer
			if (!Number.isInteger(date)) {
				date = date * 1000;
			}
		}

		let timezone = options.timezone;
		if (Number.isInteger(date)) {
			const timestampLengthInMilliseconds1990 = 12;
			// check if the number is a timestamp in seconds or milliseconds and create a moment object accordingly
			if (date.toString().length < timestampLengthInMilliseconds1990) {
				parsedDate = DateTime.fromSeconds(date as number);
			} else {
				parsedDate = DateTime.fromMillis(date as number);
			}
		} else {
			if (!timezone && (date as string).includes('+')) {
				const offset = (date as string).split('+')[1].slice(0, 2) as unknown as number;
				timezone = `Etc/GMT-${offset * 1}`;
			}

			if (options.fromFormat) {
				parsedDate = DateTime.fromFormat(date as string, options.fromFormat);
			} else {
				parsedDate = DateTime.fromISO(moment(date).toISOString());
			}
		}

		parsedDate = parsedDate.setZone(timezone || 'Etc/UTC');

		if (parsedDate.invalidReason === 'unparsable') {
			throw new NodeOperationError(this.getNode(), 'Invalid date format');
		}
	}
	return parsedDate;
}
