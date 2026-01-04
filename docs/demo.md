
**依赖审查与兼容性结论**
- 现有依赖：Next 14.2、React 18、MUI、Lexical、Tailwind、@xyflow/react；未引入 Fabric/Konva/TUI/OpenCV。
- 建议引入：
  - TUI Image Editor（MIT）：纯前端、基于 fabric.js，适合以全屏 Dialog 挂载；与 React 18/Next 14兼容，需在客户端组件中初始化，CSS按需引入，避免 SSR。
  - OpenCV.js（Apache 2.0）：按需异步加载（wasm），仅在“擦除预览/小范围修补”使用，避免首次渲染体积压力。
  - 后端 AI 服务通过独立容器（rembg、lama-cleaner），不增加前端依赖；Next API 路由代理调用。
- 兼容性要点：
  - 使用 “use client” 组件与动态导入，确保 TUI/OpenCV 在客户端初始化，避免 SSR 报错。
  - TUI 需要其样式资源与依赖（fabric）正确打包；Next 中可通过 import 或在 Dialog 打开时动态加载。
  - 与 Tailwind/MUI 共存无冲突；注意 z-index 层级与 Portal 渲染（沿用现有 FullscreenDialog 方案）。

**分阶段 Todo 清单**
- 基础功能
  - 在图片节点工具栏新增“编辑图片”入口（打开全屏 Dialog）
  - 在全屏 Dialog 中挂载 TUI Image Editor，完成图片导入/导出
  - 实现裁剪/旋转/镜像，支持比例锁定（3:4/9:16/4:3/16:9）
  - 实现矢量标注（箭头/矩形/圆形/文字）与样式（颜色/粗细/字体）
  - 增加图层管理（显示/隐藏/锁定/顺序调整）与历史记录（撤销/重做）

- 增强功能
  - 集成擦除工具与掩码画笔，支持笔触大小（3px-50px）
  - 接入 OpenCV.js inpaint 做小范围实时预览
  - 新增 Next API 路由：/api/image/remove-bg、/api/image/inpaint、/api/image/outpaint、/api/image/text-inpaint
  - 对接 rembg（去背景）并在编辑器内回填结果
  - 对接 lama-cleaner（inpaint/outpaint/文字重绘），支持提示词与强度参数
  - 扩图（outpainting）实现预设比例与智能填充

- 输出与存储
  - 图片导出：PNG/JPG/WEBP，原图/压缩两种模式
  - 服务端用 sharp 压缩与元数据保留选项（EXIF/ICC）
  - 上传到 CDN，并在节点中回写 URL 与历史快照

- 质量保障
  - 交互与性能优化：资源按需加载、Loading 状态、取消能力
  - 跨浏览器兼容测试（Chrome/Edge/Firefox/Safari）
  - 错误处理与日志：API 失败提示与重试策略

如果你确认以上拆解没有问题，我将按“基础功能”阶段开始实施：先接入全屏 Dialog 中的 TUI Image Editor，打通导入/导出与裁剪/旋转/镜像，再逐步增加标注、图层与历史。