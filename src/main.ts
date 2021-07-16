import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import { App, Construct, Stack, StackProps, CfnOutput, Tags } from '@aws-cdk/core';
import * as cdk8s from 'cdk8s';
import { VersionsLists, AwsLoadBalancePolicy } from 'cdk8s-aws-load-balancer-controller';
import { MyChartV2 } from './mychart';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'mgNamingVpc', { natGateways: 1 });

    const eksCluster = new eks.Cluster(this, 'mgNamingEks', {
      vpc,
      version: eks.KubernetesVersion.V1_20,
      clusterName: 'mgNamingEks',
      defaultCapacity: 0,
    });
    const userData = ec2.MultipartUserData.forLinux({ shebang: 'MIME-Version: 1.0' });
    userData.addCommands('Content-Type: multipart/mixed; boundary="//"', '', '--//');
    const lt = new ec2.LaunchTemplate(this, 'LaunchTemplate', {
      userData,
    });

    // Use TagSpecifications in LaunchTemplate give managed Node group instance name.
    Tags.of(lt).add('Name', 'MGCustomNG-T3Medium-SPOT');
    // EKS managed Node group.
    eksCluster.addNodegroupCapacity('MGNodegroupLTCustom', {
      nodegroupName: 'MGNodeGroupCustomSPOT',
      capacityType: eks.CapacityType.SPOT,
      instanceTypes: [new ec2.InstanceType('t3.medium')],
      desiredSize: 1,
      launchTemplateSpec: {
        id: lt.launchTemplateId!,
        version: lt.versionNumber,
      },
    });

    // Use Default EKS managed Node group, do not have instane Name tag.
    eksCluster.addNodegroupCapacity('MGNodegroupDefault', {
      nodegroupName: 'MGNodeGroupSPOTDefault',
      capacityType: eks.CapacityType.SPOT,
      instanceTypes: [new ec2.InstanceType('t3.small')],
      desiredSize: 1,
    });
    const sa = new eks.ServiceAccount(this, 'ALBIRSA', {
      cluster: eksCluster,
      namespace: 'kube-system',
      name: 'aws-load-balancer-controller',
    });
    AwsLoadBalancePolicy.addPolicy(VersionsLists.AWS_LOAD_BALANCER_CONTROLLER_POLICY_V2, sa.role);
    const myChart = new MyChartV2(new cdk8s.App(), 'ALBChart', {
      clusterName: eksCluster.clusterName,
    });
    const addCdk8sChart = eksCluster.addCdk8sChart('my-chart', myChart);
    addCdk8sChart.node.addDependency(sa);
    eksCluster.awsAuth.addUserMapping(iam.User.fromUserName(this, 'Neil', 'neilguan'), { username: 'neilguan', groups: ['system:masters'] });

    new CfnOutput(this, 'adminRoleName', {
      value: eksCluster.adminRole.roleName,
    });
  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'dev-eks-mg-naming', { env: devEnv });

app.synth();