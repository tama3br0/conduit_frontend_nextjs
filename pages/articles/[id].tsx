import { ArticleTypes, CommentTypes } from "@/types/types";
import { useRouter } from "next/router";
import React from "react";
import Image from "next/image";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/Show.module.css";
import Link from "next/link";
import CommentForm from "../../components/Article/CommentForm";
import CommentList from "../../components/Article/CommentList";
import axios from "axios";

type Props = {
    article: ArticleTypes;
    comments: CommentTypes[]; // コメントデータを含む
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
    const articleRes = await fetch(
        `http://localhost:3000/api/articles/${params.id}`
    );
    const article: ArticleTypes = await articleRes.json();

    // コメントデータを取得する
    const commentsRes = await fetch(
        `http://localhost:3000/api/articles/${params.id}/comments`
    );
    const comments: CommentTypes[] = await commentsRes.json();

    return {
        props: {
            article,
            comments, // コメントデータを含める
        },
        revalidate: 60, // 1分ごとに設定
    };
}

const Article = ({ article, comments }: Props) => {
    const handleDelete = async (articleId: string) => {
        try {
            if (confirm("貴様…ッ! 本当に消すつもりかアァァッ!!")) {
                await axios.delete(
                    `http://localhost:3000/api/articles/${articleId}`
                );

                // 削除に成功したらリロード
                router.push("/");
            }
        } catch (err) {
            alert("なにぃ!? 削除できないだと…ッ!!");
        }
    };

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
                                <div>
                                    <button
                                        className={styles.btnOutlineSecondary}
                                    >
                                        <i className={styles.ionRound} />
                                        Follow Eric Simons
                                        <span className={styles.counter}>
                                            (10)
                                        </span>
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className={styles.btnOutlinePrimary}
                                    >
                                        <i className={styles.ionHeart} />
                                        Favorite Post{" "}
                                        <span className={styles.counter}>
                                            (29)
                                        </span>
                                    </button>
                                </div>
                                <Link href={`/edit_article/${article.id}`}>
                                    <button className={styles.btnOutlineEdit}>
                                        <i className={styles.ionEdit} /> Edit
                                        Article
                                    </button>
                                </Link>
                                <div>
                                    <button
                                        className={styles.btnOutlineDelete}
                                        onClick={() => handleDelete(article.id)}
                                    >
                                        <i className={styles.ionTrash} /> Delete
                                        Article
                                    </button>
                                </div>
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
                                <div>
                                    <button
                                        className={styles.btnOutlineSecondary}
                                    >
                                        <i className={styles.ionRound} />
                                        Follow Eric Simons
                                        <span className={styles.counter}>
                                            (10)
                                        </span>
                                    </button>
                                </div>
                                <div>
                                    <button
                                        className={styles.btnOutlinePrimary}
                                    >
                                        <i className={styles.ionHeart} />
                                        Favorite Post{" "}
                                        <span className={styles.counter}>
                                            (29)
                                        </span>
                                    </button>
                                </div>
                                <Link href={`/edit_article/${article.id}`}>
                                    <button className={styles.btnOutlineEdit}>
                                        <i className={styles.ionEdit} /> Edit
                                        Article
                                    </button>
                                </Link>
                                <div>
                                    <button
                                        className={styles.btnOutlineDelete}
                                        onClick={() => handleDelete(article.id)}
                                    >
                                        <i className={styles.ionTrash} /> Delete
                                        Article
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        {/* コメントフォーム */}
                        <CommentForm articleId={parseInt(article.id)} />
                        {/* コメントリスト */}
                        <CommentList comments={comments} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Article;
