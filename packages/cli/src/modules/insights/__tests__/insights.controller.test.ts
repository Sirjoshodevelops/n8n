import { LicenseState } from '@n8n/backend-common';
import { Container } from '@n8n/di';
import { mock } from 'jest-mock-extended';

import type { AuthenticatedRequest } from '@/requests';
import { mockInstance } from '@test/mocking';
import { LicenseMocker } from '@test-integration/license';
import * as testDb from '@test-integration/test-db';

import { TypeToNumber } from '../database/entities/insights-shared';
import { InsightsByPeriodRepository } from '../database/repositories/insights-by-period.repository';
import { InsightsController } from '../insights.controller';

// Initialize DB once for all tests
beforeAll(async () => {
	await testDb.init();
	new LicenseMocker().mockLicenseState(Container.get(LicenseState));
});

// Terminate DB once after all tests complete
afterAll(async () => {
	await testDb.terminate();
});

describe('InsightsController', () => {
	const insightsByPeriodRepository = mockInstance(InsightsByPeriodRepository);
	let controller: InsightsController;
	beforeAll(async () => {
		controller = Container.get(InsightsController);
	});

	describe('getInsightsSummary', () => {
		it('should return default insights if no data', async () => {
			// ARRANGE
			insightsByPeriodRepository.getPreviousAndCurrentPeriodTypeAggregates.mockResolvedValue([]);

			// ACT
			const response = await controller.getInsightsSummary(
				mock<AuthenticatedRequest>(),
				mock<Response>(),
			);

			// ASSERT
			expect(response).toEqual({
				total: { deviation: null, unit: 'count', value: 0 },
				failed: { deviation: null, unit: 'count', value: 0 },
				failureRate: { deviation: null, unit: 'ratio', value: 0 },
				averageRunTime: { deviation: null, unit: 'millisecond', value: 0 },
				timeSaved: { deviation: null, unit: 'minute', value: 0 },
			});
		});

		it('should return the insights summary with null deviation if insights exist only for current period', async () => {
			// ARRANGE
			insightsByPeriodRepository.getPreviousAndCurrentPeriodTypeAggregates.mockResolvedValue([
				{ period: 'current', type: TypeToNumber.success, total_value: 20 },
				{ period: 'current', type: TypeToNumber.failure, total_value: 10 },
				{ period: 'current', type: TypeToNumber.runtime_ms, total_value: 300 },
				{ period: 'current', type: TypeToNumber.time_saved_min, total_value: 10 },
			]);

			// ACT
			const response = await controller.getInsightsSummary(
				mock<AuthenticatedRequest>(),
				mock<Response>(),
			);

			// ASSERT
			expect(response).toEqual({
				total: { deviation: null, unit: 'count', value: 30 },
				failed: { deviation: null, unit: 'count', value: 10 },
				failureRate: { deviation: null, unit: 'ratio', value: 0.333 },
				averageRunTime: { deviation: null, unit: 'millisecond', value: 10 },
				timeSaved: { deviation: null, unit: 'minute', value: 10 },
			});
		});

		it('should return the insights summary if insights exist for both periods', async () => {
			// ARRANGE
			insightsByPeriodRepository.getPreviousAndCurrentPeriodTypeAggregates.mockResolvedValue([
				{ period: 'previous', type: TypeToNumber.success, total_value: 16 },
				{ period: 'previous', type: TypeToNumber.failure, total_value: 4 },
				{ period: 'previous', type: TypeToNumber.runtime_ms, total_value: 40 },
				{ period: 'previous', type: TypeToNumber.time_saved_min, total_value: 5 },
				{ period: 'current', type: TypeToNumber.success, total_value: 20 },
				{ period: 'current', type: TypeToNumber.failure, total_value: 10 },
				{ period: 'current', type: TypeToNumber.runtime_ms, total_value: 300 },
				{ period: 'current', type: TypeToNumber.time_saved_min, total_value: 10 },
			]);

			// ACT
			const response = await controller.getInsightsSummary(
				mock<AuthenticatedRequest>(),
				mock<Response>(),
			);

			// ASSERT
			expect(response).toEqual({
				total: { deviation: 10, unit: 'count', value: 30 },
				failed: { deviation: 6, unit: 'count', value: 10 },
				failureRate: { deviation: 0.333 - 0.2, unit: 'ratio', value: 0.333 },
				averageRunTime: { deviation: 300 / 30 - 40 / 20, unit: 'millisecond', value: 10 },
				timeSaved: { deviation: 5, unit: 'minute', value: 10 },
			});
		});
	});
});
