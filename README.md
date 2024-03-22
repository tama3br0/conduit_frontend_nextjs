# Next.js と RailsAPI で Conduit を作ろう

### 1. Next.js を構築する

```bash
create-next-app .
```

-   TypeScript - Yes
-   ESLint - Yes
-   Tailswind - Yes
-   src/directory - No
-   App Router - No
-   @/alious - Np

### 2. ポート 3001 で起動できるようにする

Rails をポート 3000 で開くので、ポートの競合を避けるため、Next.js を 3001 ポートで開くようにする

-   package.json を開く

```json:package.json
    "scripts": {
        "dev": "next dev -p 3001", // "next dev"となっている箇所に、-p 3001を追記
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
    },
```

### 3. 投稿された記事を取得する index ページを作成する

-   投稿された記事を取得するための API を叩いていく
    -   SSG は、データの更新頻度が低いときに使うとパフォーマンスが上がる
    -   ブログ記事なので、1 日に 1 回更新する程度と考える　=>SSR か ISR を使うのが望ましい
        -   今回は ISR を採用する(１回ページを訪れた際は SSR で取得、それ以降同じページにアクセスする場合は SSG のように早く読み込むことができる)

```tsx
export async function getStaticProps() {
    const res = await fetch("http://localhost:3000/api/articles");
    const articles = await res.json();
}
```

-   ここで、API を叩いていく

    -   fetch の後ろは、エンドポイントの URL
    -   受け取ったデータ res を json 形式にして、articles という定数に代入
    -   return で返して、Home に props で渡したいので、次のように書いていく

            ```tsx
                export async function getStaticProps() {

                    const res = await fetch("http://localhost:3000/api/articles");
                    const articles = await res.json();

                    return {
                        props: {
                            articles,
                        },
                        revalidate: 60 *60 * 24; // これはISRの書き方。24hに1回、ISRが行われるという設定
                    };
                }
            ```

#### 細かく確かめよう！

-   ここまでの内容がしっかりと受け取れているかをコンソールで確かめる

```tsx
export async function getStaticProps() {
    const res = await fetch("http://localhost:3000/api/articles");
    const articles = await res.json();

    console.log(articles); // <=これで確かめる。backendとfrontendのサーバを起動してlocalhost:3001にアクセスした状態でターミナルを確認する。ここにデータが取れていれば成功

    return {
        props: {
            articles,
        },
        revalidate: 60 * 60 * 24,
    };
}
```

-   ここまで問題なくデータを取得できていたら、Home 関数の引数にプロップスとして{articles}を渡す

```tsx
export default function Home({ articles }) {
// 省略
```

-   TypeScript なので、型を定義する必要がある - 今回は、型定義用のファイルを作る - ルートディレクトリに types フォルダを作り、その中の types.ts ファイルで定義する

```ts:types.ts
    export interface ArticleTypes {
        id: string;
        title: string;
        description: string;
        body: string;
        created_at: string;
        updated_at: string;
        tag_list: string[];
        image_blob_id: string; // 画像の Blob ID を表すプロパティ
    }
```

-   index.tsx に戻る
-   今回、articles は配列で返ってくるので、新しく type Props という名前で type ファイルからインポートして定義する

```tsx
import { ArticleTypes } from "@/types/types";

type Props = {
    articles: ArticleTypes[];
};
```

-   articles は、Article の配列である、と定義している。
-   ここで定義した Props を、型として Home の引数に当てはめる

```tsx
export default function Home({ articles }: Props) {
// 省略
```

-   この後は、articles の中身を map 関数で展開していく

```tsx:index.tsx
export default function Home({ articles }: Props) {
    return (
            // 省略
            <div>
                {articles.map((article: ArticleTypes)=>{
                    return(
                        <div key={article.id}>

                        </div>
                    )
                })}
            </div>
    )
}
```

-   まず、div タグを作る
-   次に、map 関数を展開する
    -   articles の中身を article という形で展開していく
    -   article の型を ArticleTypes にしておく

### 4. PopularTags を取得する

Rails 側の準備は、Rails の README.md に記載

