import { UserHomeCorePage } from "@acessment/core-oes";

export default function UserHome() {
    return (
        <UserHomeCorePage
            welcomeMessage="Good morning! Catherine here. Every sunrise brings a new opportunity to grow and learn. Welcome to today's English challenge!"
            inactiveMessage={
                <>
                    您的帳戶已被停用。如欲重新啟用並繼續參與本計劃，請聯絡
                    <a href="https://api.whatsapp.com/send/?phone=85244289419" className="underline text-aceBlue">
                        44289419
                    </a>
                    。
                    <br />
                    Your account has been deactivated. To reactivate your account and continue participating in the
                    program, please contact:{" "}
                    <a href="https://api.whatsapp.com/send/?phone=85244289419" className="underline text-aceBlue">
                        44289419
                    </a>
                    .
                </>
            }
        />
    );
}
