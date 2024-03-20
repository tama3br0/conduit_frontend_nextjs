// create.tsx
import Head from "next/head";
import Header from "./components/Header";
import Footer from "./components/Footer";
import styles from "../styles/Post.module.css"; // Import Post styles

export default function Create() {
    return (
        <>
            <Head>
                <title>Create Post - Conduit</title>
                <meta
                    name="description"
                    content="Create a new post on Conduit."
                />
            </Head>
            <Header />
            <div className={styles.createPage}>
                <div className={styles.container}>
                    <h1>Create a New Post</h1>
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.postLabel}>
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label
                                htmlFor="content"
                                className={styles.postLabel}
                            >
                                Content
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                rows={8}
                                className={styles.textArea}
                            ></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="tags" className={styles.postLabel}>
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                className={styles.textInput}
                            />
                            <small className={styles.small}>
                                Separate tags with commas
                            </small>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Publish
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}
