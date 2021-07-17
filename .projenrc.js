const { AwsCdkTypeScriptApp, DependenciesUpgradeMechanism } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.114.0',
  defaultReleaseBranch: 'main',
  name: 'eks-mgng-tagging-name',
  authorName: 'Neil Kuan',
  authorEmail: 'guan840912@gmail.com',
  description: 'This repo is example for EKS Managed Node Group Instance Tagging Name via Launch Template `TagSpecifications` , before CloudFormation native support it.',
  repository: 'https://github.com/neilkuan/eks-mgng-tagging-name.git',
  cdkDependencies: [
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-iam',
    '@aws-cdk/core',
  ],
  depsUpgrade: DependenciesUpgradeMechanism.githubWorkflow({
    workflowOptions: {
      labels: ['auto-approve'],
      secret: 'AUTOMATION_GITHUB_TOKEN',
    },
  }),
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['neilkuan'],
  },
  deps: [
    'cdk8s-aws-load-balancer-controller',
    'constructs',
    'cdk8s',
  ],
  gitignore: ['cdk.out', 'images', 'cdk.context.json'],
  workflowBootstrapSteps: [
    {
      name: 'Install Helm',
      id: 'install_helm',
      run: `curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
helm repo add eks https://aws.github.io/eks-charts
helm repo update`,
    },
  ],
});
project.synth();