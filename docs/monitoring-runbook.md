# Monitoring Runbook

## 1. 这是什么

这是本项目的可选本地监控栈，用于用 Prometheus + Grafana 监控 Spring Boot 后端指标。

它不是后端 Docker 部署；后端仍然在本机直接运行，Prometheus 和 Grafana 只是可选监控组件。

## 2. 前置条件

- 已安装 Docker Desktop 或 Docker Engine。
- 后端服务已本地启动在 8080 端口。
- `/actuator/prometheus` 可以访问。

## 3. 启动后端

在项目根目录执行：

```bash
mvn -f "backend/pom.xml" spring-boot:run
```

Windows PowerShell 也可以使用：

```powershell
mvn -f "backend\pom.xml" spring-boot:run
```

## 4. 验证后端指标

```bash
curl http://localhost:8080/actuator/prometheus
```

预期能看到类似指标：

```text
jvm_memory_used_bytes
http_server_requests_seconds_count
process_cpu_usage
```

## 5. 启动监控组件

```bash
cd deploy
docker compose -f docker-compose-monitor.yml up -d
```

如果使用旧版 Docker Compose：

```bash
docker-compose -f docker-compose-monitor.yml up -d
```

## 6. 访问地址

Prometheus:

```text
http://localhost:9090
```

Grafana:

```text
http://localhost:3000
```

Grafana 默认账号密码：

```text
admin / admin
```

## 7. 验证 Prometheus target

打开：

```text
http://localhost:9090/targets
```

确认 `little-tiktok` 是 `UP`。

## 8. Grafana 使用方法

打开：

```text
http://localhost:3000
```

使用 `admin / admin` 登录。

Prometheus 数据源应自动存在。如果没有，手动添加 Prometheus 数据源：

```text
URL = http://prometheus:9090
```

可以查询这些指标：

```text
http_server_requests_seconds_count
jvm_memory_used_bytes
process_cpu_usage
system_cpu_usage
```

## 9. 停止监控组件

保留 Grafana 数据：

```bash
cd deploy
docker compose -f docker-compose-monitor.yml down
```

删除 Grafana 数据卷：

```bash
cd deploy
docker compose -f docker-compose-monitor.yml down -v
```

## 10. 常见问题

### 问题 1：Prometheus target DOWN

可能原因：

- 后端没启动。
- 8080 端口不对。
- `/actuator/prometheus` 不能访问。
- Linux 不支持 `host.docker.internal`。

解决：

- 先访问 `http://localhost:8080/actuator/prometheus`。
- Linux 用户如果 `host.docker.internal` 不可用，把 `deploy/prometheus/prometheus.yml` 中的 target 改为宿主机 IP，例如 `172.17.0.1:8080` 或本机局域网 IP。

### 问题 2：Grafana 不能连 Prometheus

解决：

- Grafana 数据源 URL 使用 `http://prometheus:9090`，不要用 `localhost:9090`。
- 确认 Prometheus 和 Grafana 由同一个 `docker compose` 启动，并处在同一个 compose 网络里。

### 问题 3：端口冲突

解决：

- 如果 9090 或 3000 被占用，修改 `deploy/docker-compose-monitor.yml` 中端口映射左侧端口。
- 例如把 `9090:9090` 改为 `19090:9090`。

### 问题 4：后端指标没有业务接口数据

解决：

- 先访问几次业务接口，例如 `/api/v1/auth/login`。
- 再查询 `http_server_requests_seconds_count`。

## 11. 安全说明

- 当前配置只用于本地课程演示。
- 不要暴露 `/actuator/env`、`/actuator/beans`、`/actuator/configprops`。
- 不要把 `management.endpoints.web.exposure.include` 改成 `*`。
- 生产环境中 `/actuator/prometheus` 应该限制在内网或监控网络访问。
