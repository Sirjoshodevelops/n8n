// eslint-disable-next-line import/no-cycle
import { ServiceA } from './service-a';
import { Service } from '../../di';

@Service()
export class ServiceB {
	constructor(readonly a: ServiceA) {}
}