(1) Props に追記

```tsx
type Props = {
    articles: ArticleTypes[];
    popularTags: string[]; // Popular Tagsの型を追加
};
```

(2) コードの変更

```tsx:変更前
export async function getStaticProps() {
    const res = await fetch("http://localhost:3000/api/articles");

    const articles = await res.json();

    // console.log(articles);

    return {
        props: {
            articles,
        },
        revalidate: 60 * 60 * 24,
    };
}
```

```tsx:変更後
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
```

解説

-   最初の行では、fetch メソッドを使って http://localhost:3000/api/articles にリクエストを送ります。これは記事データを取得するための API エンドポイントです。

-   次に、fetch メソッドを使って http://localhost:3000/api/tags/popular にリクエストを送ります。これは Popular Tags を取得するための API エンドポイントです。

-   Promise.all メソッドは、与えられた Promise オブジェクトがすべて解決されるのを待ち、その後に 1 つの Promise を返します。これにより、複数の非同期処理を並列で実行し、それらの処理が完了するまで待機します。

-   最初の fetch メソッドの結果は articlesRes 変数に、2 番目の fetch メソッドの結果は popularTagsRes 変数にそれぞれ格納されます。

-   await Promise.all([...])は、並列で実行された Promise のすべての結果を配列として受け取ります。その結果をそれぞれの変数にデストラクチャリングして、それぞれのリクエストの結果を個別の変数に格納します。

-   articlesRes.json()と popularTagsRes.json()は、それぞれのレスポンスの JSON データを取得します。これにより、API からのレスポンスを JavaScript オブジェクトに変換します。

-   最終的に、articles 変数には記事のデータが、popularTags 変数には Popular Tags のデータが格納されます。これらの変数は、後でコンポーネント内で利用されます。

さらに、return 内のコードを次のように変更

```tsx
export default function Home({ articles, popularTags }: Props) {
    return (
        <>
            {/* 以前のコード */}
            <div className={styles.colMd3}>
                <div className={styles.sidebar}>
                    <p>Popular Tags</p>

                    <div className={styles.tagList}>
                        {popularTags.map((tag: string) => (
                            <Link key={tag} href="/" className={styles.tagPill}>
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            {/* 以前のコード */}
        </>
    );
}
```

### 5. Pagination を表示する

-   components/Pagination/Pagination.tsx を作成

```tsx
import Link from "next/link";
import { ArticleTypes } from "@/types/types";
import styles from "../../styles/Pagination.module.css";

const Pagination = ({ articles }: { articles: ArticleTypes[] }) => {
    // ページネーションのリンクを動的に生成する関数
    const renderPaginationLinks = () => {
        const totalPages = Math.ceil(articles.length / 10); // 10は1ページあたりの記事数
        const paginationLinks = [];

        for (let i = 1; i <= totalPages; i++) {
            paginationLinks.push(
                <li key={i} className={styles.pageItem}>
                    <Link href={`/?page=${i}`} className={styles.pageLink}>
                        {i}
                    </Link>
                </li>
            );
        }

        return paginationLinks;
    };

    return <ul className={styles.pagination}>{renderPaginationLinks()}</ul>;
};

export default Pagination;
```

-   Pagination.module.css を作成

```css
/* Pagination.module.css */

.pagination {
    display: flex;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 20px 0;
}

.pageItem {
    margin: 0 5px;
}

.pageLink {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    color: #333;
    text-decoration: none;
    transition: background-color 0.3s ease;
}

.pageLink:hover {
    background-color: #f0f0f0;
}
```

### 6. 詳細ページを作成する

(1) 動的ルーティングを入れる

-   pages ディレクトリ内に新しく articles というディレクトリを作り、Rails で設定した動的ルーティングを入れる
    -   pages/articles/[id].tsx

[]で囲むことで、id の部分が動的に変更される

-   [id].tsx にコードを書く際に、「rafce」と入力して Tab 補完すると早い

```tsx
import React from "react";

const Article = () => {
    return <div>詳細ページを作成中</div>;
};

export default Article;
```

