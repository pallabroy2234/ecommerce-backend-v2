export interface NewUserRequestBody {
	_id: string;
	name: string;
	email: string;
	image: string;
	dob: Date;
	role: "admin" | "user";
	gender: "male" | "female" | "other";
}
