export interface IUser {
    id: string;
    given_name: string;
    family_name: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: Date;
    email: string;
    email_verified: boolean;
    phone: string | null;
    role: string | null;
    preferred_religion: string | null;
    created_at: Date | null;
}