-   動的ルーティングにおける ISR を設定する際には、getStaticProps だけでなく、getStaticPaths も設定する必要がある

(2) 詳細ページのエンドポイントを叩いていく

```tsx:[id].tsx
import React from "react";

export async function getStaticProps() {
    const res = await fetch(`http://localhost:3000/api/articles/${params.id}`); // バッククォーテーションで囲む

    const article = await res.json();

    return {
        props: {
            article,
        },
        revalidate: 60, // 1分ごとに設定
    };
}

const Article = () => {
    return <div>詳細ページを作成中</div>;
};

export default Article;
```

-   この時点では、まだ params を定義していないので、以下のように追記していく

```tsx
//TypeScriptなので、paramsのidのstringと型定義
export async function getStaticProps({ params }: { params: { id: string } }) {
    const res = await fetch(`http://localhost:3000/api/articles/${params.id}`);

    const articles = await res.json();

    return {
        props: {
            article,
        },
        revalidate: 60, // 1分ごとに設定
    };
}
// 以下略
```

-   次に、これを受け取るためにコードに追記していく

```tsx
// 型定義したファイルを参照
import { ArticleTypes } from "@/types/types";
import React from "react";

// Propsという型に代入
type Props = {
    article: ArticleTypes;
};

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

// ()内に書いて渡す
const Article = ({ article }: Props) => {
    return <div>詳細ページを作成中</div>;
};

export default Article;
```

-   しかし、この状態で/artiles/1 にアクセスしてもエラーが起きる
-   動的ルーティングを使用する場合は、getStaticPaths を設定しなければならない

(3) getStaticPaths の設定

-   エラー文にある公式ドキュメントにアクセスしてみる
-   Error: getStaticPaths is required for dynamic SSG pages and is missing for '/articles/[id]'.
    Read more: https://nextjs.org/docs/messages/invalid-getstaticpaths-value
-   上記サイトの paths 内に書かれているコードをコピーして貼り付ける

```tsx
import { ArticleTypes } from "@/types/types";
import React from "react";

type Props = {
    article: ArticleTypes;
};

//この位置に、ただ貼り付けただけ
//pages/blog/[slug].js
export async function getStaticPaths() {
    return {
        paths: [
            // String variant:
            "/blog/first-post",
            // Object variant:
            { params: { slug: "second-post" } },
        ],
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
    return <div>詳細ページを作成中</div>;
};

export default Article;
```

-   貼り付けたコードは例なので、書き換えていく必要がある。(pages/articles/[id].tsx の場合に書き換える)

```tsx
// pages/articles/[id].tsx
export async function getStaticPaths() {
    return {
        paths: [
            // Object variant:
            { params: { id: "/articles/6" } }, //<=
        ],
        fallback: true,
    };
}
```

-   この状態だと、id が 6 のページの path を参照している状態
-   投稿が増えるにつれて、この path も増えていく
-   そのため、この部分も API を叩いて変えていく

(4) 全てのブログ記事を取得する

-   まず、全てのブログの情報を取得する

```tsx
import { ArticleTypes } from "@/types/types";
import React from "react";

type Props = {
    article: ArticleTypes;
};

// pages/articles/[id].tsx
export async function getStaticPaths() {
    const res = await fetch("http://localhost:3000/api/articles");
    const articles: ArticleTypes[] = await res.json(); // 型定義をして、ArticleTypesを配列として持っておく

    return {
        paths: [
            // Object variant:
            { params: { id: "/articles/6" } },
        ],
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
    return <div>詳細ページを作成中</div>;
};

export default Article;
```

#### getStaticPaths の articles には型定義が必須で、getStaticProps の articles には型定義が不要な理由

getStaticPaths と getStaticProps は Next.js で使用される関数であり、それぞれ異なる目的を持っています。

1. getStaticPaths:

-   getStaticPaths は、動的なページのパスを生成するために使用されます。
-   この関数は、事前にビルド時にどのパスが生成されるかを指定します。
-   パスの生成には、データの取得が必要であり、そのためには型定義が必要です。
-   したがって、articles の型定義が必須です。

2. getStaticProps:

-   getStaticProps は、動的なページのデータを取得するために使用されます。
-   この関数は、指定されたパスに基づいてページのデータを取得し、そのデータをページコンポーネントに渡します。
-   これは、パスごとに異なるデータを取得するためのものであり、全てのページに共通のデータ型が必要ではありません。
-   従って、articles の型定義が必須ではありません。

3. まとめ
   つまり、getStaticPaths は動的なパスを生成するためにデータを取得し、そのデータの型を正確に把握する必要がありますが、getStaticProps は各ページのデータを取得するために使用されるため、ページごとに異なる型のデータを返す必要があるわけではありません。

(5) 取得したブログデータの id を map 関数で展開する

```tsx
export async function getStaticPaths() {
    const res = await fetch("http://localhost:3000/api/articles");
    const articles: ArticleTypes[] = await res.json();

    // 取得したデータのidを展開 toString()はrubyの.to_sと同じ
    const paths = articles.map((article) => {
        return {
            params: {
                id: article.id.toString(),
            },
        };
    });

    // つまり、↑のreturn内のコードが展開されていくと、↓のreturn内のようなコードとして読み込まれていく
    return {
        paths: [
            // Object variant:
            { params: { id: "/articles/6" } },
        ],
        fallback: true,
    };
}
```

-   というわけで

```tsx
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
        paths, // ここに、上で定義した定数のpathsを入れてあげればOK
        fallback: true,
        //fallbackにはfalse,blockingもある。trueだと「ページをすぐ返す」状態なので、最初に真っ白な空のページが出て、そのあと読み込まれたデータが描画される、という感じになる。そのため、「Loading...」のような画面を表示させて、読み込み中であることをユーザーに伝える方法もある。
    };
}
```

(6) fallback: true により、空のページが返ってきているときにだけ「ロード中」と表示させる

```tsx:[id].tsx
import { useRouter } from "next/router";

