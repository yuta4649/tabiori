# tabiori app

tabiori の Web アプリケーション（Next.js App Router / TypeScript / Tailwind CSS v4 / Prisma 7 / PostgreSQL）。

AWS リソースはここでは扱わない。インフラは [`../infra`](../infra) を参照。

## 前提

- Node.js 24.21.0（リポジトリルートの `.node-version`。mise で切り替え）
- pnpm 11.28.2（`package.json` の `packageManager`。corepack で有効化）
- Docker（ローカル PostgreSQL 用）

## セットアップ

```bash
cp .env.example .env
pnpm install        # postinstall で Prisma Client を生成
pnpm db:up          # PostgreSQL を Docker Compose で起動
pnpm dev            # http://localhost:3000
```

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー |
| `pnpm build` / `pnpm start` | 本番ビルド / 起動 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | ルート型を生成して `tsc --noEmit` |
| `pnpm test` | Vitest（ユニットテスト） |
| `pnpm test:e2e` | Playwright（`pnpm db:up` 済みであること。初回は `pnpm exec playwright install chromium`） |
| `pnpm db:up` / `pnpm db:down` | PostgreSQL の起動 / 停止 |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:generate` | Prisma Client の再生成 |

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
  tabiori-app
```

環境変数は起動時に検証され、不正な場合はプロセスが終了コード 1 で終了する。
