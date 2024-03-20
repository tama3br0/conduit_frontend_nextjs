import React from "react";
import Link from "next/link";
import Image from "next/image";

const Header: React.FC = () => {
    return (
        <header>
            <nav className="header-navbar">
                <div className="header-container">
                    <Link href="/" className="header-navbar-brand">
                        conduit
                    </Link>
                    <div className="header-nav-items">
                        <ul className="header-navbar-nav">
                            <li className="header-nav-item">
                                <Link href="/" className="header-nav-link">
                                    Home
                                </Link>
                            </li>
                            <li className="header-nav-item">
                                <Link
                                    href="/editor"
                                    className="header-nav-link"
                                >
                                    <i className="ion-compose" />
                                    &nbsp;New Article
                                </Link>
                            </li>
                            <li className="header-nav-item">
                                <Link
                                    href="/settings"
                                    className="header-nav-link"
                                >
                                    <i className="ion-gear-a" />
                                    &nbsp;Settings
                                </Link>
                            </li>
                            {/* <li className="header-nav-item">
                                <Link
                                    href="/profile/eric-simons"
                                    className="header-nav-link"
                                >
                                    <Image
                                    src="/path/to/profile-image.jpg"
                                    width={30}
                                    height={30}
                                    className="user-pic"
                                    alt="Profile Image"
                                />
                                    Eric Simons
                                </Link>
                            </li> */}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
