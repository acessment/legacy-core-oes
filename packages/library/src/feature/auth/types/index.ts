type registerRequest = {
    email: string;
    password: string;
    username: string;
};
type IverifyEmailRequest = {
    id: string;
    otp: string;
};
type Ipreference = {
    prefer_cate: string[];
    prefer_grade: string[];
    prefer_tag: string[];
    region: string;
    identity: string;
    language: string;
};
