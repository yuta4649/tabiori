import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Network } from '../constructs/network';
import { Database } from '../constructs/database';
import { Storage } from '../constructs/storage';
import { Ecr } from '../constructs/ecr';
import { Application } from '../constructs/application';

export class TabioriStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Network(this, 'Network');
    new Database(this, 'Database');
    new Storage(this, 'Storage');
    new Ecr(this, 'Ecr');
    new Application(this, 'Application');
  }
}
