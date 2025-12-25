

## 新的文件结构

```
src/lib/
├── types/                    # TypeScript 类型定义
│   ├── auth.ts              # 认证相关类型（TokenResponse, LoginCredentials, ApiRequestOptions）
│   ├── ai.ts                # AI模型相关类型（AIModel, AIModelListResponse, ParameterSchema 等）
│   └── index.ts             # 类型统一导出
│
├── utils/                    # 工具函数
│   ├── token.ts             # Token 管理工具函数
│   │   ├── getAccessToken()
│   │   ├── getRefreshToken()
│   │   ├── saveTokens()
│   │   ├── clearTokens()
│   │   ├── refreshAccessToken()
│   │   └── isUserLoggedIn()
│   └── index.ts             # 工具函数统一导出
│
└── api/                      # API 请求接口
    ├── client.ts            # API 请求客户端（核心 apiRequest 函数）
    ├── auth.ts              # 用户认证相关 API
    │   ├── loginUser()
    │   ├── registerUser()
    │   ├── getUserProfile()
    │   └── logoutUser()
    │
    ├── projects.ts          # 项目管理 API
    │   ├── getProjects()
    │   ├── getProjectDetail()
    │   ├── createProject()
    │   ├── updateProject()
    │   ├── deleteProject()
    │   └── saveProject()
    │
    ├── images.ts            # 图片库管理 API
    │   ├── getProjectImageTree()
    │   ├── createFolder()
    │   ├── updateFolder()
    │   ├── deleteFolder()
    │   ├── uploadProjectImage()
    │   ├── getFolderImages()
    │   ├── getProjectImageDetail()
    │   ├── updateProjectImage()
    │   ├── deleteProjectImage()
    │   ├── uploadProjectVideo()
    │   ├── getFolderVideos()
    │   ├── updateProjectVideo()
    │   └── deleteProjectVideo()
    │
    ├── documents.ts         # 文档管理 API
    │   ├── uploadProjectDocument()
    │   ├── getProjectDocument()
    │   ├── updateProjectDocument()
    │   ├── deleteProjectDocument()
    │   ├── getDocumentTree()
    │   ├── createDocument()
    │   ├── updateDocument()
    │   ├── deleteDocument()
    │   ├── getDocumentDetail()
    │   ├── getAssetFile()
    │   ├── getAssetsBatch()
    │   ├── createDocumentFolder()
    │   ├── updateDocumentFolder()
    │   ├── deleteDocumentFolder()
    │   ├── renameDocumentNode()
    │   └── moveDocumentNode()
    │
    ├── layers.ts            # 图层管理 API
    │   ├── createLayer()
    │   ├── updateLayerTempImage()
    │   └── saveLayerProcessedImage()
    │
    ├── workspace.ts         # Workspace 管理 API
    │   ├── getProjectWorkspace()
    │   ├── saveProjectWorkspace()
    │   └── getWorkspaceDocuments()
    │
    ├── ai.ts                # AI 模型 API
    │   ├── getAIModels()
    │   └── getAIModelParams()
    │
    └── index.ts             # API 统一导出（兼容性入口）
```

## 导入方式

### 推荐的导入方式（按模块）

```typescript
// 从特定模块导入
import { loginUser, getUserProfile } from '@/lib/api/auth';
import { getProjects, createProject } from '@/lib/api/projects';
import { getAccessToken, saveTokens } from '@/lib/utils/token';
import type { TokenResponse, LoginCredentials } from '@/lib/types/auth';
```

### 统一入口导入（向后兼容）

```typescript
// 从统一入口导入所有内容
import { 
  loginUser, 
  getUserProfile, 
  getProjects, 
  apiRequest,
  getAccessToken,
  type TokenResponse 
} from '@/lib/api';
```

## 重构优势

### 1. **模块化清晰**
- 每个文件都有明确的职责
- 相关功能集中在同一模块中
- 便于团队协作和代码审查

### 2. **类型安全**
- TypeScript 类型定义独立管理
- 接口定义更清晰
- 便于复用和维护

### 3. **易于维护**
- 文件体积更小，查找更快
- 修改某一模块不影响其他模块
- 减少合并冲突的可能性

### 4. **向后兼容**
- 保留了 `index.ts` 统一导出
- 旧代码可以继续使用原有导入方式
- 逐步迁移到新的导入方式

### 5. **便于测试**
- 每个模块可以独立测试
- Mock 和依赖注入更简单
- 单元测试覆盖更容易

## 已更新的文件

以下文件的导入路径已更新以使用新的模块化结构：

1. `src/app/login/page.tsx` - 使用 `@/lib/api/auth` 和 `@/lib/utils/token`
2. `src/app/register/page.tsx` - 使用 `@/lib/api/auth`
3. `src/app/edit/page.tsx` - 使用 `@/lib/api/auth`

## 迁移指南

如果您的代码中还在使用旧的导入方式，建议按以下步骤迁移：

### 步骤 1: 识别导入
查找所有从 `@/lib/api/auth` 导入的内容。

### 步骤 2: 按功能分类
根据导入的函数/类型，确定应该从哪个新模块导入。

### 步骤 3: 更新导入语句
```typescript
// 旧方式
import { loginUser, getAccessToken, getProjects } from '@/lib/api/auth';

// 新方式
import { loginUser } from '@/lib/api/auth';
import { getAccessToken } from '@/lib/utils/token';
import { getProjects } from '@/lib/api/projects';
```

### 步骤 4: 验证
运行 TypeScript 编译器和测试，确保没有类型错误。

## 注意事项

1. **统一入口** (`@/lib/api/index.ts`) 仍然导出所有内容，可以作为过渡方案
2. **Token 工具函数**已移至 `@/lib/utils/token.ts`
3. **类型定义**已移至 `@/lib/types/` 目录
4. **核心请求函数** `apiRequest` 现在位于 `@/lib/api/client.ts`

## 未来优化

1. 为每个 API 模块添加单元测试
2. 考虑使用 React Query 或 SWR 进行数据获取
3. 添加 API 响应类型定义
4. 实现统一的错误处理机制
5. 添加请求拦截器和响应拦截器
