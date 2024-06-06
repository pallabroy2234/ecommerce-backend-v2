export interface NewUserRequestBody {
	_id: any;
	name: string;
	email: string;
	image: string;
	dob: Date;
	gender: "male" | "female" | "other";
}
