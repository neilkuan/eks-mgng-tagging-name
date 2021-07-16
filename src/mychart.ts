import * as cdk8s from 'cdk8s';
import { AwsLoadBalancerController } from 'cdk8s-aws-load-balancer-controller';
import * as constructs from 'constructs';

export interface MyChartV2Props {
  readonly clusterName: string;
}

export class MyChartV2 extends cdk8s.Chart {
  readonly deploymentName: string;
  readonly deploymentNameSpace: string;
  constructor(scope: constructs.Construct, id: string, props: MyChartV2Props) {
    super(scope, id);
    const alb = new AwsLoadBalancerController(this, 'alb', {
      clusterName: props.clusterName,
      createServiceAccount: false,
      namespace: 'kube-system',
    });
    this.deploymentName = alb.deploymentName;
    this.deploymentNameSpace = alb.namespace;
  }
}