// 省略
const Article = ({ article }: Props) => {
    // Next.jsのuseRouterを使う
    const router = useRouter();

    // isFallbackという条件文があるので、それを使用。fallback中の時にLoadingと出す設定
    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    return <div>詳細ページを作成中</div>;
};

export default Article;
```

### 7. 詳細ページからコメントを入力・閲覧できるようにする

(1) services ディレクトリを作成し、その中に commentService.ts を作成

```ts
import { CommentTypes } from "../types/types";

// コメントを投稿するためのサービス
export const submitComment = async (comment: CommentTypes): Promise<void> => {
    const response = await fetch(
        `http://localhost:3000/api/articles/${comment.article_id}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(comment),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to submit comment");
    }
};

// コメントを削除するためのサービス
export const deleteComment = async (
    articleId: string,
    commentId: string
): Promise<void> => {
    const response = await fetch(
        `http://localhost:3000/api/articles/${articleId}/comments/${commentId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete comment");
    }
};
```

(2) types ディレクトリの types ファイル内に、CommentTypes を型定義

```ts
export interface ArticleTypes {
    id: string;
    title: string;
    description: string;
    body: string;
    created_at: string;
    updated_at: string;
    tag_list: string[];
    image_blob_id: string;
}

// 追記
export interface CommentTypes {
    id: number;
    content: string;
    author_name: string;
    article_id: number;
    created_at: string;
    updated_at: string;
}
```

(3) components ディレクトリ内に Article ディレクトリを作成し、そこに CommentForm.tsx と CommentList.tsx を作成

```tsx:CommentFrom.tsx
import React, { useState } from "react";
import { submitComment } from "../../services/commentService";
import styles from "../../styles/Comment.module.css";

type Props = {
    articleId: number;
};

const CommentForm: React.FC<Props> = ({ articleId }) => {
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitComment({
                content,
                author_name: authorName,
                article_id: articleId,
                id: 0,
                created_at: "",
                updated_at: "",
            });
            // コメント投稿後の処理を追加する場合はここに記述
            console.log("Comment submitted successfully!");
            // コメントフォームをクリア
            setContent("");
            setAuthorName("");

            // コメント投稿後に画面を更新する
            window.location.reload();
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="貴様の名前を入力するのだッ！"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <textarea
                    className={styles.textarea}
                    placeholder="好きにしゃべるがいいッ！"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <button className={styles.button} type="submit">
                    コメントを投稿するッ！
                </button>
            </div>
        </form>
    );
};

