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
    export interface Article {
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
import { Article } from "@/types/types";

type Props = {
    articles: Article[];
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
                {articles.map((article: Article)=>{
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
    -   article の型を Article にしておく

### 4. PopularTags を取得する

Rails 側の準備は、Rails の README.md に記載

(1) Props に追記

```tsx
type Props = {
    articles: Article[];
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
