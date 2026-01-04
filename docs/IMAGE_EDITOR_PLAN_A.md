# 方案A：轻量前端 + 开源后端 AI 的图片编辑器技术方案

## 概述
- 目标：在现有 Next.js + React 架构中实现功能全面的图片编辑器，满足抠图、局部重绘/消除、扩图、文字重绘、裁剪、标注与高质量导出等需求。
- 核心思想：前端保持轻量，采用 TUI Image Editor 作为画布与工具基础，结合 OpenCV.js 实现小范围即时修补；复杂与高质量的 AI 操作（去背景、inpaint/outpaint、文字重绘）通过后端开源服务（rembg、lama-cleaner、SDXL）实现，并由 Next.js API 路由统一代理与编排。
- 优点：开发成本低、上线快、体验好；前端不引入大模型，避免体积与兼容问题；接口抽象可平滑替换为商用 API。

## 架构设计
- 前端
  - 技术栈：Next.js + React + TUI Image Editor + OpenCV.js（按需加载）
  - 结构：节点工具栏入口 → 全屏 Dialog 承载编辑器 → 画布层（TUI） + 掩码交互 → 本地预览（OpenCV.js）与后端调用
  - 状态：节点数据包含当前图片 URL、编辑状态、撤销/重做缓冲；编辑器内部维护画布对象与历史栈