export default CommentForm;

```

```tsx:CommentList.tsx
import React from "react";
import { CommentTypes } from "../../types/types";
import styles from "../../styles/Comment.module.css";
import { deleteComment } from "../../services/commentService";

type Props = {
    comments: CommentTypes[];
};

const CommentList: React.FC<Props> = ({ comments }) => {
    const handleDelete = async (articleId: string, id: string) => {
        // 確認ダイアログを表示し、ユーザーが削除を確認した場合のみ削除を実行します
        const confirmDelete = window.confirm("なん…だと…ッ");
        if (!confirmDelete) {
            return; // ユーザーがキャンセルした場合は処理を中止します
        }

        try {
            await deleteComment(articleId, id);
            // コメントを削除した後、画面を更新するなどの処理を実行します。
            // 以下は画面の更新の例ですが、実際のアプリケーションに合わせて適切な処理を行ってください。

            // 画面を再読み込みする
            window.location.reload();

            // または、コメントを再取得して画面を更新するなど、アプリケーションの仕様に応じた処理を実行する
            // 例: fetchComments(); // コメントを再取得する関数を呼び出す（仮定）
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    return (
        <div className={styles.commentsContainer}>
            <h3 className={styles.heading}>Comments</h3>
            {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                    <p className={styles.content}>{comment.content}</p>
                    <p className={styles.author}>By: {comment.author_name}</p>
                    <button
                        onClick={
                            () => handleDelete(comment.article_id, comment.id) // idをstring型のまま渡す
                        }
                        className={styles.deleteButton}
                    >
                        削除
                    </button>
                    <div className={styles.horizontalLine}></div>
                </div>
            ))}
        </div>
    );
};

export default CommentList;

```

(4) [id].tsx ファイルを書き換える

```tsx
import React from "react";
import { CommentTypes } from "../../types/types";
import styles from "../../styles/Comment.module.css";
import { deleteComment } from "../../services/commentService";

type Props = {
    comments: CommentTypes[];
};

const CommentList: React.FC<Props> = ({ comments }) => {
    const handleDelete = async (articleId: string, id: string) => {
        // 確認ダイアログを表示し、ユーザーが削除を確認した場合のみ削除を実行します
        const confirmDelete = window.confirm("なん…だと…ッ");
        if (!confirmDelete) {
            return; // ユーザーがキャンセルした場合は処理を中止します
        }

        try {
            await deleteComment(articleId, id);
            // コメントを削除した後、画面を更新するなどの処理を実行します。
            // 以下は画面の更新の例ですが、実際のアプリケーションに合わせて適切な処理を行ってください。

            // 画面を再読み込みする
            window.location.reload();

            // または、コメントを再取得して画面を更新するなど、アプリケーションの仕様に応じた処理を実行する
            // 例: fetchComments(); // コメントを再取得する関数を呼び出す（仮定）
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    return (
        <div className={styles.commentsContainer}>
            <h3 className={styles.heading}>Comments</h3>
            {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                    <p className={styles.content}>{comment.content}</p>
                    <p className={styles.author}>By: {comment.author_name}</p>
                    <button
                        onClick={
                            () => handleDelete(comment.article_id, comment.id) // idをstring型のまま渡す
                        }
                        className={styles.btnOutlineDelete}
                    >
                        削除
                    </button>
                    <div className={styles.horizontalLine}></div>
                </div>
            ))}
        </div>
    );
};

export default CommentList;
```

### 8. 投稿ページの HTML 要素を作成する

今回は、このような感じで

```tsx:create_post.tsx
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Post.module.css";

