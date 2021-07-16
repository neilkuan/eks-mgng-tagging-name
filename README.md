# Tagging Name Console screen shot.
![](./have-name-vs-not-have-name.png)

# example install echo Server.
[source](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/examples/echo_server/) 
```bash
# before check aws-load-balancer-controller install success.

$ kubectl  get sa,deploy -l app.kubernetes.io/name=aws-load-balancer-controller  -A
---
NAMESPACE     NAME                                          SECRETS   AGE
kube-system   serviceaccount/aws-load-balancer-controller   1         7m30s

NAMESPACE     NAME                                           READY   UP-TO-DATE   AVAILABLE   AGE
kube-system   deployment.apps/aws-load-balancer-controller   2/2     2            2           7m13s
```

## Deploy the echoserver resources
1. Deploy all the echoserver resources (namespace, service, deployment)
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.0.0/docs/examples/echoservice/echoserver-namespace.yaml &&\
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.0.0/docs/examples/echoservice/echoserver-service.yaml &&\
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.0.0/docs/examples/echoservice/echoserver-deployment.yaml
```
2. List all the resources to ensure they were created.
```bash
kubectl get -n echoserver deploy,svc
$ kubectl get -n echoserver deploy,svc
------
NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/echoserver   1/1     1            1           19s

NAME                 TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/echoserver   NodePort   172.20.170.103   <none>        80:31445/TCP   22s
```
## Deploy ingress for echoserver use local [echoserver-ingress.yaml](./echoserver-ingress.yaml)
```bash
$ kubectl apply -f ./echoserver-ingress.yaml
```

### Clear Up
```bash
kubectl delete ing echoserver -n echoserver

kubectl -n echoserver delete deploy/echoserver svc/echoserver

kubectl delete ns echoserver
```