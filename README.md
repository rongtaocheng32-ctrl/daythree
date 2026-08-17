# DayThree（今日三件事）

DayThree 是一个无需注册、无需服务器的个人计划网页。它解决传统待办列表越积越长的问题：每天只聚焦三件重要的事，同时用最近七天打卡保持少量习惯。

## 主要功能

- 固定三项今日重点，支持勾选完成并显示总体进度。
- 创建和删除习惯，查看最近七天打卡以及从今天起倒推的连续天数。
- 今日复盘文本自动保存。
- 所有数据保存在浏览器 `localStorage`，不上传服务器。
- 支持完整数据导出与 JSON 文件导入。
- 响应式布局，适配桌面和手机浏览器。

## 安装方法

项目没有构建依赖。克隆后用任意静态文件服务器运行：

```bash
git clone https://github.com/rongtaocheng32-ctrl/daythree.git
cd daythree
python3 -m http.server 8000
```

然后打开 <http://localhost:8000>。

## 使用方法

1. 在三个输入框中填写当天最重要的三件事。
2. 完成后点击左侧圆圈，顶部进度会同步更新。
3. 输入习惯名称并点击“添加”，在日期格上打卡。
4. 在“今日复盘”记录总结，关闭页面后内容仍会保留。
5. 使用“导出 JSON”备份；使用“导入 JSON”恢复。

## 输入输出示例

输入：

```text
今日重点 1：整理产品需求
习惯：阅读 20 分钟
打卡日期：今天
```

页面输出：

```text
完成进度：1 / 1
习惯：阅读 20 分钟
连续记录：连续 1 天
```

导出的 JSON 包含 `priorities`、`habits`、`note` 和 `exportedAt` 字段。

## 开源与来源

本项目使用 MIT License。产品方向参考了 Nicolas Panozo 的 MIT 开源项目 [react-habit-tracker](https://github.com/nicopanozo/react-habit-tracker)，界面和代码均为 DayThree 独立实现，未复制原项目品牌素材。