export default function Create() {
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
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.postLabel}>
                                タイトル
                            </label>
                            <input
                                type="text"
                                id="title"
                                className={styles.textInput}
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
                            ></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="tags" className={styles.postLabel}>
                                タグ設定
                            </label>
                            <input
                                type="text"
                                id="tags"
                                className={styles.textInput}
                            />
                            <small className={styles.small}>
                                タグは、コンマで区切って入力するのだッ
                            </small>
                        </div>
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

```

### 9. 投稿ページから入力したデータが反映されるようにする

-   入力された文字列を取得する
    -   useState で状態(変数)を管理する。今回は、文字列を格納するためのフックス。
        -   バリデーションをかけたい場合は、useForm という React フックフォームがあるよ。
    -   onChange のプロパティで、入力されたら発火するプロパティを設定する
    -   変数を API と一緒に叩く

このような流れで設定する

(1) useState の準備

```tsx
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Post.module.css";
import { useState } from "react";

export default function Create() {
    // useStateの追加
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    const [tagList, setTagList] = useState("");
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
                    <form className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.postLabel}>
                                タイトル
                            </label>
                            <input
                                type="text"
                                id="title"
                                className={styles.textInput}
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
                            ></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="tags" className={styles.postLabel}>
                                タグ設定
                            </label>
                            <input
                                type="text"
                                id="tags"
                                className={styles.textInput}
                            />
                            <small className={styles.small}>
                                タグは、コンマで区切って入力するのだッ
                            </small>
                        </div>
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
```

(2) 値が入力されるたびに、setTitle などの中身を更新していく

```tsx
<input
    type="text"
    id="title"
    className={styles.textInput}
    onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
/>
```

-   インプットタグに onChange イベントを設定
-   (e)のトリガーを設定し、setTitle の e.target.value を変更するように設定
-   TypeScript なので、型タイプを指定 (e: Changeevent<HTMLInputElement>)

(3) 投稿ボタンを押したときに、API を叩いていけるようにする

-   まず、form タグに onSubmit で handleSubmit を渡す

```tsx
    <form className={styles.form} onSubmit={handleSubmit}>
```

-   次に、handleSubmit を定義する

```tsx
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/Post.module.css";
import { ChangeEvent, FormEvent, useState } from "react"; //<= ここに追加するのを忘れずに！

export default function Create() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    const [tags, setTags] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault(); // 統合するときに勝手にリロードされるのを防ぐ

        console.log(title, description, body, tags); //<= この時点で、画面上で入力した文字列を取得できているかチェック
    };

    return (
        <div>
            <Head>
                <title>新規投稿</title>
                // 以下略
```

(4) API を叩く際に、axios ライブラリ を使っていく

```bash
npm install axios
```

※tag_list 周りでエラーが発生したため、以降 tag_list 関連はコメントアウトした状態になっています

```tsx
// 省略
import axios from "axios";

export default function Create() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    // const [tags, setTags] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // 統合するときに勝手にリロードされるのを防ぐ

        // console.log(title, description, body, tags); //<= この時点で、画面上で入力した文字列を取得できているかチェック

        // APIを叩く
        try {
            // axiosのpostメソッドを使ってAPIを呼び出していく
            await axios.post("http://localhost:3000/api/articles", {
                // どの情報と一緒に使っていくかを設定
             // typesで設定した型：このページで使用する名前
                title: title,
                description: description,
                body: body,
             // tag_list: tags,
            });
        } catch (error) {
            alert("このDIOが、投稿に失敗しただとーッ!?");
        }
    };
```

-   これで、実際に入力したデータが一覧に掲載されるかを確かめる

(5) 投稿ボタンが押した後、一覧ページに遷移させる

-   useRouter を使う

```tsx
// 省略
import { useRouter } from "next/router";// <=ここに追記

export default function Create() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    // const [tags, setTags] = useState("");

    const router = useRouter(); // <=ここに追記

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

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
                // 以下略

