import Link from "next/link";
import React from "react";

const Footer: React.FC = () => {
    return (
        <footer>
            <div className="footer-container">
                <Link href="/" className="footer-logo-font">
                    conduit
                </Link>
                <span className="footer-attribution">
                    An interactive learning project from{" "}
                    <Link href="https://thinkster.io" className="footer-link">
                        Thinkster
                    </Link>
                    . Code &amp; design licensed under MIT.
                </span>
            </div>
        </footer>
    );
};

export default Footer;
