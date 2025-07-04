export interface IUser {
	id: string;
	firstName?: string;
	lastName?: string;
	fullName?: string;
	email?: string;
	isOwner: boolean;
	isPendingUser: boolean;
	inviteAcceptUrl?: string;
	disabled: boolean;
	signInType: string;
}

export interface UserAction {
	label: string;
	value: string;
	disabled: boolean;
	type?: 'external-link';
	tooltip?: string;
	guard?: (user: IUser) => boolean;
}

export type UserStackGroups = { [groupName: string]: IUser[] };