```

### 10. 編集ページを作成する

(1) ディレクトリとファイルの作成

-   pages ディレクトリ内に edit_article というディレクトリを作成
-   edit_article ディレクトリ内に[id].tsx ファイルを作成
-   動的ルーティングにすることで、id によりページを動的に変えることができる
-   create_post.tsx と中身が似ているので、コピーしてから修正していく

(2) 修正箇所の確認

```tsx
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../styles/Post.module.css";
import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// 関数名をEditに変更
export default function Edit() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [body, setBody] = useState("");
    // const [tags, setTags] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // APIを叩く
        try {
            // putメソッドに修正　※この後ろのエンドポイントは(3)で解説
            await axios.put("http://localhost:3000/api/articles", {
                title: title,
                description: description,
                body: body,
                // tag_list: tags,
            });
            router.push("/");
        } catch (error) {
            alert("このDIOが、編集に失敗しただとーッ!?");
        }
    };

    return (
        <div>
            <Head>
                // タイトルを変更
                <title>投稿編集</title>
                <meta
                    name="description"
                    content="Create a new post on Conduit."
                />
            </Head>
            <Header />
            <div className={styles.createPage}>
                <div className={styles.container}>
                    <h1 className={styles.title}>投稿編集</h1>
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
                            オラオラ！
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
```

(3) 編集しようとするページの API の取得
① Rails の show アクションと同じようにすれば、固有のページ情報を取得できる

```tsx
export async function getServerSideProps(context: any) {
    const id = context.params.id;
}
```

このように書くことで、/1 だったら、id=1 の情報を取得できるようになる

② 次に

```tsx
export async function getServerSideProps(context: any) {
    const id = context.params.id;
    // idを使ってAPIを叩いていく
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();
}
```

このようにすることで、エンドポイントに id を使って表示できるようになる

③ さらに、これをプロップスで渡す必要があるので

```tsx
export async function getServerSideProps(context: any) {
    const id = context.params.id;
    // idを使ってAPIを叩いていく
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}
```

props の article という変数で渡すように設定

④ これを、Edit の引数として受け取る必要がるので

```tsx
export async function getServerSideProps(context: any) {
    const id = context.params.id;
    // idを使ってAPIを叩いていく
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}

export default function Edit({ article }) {
    // 以下略
```

⑤ TypeScript なので、型定義をする必要があるためあ

```tsx
import { ArticleTypes } from "@/types/types"; //<= 型定義したtypesファイルから読み込む

type Props = {
    article: ArticleTypes; //<= articleは、ArticleTypesを参照している
};

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    // idを使ってAPIを叩いていく
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}
                                        // それをPropsという形で渡す
export default function Edit({ article }: Props) {
    // 以下略
```

⑥ この{article}の中には、編集しようとしているブログのデータが入っている
そのため、useState に渡す初期値を変更

```tsx
import { ArticleTypes } from "@/types/types";

type Props = {
    article: ArticleTypes;
};

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}

export default function Edit({ article }: Props) {
                                        // このように初期値として、既存のデータをもたせる
    const [title, setTitle]             = useState(article.title);
    const [description, setDescription] = useState(article.description);
    const [body, setBody]               = useState(article.body);
    // const [tags, setTags] = useState("");

    const router = useRouter();
// 以下略
```

⑦ また、<input>にも value をもたせる

```tsx
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../styles/Post.module.css";
import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ArticleTypes } from "@/types/types";

type Props = {
    article: ArticleTypes;
};

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}

