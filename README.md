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
