/* eslint-disable react/react-in-jsx-scope */
import { Footer } from "./footer";
import { useMemo } from "react";

function BaseLayout({ children }: any) {
    return (
        <>
            {/* <RootLayout> */}
            <div className="baseLayout">
                <div
                    style={{
                        minHeight: "90vh",
                    }}
                >
                    {children}
                </div>

                <Footer />
            </div>
        </>
    );
}
export default BaseLayout;
