// import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArticleTypes } from "@/types/types";
import Pagination from "../components/Pagination/Pagination"; // Paginationをインポート
import axios from "axios";
import { useRouter } from "next/router";

type Props = {
    articles: ArticleTypes[];
    popularTags: string[]; // Popular Tagsの型を追加
};

export async function getStaticProps() {
    const [articlesRes, popularTagsRes] = await Promise.all([
        fetch("http://localhost:3000/api/articles"),
        fetch("http://localhost:3000/api/tags/popular"), // Popular Tagsを取得するAPIエンドポイントを追加
    ]);

    const [articles, popularTags] = await Promise.all([
        articlesRes.json(),
        popularTagsRes.json(),
    ]);

    return {
        props: {
            articles,
            popularTags: popularTags.popular_tags, // Popular Tagsをpropsに追加
        },
        revalidate: 60 * 60 * 24,
    };
}

export default function Home({ articles, popularTags }: Props) {
    const router = useRouter();

    const handleDelete = async (articleId: string) => {
        try {
            if (confirm("貴様…ッ! 本当に消すつもりかアァァッ!!")) {
                await axios.delete(
                    `http://localhost:3000/api/articles/${articleId}`
                );

                // 削除に成功したらリロード
                router.reload();
            }
        } catch (err) {
            alert("なにぃ!? 削除できないだと…ッ!!");
        }
    };
    return (
        <>
            <Head>
                <title>Conduit Home</title>
                <meta
                    name="description"
                    content="This is my page description."
                />
            </Head>
            <Header />
            <div className={styles.homePage}>
                <div className={styles.banner}>
                    <div className={styles.container}>
                        <h1 className={styles.logoFont}>conduit</h1>
                        <p>A place to share your knowledge.</p>
                    </div>
                </div>

                <div className={styles.containerPage}>
                    <div className={styles.row}>
                        <div className={styles.colMd9}>
                            <div className={styles.feedToggle}>
                                <ul className={styles.navPills}>
                                    <li className={styles.navItem}>
                                        <Link
                                            href="/"
                                            className={styles.navItem}
                                        >
                                            Your Feed
                                        </Link>
                                    </li>
                                    <li className={styles.navItem}>
                                        <Link
                                            href="/"
                                            className={styles.navItem}
                                        >
                                            Global Feed
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.horizontalLine}></div>

                            <div className={styles.contentWrapper}>
                                <div className={styles.articlePreview}>
                                    <div className={styles.articleMeta}>
                                        <Link href="/profile/eric-simons">
                                            <img
                                                src="http://i.imgur.com/Qr71crq.jpg"
                                                alt="eric_simons"
                                                width={30}
                                                height={30}
                                            />
                                        </Link>
                                        <div className={styles.info}>
                                            <Link
                                                href="/profile/eric-simons"
                                                className={styles.author}
                                            >
                                                Eric Simons
                                            </Link>
                                            <span className={styles.date}>
                                                January 20th
                                            </span>
                                        </div>
                                        <div className={styles.btnLikesWrapper}>
                                            <button className={styles.btnLikes}>
                                                <i
                                                    className={styles.ionHeart}
                                                ></i>{" "}
                                                29
                                            </button>
                                        </div>
                                    </div>

                                    {articles.map((article: ArticleTypes) => {
                                        return (
                                            <div
                                                key={article.id}
                                                className={styles.articleCard}
                                            >
                                                <Link
                                                    href={`articles/${article.id}`}
                                                    className={
                                                        styles.previewLink
                                                    }
                                                >
                                                    <h1>{article.title}</h1>
                                                    <p>{article.description}</p>
                                                    <div
                                                        className={
                                                            styles.tagLists
                                                        }
                                                    >
                                                        <span>
                                                            Read more...
                                                        </span>
                                                        {/* <ul
                                                            className={
                                                                styles.tagList
                                                            }
                                                        >
                                                            {article.tag_list.map(
                                                                (
                                                                    tag: string,
                                                                    index: number
                                                                ) => {
                                                                    return (
                                                                        <li
                                                                            key={
                                                                                index
                                                                            }
                                                                            className={
                                                                                styles.tagOutline
                                                                            }
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </li>
                                                                    );
                                                                }
                                                            )}
                                                        </ul> */}
                                                        <Link
                                                            href={`/edit_article/${article.id}`}
                                                        >
                                                            <button
                                                                className={
                                                                    styles.btnOutlineEdit
                                                                }
                                                            >
                                                                Edit
                                                            </button>
                                                        </Link>
                                                        <button
                                                            className={
                                                                styles.btnOutlineDelete
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    article.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </Link>
                                                <span>
                                                    {article.created_at}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* <div className={styles.colMd3}>
                                    <div className={styles.sidebar}>
                                        <p>Popular Tags</p>

                                        <div className={styles.tagList}>
                                            {popularTags.map((tag: string) => (
                                                <Link
                                                    key={tag}
                                                    href="/"
                                                    className={styles.tagPill}
                                                >
                                                    {tag}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            <div className={styles.horizontalLine}></div>

                            <Pagination articles={articles} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