- 后端
  - Next.js API 路由：/api/image/* 统一入口，负责转发与编排
  - AI 服务（Docker，本地/内网）：
    - rembg（MIT）：去背景/抠图
    - lama-cleaner（Apache 2.0）：inpaint/outpaint/文字重绘
    - 可选：SDXL（文生图/重绘/扩图）
  - 媒体处理：sharp（WASM/Node）提供压缩、格式转换与元数据保留
- 存储
  - 输出图片压缩后上传至 CDN；保留必要的 EXIF/ICC

## 功能模块与实现
- 图片上传与基础处理
  - 支持 JPG/PNG/WEBP；沿用现有 ImageNode 与 useFileUpload 的上传逻辑
  - 全屏 Dialog 承载 TUI 画布，初始加载当前图片；编辑完成后导出并回写到节点
- 抠图（去背景）
  - 方案B：后端 rembg 服务，支持多模型（U2Net/ISNet 等）
  - 前端交互：可结合 SAM（后续）生成交互掩码作为先验区域，提升精度
  - API：POST /api/image/remove-bg（multipart: image），返回透明 PNG
- 局部重绘/消除
  - 前端：OpenCV.js inpaint（Telea/NS）用于小范围即时修补预览
  - 后端：lama-cleaner inpaint，提交 image+mask+参数，返回高质量修复结果
  - API：POST /api/image/inpaint（multipart: image, mask, prompt?）
- 智能扩图（outpainting）
  - 后端：lama-cleaner/SDXL 的 outpainting，支持预设比例（3:4/9:16/4:3/16:9）
  - 交互：用户选择目标比例，系统自动计算边界掩码并填充；可输入提示词引导生成
  - API：POST /api/image/outpaint（multipart: image, ratio, prompt?）
- 文字重绘
  - 后端：lama-cleaner/SD 提供文字区域重绘，前端以选区+文本提示提交
  - API：POST /api/image/text-inpaint（multipart: image, mask, text_prompt）
- 裁剪/旋转/镜像
  - 前端：TUI 内置工具，支持自由裁剪与比例锁定；旋转/镜像通过画布操作
- 标注系统
  - 矢量工具：箭头/矩形/圆形/文字；颜色/粗细/字体样式可调
  - 图层管理：图层列表、锁定/隐藏、顺序调整；标注与图像分层
  - 历史记录：操作级撤销/重做，支持会话内编辑回溯
- 输出功能
  - 导出：PNG/JPG/WEBP；原图/压缩两种模式
  - 元数据：提供保留 EXIF/ICC 选项；颜色管理保持一致
  - 上传：编辑完成后调用上传接口，将结果图推送至 CDN 并返回 URL

## API 设计（示例）
- 去背景
  - POST /api/image/remove-bg
  - 请求：FormData { image: File }
  - 响应：image/png（二进制）
- 局部重绘
  - POST /api/image/inpaint
  - 请求：FormData { image: File, mask: File, prompt?: string, strength?: number }
  - 响应：image/png（二进制）
- 扩图
  - POST /api/image/outpaint
  - 请求：FormData { image: File, ratio: '3:4'|'9:16'|'4:3'|'16:9', prompt?: string, strength?: number }
  - 响应：image/png（二进制）
- 文字重绘
  - POST /api/image/text-inpaint
  - 请求：FormData { image: File, mask: File, text_prompt: string }
  - 响应：image/png（二进制）
- 压缩与导出
  - POST /api/image/export
  - 请求：FormData { image: File, format: 'png'|'jpg'|'webp', quality?: number, keepMeta?: boolean }
  - 响应：image/{format}

## 前端交互与 UI 布局
- 入口：图片节点工具栏新增“编辑图片”按钮，点击打开全屏 Dialog
- 编辑器区域：左侧画布（TUI），右侧工具面板（工具、样式、图层、历史）
- 工具栏：裁剪/旋转/镜像、画笔/擦除、标注（箭头/矩形/圆形/文字）、掩码模式切换、AI 操作（去背景/修复/扩图/文字重绘）
- 预览与应用：OpenCV.js 实时预览小范围修补；“应用”按钮触发后端 AI，异步返回结果并替换画布
- 历史：提供撤销/重做；保存时生成快照，可回滚

## 数据流与状态管理
- 节点状态：imageUrl、editing（是否编辑中）、historyStack（撤销/重做）、layers（图层列表）
- 编辑器内部：TUI Image Editor 管理画布与对象；自定义插件负责掩码生成与工具联动
- API 调用：封装统一的 imageService，负责构建 FormData、处理响应与错误、更新节点状态

## 性能优化
- 资源按需加载：TUI 与 OpenCV.js 懒加载；AI 操作为后端执行减少前端体积
- 画布优化：尽量使用矢量标注与局部重绘；导出时再合成栅格图像
- 并发与排队：后端 API 设置队列与并发限制；前端显示加载进度与取消操作
- 缓存：对 AI 结果进行 CDN 缓存；常用比例的 outpaint 可做二次加工缓存

## 安全与合规
- 输入校验：限制文件类型与大小；防止恶意 payload
- 隐私：服务端不存储用户原图与掩码（除非用户选择保存）；数据在内网传输
- 许可：所用开源库遵守其许可证（TUI MIT、rembg MIT、lama-cleaner Apache 2.0、OpenCV Apache 2.0）
- 审计：记录关键操作与错误日志，便于问题定位

## 部署与环境
- 前端：Next.js 打包；OpenCV.js 与编辑器组件按需加载
- 后端：Docker 部署 rembg 与 lama-cleaner；Next.js API 路由代理本地服务
- 配置：通过 .env 配置服务地址、超时与鉴权（如后续接入商用 API）

## 兼容性与测试
- 浏览器支持：现代浏览器（Chrome/Edge/Firefox/Safari）；移动端限制高级编辑能力，优先基础操作
- 测试策略：
  - 单元测试：imageService、掩码生成与导出
  - 集成测试：Dialog 打开/关闭、工具栏操作、API 响应与错误处理
  - 视觉与性能：不同分辨率与比例的 outpaint/inpaint 效果评估
  - 兼容测试：跨浏览器交互与文件下载/上传的行为验证

## 实施步骤与里程碑
- 里程碑 1：搭建编辑器容器（全屏 Dialog）与 TUI 集成；实现裁剪/旋转/镜像/标注/图层/历史
- 里程碑 2：接入 OpenCV.js 实时 inpaint；实现掩码画笔与擦除预览
- 里程碑 3：后端 API 代理与服务部署（rembg、lama-cleaner）；实现去背景与 inpaint
- 里程碑 4：实现 outpaint（预设比例与提示词）；实现文字重绘
- 里程碑 5：导出与上传（sharp 压缩、格式与元数据选项）；CDN 工作流与结果管理
- 里程碑 6：稳定性与性能优化；跨浏览器测试与问题修复

## 风险与应对
- 模型性能与质量：后端模型可替换；为 outpaint 与文字重绘提供 prompt 引导与参数调整
- 大图与内存：限制最大画布尺寸；必要时先降采样处理，再导出原尺寸复合
- 交互复杂度：工具分组与渐进暴露；为高级功能提供说明与示例
- 第三方 API 替换：统一接口抽象，随时替换为 Remove.bg 等商用服务

