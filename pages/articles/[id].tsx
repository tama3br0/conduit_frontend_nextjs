import { ArticleTypes } from "@/types/types";
import { useRouter } from "next/router";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../../styles/Show.module.css";
import Link from "next/link";

type Props = {
    article: ArticleTypes;
};

// pages/articles/[id].tsx
export async function getStaticPaths() {
    const res = await fetch("http://localhost:3000/api/articles");
    const articles: ArticleTypes[] = await res.json();

    const paths = articles.map((article) => {
        return {
            params: {
                id: article.id.toString(),
            },
        };
    });

    return {
        paths,
        fallback: true,
    };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
    const res = await fetch(`http://localhost:3000/api/articles/${params.id}`);

    const article = await res.json();

    return {
        props: {
            article,
        },
        revalidate: 60, // 1分ごとに設定
    };
}

const Article = ({ article }: Props) => {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className={styles.articlePage}>
                <div className={styles.banner}>
                    <div className={styles.container}>
                        <h1>{article.title}</h1>
                        <div className={styles.articleMeta}>
                            <Link href="/profile/eric-simons">
                                <img src="http://i.imgur.com/Qr71crq.jpg" />
                            </Link>
                            <div className={styles.info}>
                                <Link
                                    href="/profile/eric-simons"
                                    className={styles.author}
                                >
                                    Eric Simons
                                </Link>
                                <span className={styles.date}>
                                    {article.created_at}
                                </span>
                            </div>
                            <div className={styles.buttonContainer}>
                                <button className={styles.btnOutlineSecondary}>
                                    <i className={styles.ionRound} />
                                    Follow Eric Simons
                                    <span className={styles.counter}>(10)</span>
                                </button>
                                <button className={styles.btnOutlinePrimary}>
                                    <i className={styles.ionHeart} />
                                    Favorite Post{" "}
                                    <span className={styles.counter}>(29)</span>
                                </button>
                                <button className={styles.btnOutlineEdit}>
                                    <i className={styles.ionEdit} /> Edit
                                    Article
                                </button>
                                <button className={styles.btnOutlineDelete}>
                                    <i className={styles.ionTrash} /> Delete
                                    Article
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.containerPage}>
                    <div className={styles.articleContent}>
                        <div className={styles.colMd12}>
                            <p>
                                {article.body.split("\n").map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </p>
                            <ul className={styles.tagList}>
                                <li className={styles.tagPill}>realworld</li>
                                <li className={styles.tagPill}>
                                    implementations
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.horizontalLine}></div>

                    <div className={styles.articleActions}>
                        <div className={styles.articleMeta}>
                            <Link href="profile.html">
                                <img src="http://i.imgur.com/Qr71crq.jpg" />
                            </Link>
                            <div className={styles.info}>
                                <Link href="" className={styles.author}>
                                    Eric Simons
                                </Link>
                                <span className={styles.date}>
                                    January 20th
                                </span>
                            </div>
                            <div className={styles.buttonContainer}>
                                <button className={styles.btnOutlineSecondary}>
                                    <i className={styles.ionRound} />
                                    Follow Eric Simons
                                </button>
                                <button className={styles.btnOutlinePrimary}>
                                    <i className={styles.ionHeart} />
                                    Favorite Article{" "}
                                    <span className="counter">(29)</span>
                                </button>
                                <button className={styles.btnOutlineEdit}>
                                    <i className={styles.ionEdit} /> Edit
                                    Article
                                </button>
                                <button className={styles.btnOutlineDelete}>
                                    <i className={styles.ionTrash} /> Delete
                                    Article
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.colXs12}>
                            <form className={styles.commentFrom}>
                                <div className={styles.cardBlock}>
                                    <textarea
                                        className={styles.formControl}
                                        placeholder="Write a comment..."
                                        rows={3}
                                        defaultValue={""}
                                    />
                                </div>
                                <div className={styles.cardFooter}>
                                    <img
                                        src="http://i.imgur.com/Qr71crq.jpg"
                                        className={styles.commentAuthorImg}
                                    />
                                    <button className={styles.btnPrimary}>
                                        Post Comment
                                    </button>
                                </div>
                            </form>
                            <div className={styles.card}>
                                <div className={styles.cardBlock}>
                                    <p className={styles.cardText}>
                                        With supporting text below as a natural
                                        lead-in to additional content.
                                    </p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <Link
                                        href="/profile/author"
                                        className={styles.commentAuthor}
                                    >
                                        <img
                                            src="http://i.imgur.com/Qr71crq.jpg"
                                            className={styles.commentAuthorImg}
                                        />
                                    </Link>
                                    &nbsp;
                                    <Link
                                        href="/profile/jacob-schmidt"
                                        className={styles.commentauthor}
                                    >
                                        Jacob Schmidt
                                    </Link>
                                    <span className={styles.datePosted}>
                                        Dec 29th
                                    </span>
                                </div>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.cardBlock}>
                                    <p className={styles.cardText}>
                                        With supporting text below as a natural
                                        lead-in to additional content.
                                    </p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <Link
                                        href="/profile/author"
                                        className={styles.commentAuthor}
                                    >
                                        <img
                                            src="http://i.imgur.com/Qr71crq.jpg"
                                            className={styles.commentAuthorImg}
                                        />
                                    </Link>
                                    &nbsp;
                                    <Link
                                        href="/profile/jacob-schmidt"
                                        className={styles.commentAuthor}
                                    >
                                        Jacob Schmidt
                                    </Link>
                                    <span className={styles.datePosted}>
                                        Dec 29th
                                    </span>
                                    <span className={styles.modOptions}>
                                        <i className={styles.ionTrash} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Article;
