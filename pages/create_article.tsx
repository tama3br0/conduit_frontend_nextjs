import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Post.module.css";
import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Create() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    // const [tags, setTags] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // 統合するときに勝手にリロードされるのを防ぐ

        // console.log(title, description, body, tags); //<= この時点で、画面上で入力した文字列を取得できているかチェック

        // APIを叩く
        try {
            await axios.post("http://localhost:3000/api/articles", {
                title: title,
                description: description,
                body: body,
                // tag_list: tags,
            });
            // awaitが終わったらページ遷移
            router.push("/");
        } catch (error) {
            alert("このDIOが、投稿に失敗しただとーッ!?");
        }
    };

    return (
        <div>
            <Head>
                <title>新規投稿</title>
                <meta
                    name="description"
                    content="Create a new post on Conduit."
                />
            </Head>
            <Header />
            <div className={styles.createPage}>
                <div className={styles.container}>
                    <h1 className={styles.title}>新規投稿</h1>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.postLabel}>
                                タイトル
                            </label>
                            <input
                                type="text"
                                id="title"
                                className={styles.textInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setTitle(e.target.value)
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label
                                htmlFor="description"
                                className={styles.postLabel}
                            >
                                概要
                            </label>
                            <input
                                type="text"
                                id="description"
                                className={styles.textInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setDescription(e.target.value)
                                }
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="body" className={styles.postLabel}>
                                本文
                            </label>
                            <textarea
                                id="body"
                                rows={8}
                                className={styles.textArea}
                                onChange={(
                                    e: ChangeEvent<HTMLTextAreaElement>
                                ) => setBody(e.target.value)}
                            ></textarea>
                        </div>
                        {/* <div className={styles.formGroup}>
                            <label htmlFor="tags" className={styles.postLabel}>
                                タグ設定
                            </label>
                            <input
                                type="text"
                                id="tags"
                                className={styles.textInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setTags(e.target.value)
                                }
                            />
                            <small className={styles.small}>
                                タグは、コンマで区切って入力するのだッ
                            </small>
                        </div> */}
                        <button type="submit" className={styles.submitBtn}>
                            オラ！
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
