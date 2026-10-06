import { Construct } from 'constructs';

export class Database extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // TODO: Aurora PostgreSQL Serverless v2（Isolated Subnet、ECS からのみ接続を許可）
  }
}