export default function Edit({ article }: Props) {
    const [title, setTitle] = useState(article.title);
    const [description, setDescription] = useState(article.description);
    const [body, setBody] = useState(article.body);

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            await axios.put("http://localhost:3000/api/articles", {
                title: title,
                description: description,
                body: body,
            });
            router.push("/");
        } catch (error) {
            alert("このDIOが、編集に失敗しただとーッ!?");
        }
    };

    return (
        <div>
            <Head>
                <title>投稿編集</title>
                <meta
                    name="description"
                    content="Create a new post on Conduit."
                />
            </Head>
            <Header />
            <div className={styles.createPage}>
                <div className={styles.container}>
                    <h1 className={styles.title}>投稿編集</h1>
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
                                value={title} //<=ここに追記
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
                                value={description} //<=ここに追記
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
                                value={body} //<=ここに追記
                            ></textarea>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            オラオラ！
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
```

⑨ put メソッドの後ろのエンドポイントを修正

```tsx
import { ArticleTypes } from "@/types/types";

type Props = {
    article: ArticleTypes;
};

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    const res = await fetch(`https://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}

export default function Edit({ article }: Props) {
    const [title, setTitle] = useState(article.title);
    const [description, setDescription] = useState(article.description);
    const [body, setBody] = useState(article.body);

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            await axios.put(`http://localhost:3000/api/articles/${article.id}`, {
                title: title,
                // 以下略
```

⑩ 細かいタイポがあったので修正

```tsx
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import styles from "../../styles/Post.module.css";
import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ArticleTypes } from "@/types/types";

type Props = {
    article: ArticleTypes;
};

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    // idを使ってAPIを叩いていく
    const res = await fetch(`http://localhost:3000/api/articles/${id}`);
    const article = await res.json();

    return {
        props: {
            article,
        },
    };
}

export default function Edit({ article }: Props) {
    const [title, setTitle] = useState(article.title);
    const [description, setDescription] = useState(article.description);
    const [body, setBody] = useState(article.body);
    // const [tags, setTags] = useState("");

    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); // 統合するときに勝手にリロードされるのを防ぐ

        // console.log(title, description, body, tags); //<= この時点で、画面上で入力した文字列を取得できているかチェック

        // APIを叩く
        try {
            await axios.put(
                `http://localhost:3000/api/articles/${article.id}`,
                {
                    title: title,
                    description: description,
                    body: body,
                    // tag_list: tags,
                }
            );
            // awaitが終わったらページ遷移
            router.push("/");
        } catch (error) {
            alert("このDIOが、編集に失敗しただとーッ!?");
        }
    };

    return (
        <div>
            <Head>
                <title>投稿編集</title>
                <meta
                    name="description"
                    content="Create a new post on Conduit."
                />
            </Head>
            <Header />
            <div className={styles.createPage}>
                <div className={styles.container}>
                    <h1 className={styles.title}>投稿編集</h1>
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
                                value={title}
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
                                value={description}
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
                                value={body}
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
                            オラオラ！
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
```

### 11. 一覧ページの Edit を押したら、10 で作ったページに遷移するように設定する

ボタンタグをリンクタグで囲んで、href 属性にテンプレートリテラルの形で書く

```tsx:index.tsx
// 省略
<Link href={`/edit_article/${article.id}`}>
    <button className={styles.btnOutlineEdit}>Edit</button>
</Link>
```

### 12. 一覧ページの Delete を押したら、記事を削除するように設定する

(1) 削除ボタンに onClick を設定し、引数に article.id を持たせる

```tsx:index.tsx
<button
    className={styles.btnOutlineDelete}
    onClick={() => handleDelete(article.id)}
>
    Delete
</button>
```

(2) 次に、handleDelete を定義する

```tsx:index.tsx
export default function Home({ articles, popularTags }: Props) {
    const handleDelete = (articleId: string) => {};
    return (
        <>
            <Head>
                <title>Conduit Home</title>
    // 以下略
```

(3) handleDelete の引数に articleId というのを設定。型は string

```tsx:index.tsx
import axios from "axios";// 忘れずに

export default function Home({ articles, popularTags }: Props) {
                        // asyncを追記
    const handleDelete = async (articleId: string) => {
        try {
            await axios.delete(`http:localhost:3000/api/article/${articleId}`);
        } catch (err) {
            alert("なにぃ!? 削除できないだと…ッ!!");
        }
    };
    // 以下略
```

(4) useRouter を使って、削除後にページをリロードするように設定

```tsx
import { useRouter } from "next/router"; // 忘れずに！

export default function Home({ articles, popularTags }: Props) {
    // ここで定義
    const router = useRouter();

    const handleDelete = async (articleId: string) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/articles/${articleId}`
            );
            // ここで使用
            router.reload();
        } catch (err) {
            alert("なにぃ!? 削除できないだと…ッ!!");
        }
    };
```

(5) 削除前に確認アラートを設定

```tsx
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
```
