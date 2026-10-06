# tabiori app

tabiori の Web アプリケーション（Next.js App Router / TypeScript / Tailwind CSS v4 / Prisma 7 / PostgreSQL）。

AWS リソースはここでは扱わない。インフラは [`../infra`](../infra) を参照。

## 前提

- Node.js 24.21.0（リポジトリルートの `.node-version`。mise で切り替え）
- pnpm 11.28.2（`package.json` の `packageManager`。corepack で有効化）
- Docker（ローカル PostgreSQL 用）

## セットアップ

```bash
cp .env.example .env  # BETTER_AUTH_SECRET に `openssl rand -base64 32` の値を設定する
pnpm install          # postinstall で Prisma Client を生成
pnpm db:up            # PostgreSQL を Docker Compose で起動
pnpm db:migrate       # マイグレーションを適用し、Prisma Client を再生成
pnpm user:create --email you@example.com --name あなた  # ログイン用ユーザーを作成（パスワードは対話入力）
pnpm dev              # http://localhost:3000
```

## 認証

- Better Auth のメールアドレス + パスワード認証。画面からの新規登録は無効にしている
- ユーザーは `pnpm user:create` で作成する。既存のメールアドレスを指定するとパスワードを更新する
- 未ログインでアクセスすると `/login?next=...` に移動し、ログイン後は元のページ（指定がなければ `/trips`）に戻る
- 旅行データへのアクセス範囲は `src/server/authz.ts` に集約している。queries と Server Actions は必ず `requireUser()` とこの条件を通す
- スマホ実機から LAN の IP アドレスでアクセスする場合は、そのオリジンを `BETTER_AUTH_TRUSTED_ORIGINS` に追加する

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー |
| `pnpm build` / `pnpm start` | 本番ビルド / 起動 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | ルート型を生成して `tsc --noEmit` |
| `pnpm test` | Vitest。`*.db.test.ts`（認可の結合テスト）はローカルの PostgreSQL を使う |
| `pnpm test:e2e` | Playwright。テストユーザー（`*@tabiori.test`）を自動作成する（初回は `pnpm exec playwright install chromium`） |
| `pnpm user:create` | ログイン用ユーザーの作成・パスワード更新 |
| `pnpm db:up` / `pnpm db:down` | PostgreSQL の起動 / 停止 |
| `pnpm db:migrate` | `prisma migrate dev` の後に `prisma generate`（Prisma 7 は自動生成しないため） |
| `pnpm db:generate` | Prisma Client の再生成 |

## 画面

| パス | 画面 |
|---|---|
| `/login` | ログイン |
| `/trips` | 旅行一覧（旅行中 / これから / 過去） |
| `/trips/new` | 旅行を作成 |
| `/trips/[tripId]` | しおり（旅行概要・日付ごとのスケジュール・行きたい場所） |
| `/trips/[tripId]/edit` | 旅行の編集・削除 |
| `/trips/[tripId]/places/new`, `/places/[placeId]/edit` | 行きたい場所の追加・編集・削除 |
| `/trips/[tripId]/schedule/new`, `/schedule/[itemId]/edit` | 予定の追加・編集・削除 |

## ヘルスチェック

| パス | 用途 |
|---|---|
| `/api/health` | ALB 用。DB には触れない（Aurora Serverless v2 の自動一時停止を妨げないため） |
| `/api/health/db` | DB 接続確認。`SELECT 1` を実行し、失敗時は 503 |

## Docker

```bash
docker build -t tabiori-app .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=postgresql://tabiori:tabiori@host.docker.internal:5432/tabiori \
  -e BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  tabiori-app
```

環境変数は起動時に検証され、不正な場合はプロセスが終了コード 1 で終了する。
