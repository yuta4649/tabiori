# tabiori

旅行の「計画 → 実行 → 記録」を一つにつなげる旅のしおり Web アプリ。

## リポジトリ構成

| ディレクトリ | 責務 |
|---|---|
| [`app/`](app) | Next.js アプリケーション。UI、API、Prisma スキーマとマイグレーション、Dockerfile、ローカル開発用 PostgreSQL |
| [`infra/`](infra) | AWS CDK（TypeScript）。VPC、Aurora、S3、ECR、ECS などの AWS リソース |

`app/` と `infra/` はそれぞれ独立したパッケージで、依存関係とロックファイルを別々に持つ。互いのコードを import しない。

## 開発環境

- Node.js 24.21.0（`.node-version`）。mise で切り替える
- pnpm 11.28.2（各パッケージの `packageManager`）

詳しくは [`app/README.md`](app/README.md) と [`infra/README.md`](infra/README.md) を参照。
