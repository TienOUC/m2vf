# API 快速参考

## 认证 API (`@/lib/api/auth`)

```typescript
import { loginUser, registerUser, getUserProfile, logoutUser } from '@/lib/api/auth';

// 用户登录
const response = await loginUser({ email: 'user@example.com', password: 'password' });

// 用户注册
const result = await registerUser({
  email: 'user@example.com',
  phoneNumber: '13800138000',
  password: 'password',
  confirmPassword: 'password',
  name: '用户名'
});

// 获取用户信息
const profileResponse = await getUserProfile();

// 登出
logoutUser();
```

## Token 工具 (`@/lib/utils/token`)

```typescript
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  refreshAccessToken,
  isUserLoggedIn
} from '@/lib/utils/token';

// 获取 access token
const token = getAccessToken();

// 检查是否已登录
if (isUserLoggedIn()) {
  // 用户已登录
}

// 刷新 token
const newToken = await refreshAccessToken();
```

## 项目管理 API (`@/lib/api/projects`)

```typescript
import {
  getProjects,
  getProjectDetail,
  createProject,
  updateProject,
  deleteProject,
  saveProject
} from '@/lib/api/projects';

// 获取项目列表
const projects = await getProjects({ page: 1, pageSize: 10 });

// 获取项目详情
const project = await getProjectDetail(projectId);

// 创建项目
const newProject = await createProject({
  name: '项目名称',
  description: '项目描述'
});

// 更新项目
await updateProject(projectId, { name: '新名称' });

// 删除项目
await deleteProject(projectName);
```

## 图片库管理 API (`@/lib/api/images`)

```typescript
import {
  getProjectImageTree,
  createFolder,
  uploadProjectImage,
  getFolderImages,
  uploadProjectVideo
} from '@/lib/api/images';

// 获取项目图片树
const tree = await getProjectImageTree(projectId, {
  includeResources: true,
  fullTree: false
});

// 创建文件夹
const folder = await createFolder(projectId, {
  name: '新文件夹',
  parent: parentId
});

// 上传图片
const image = await uploadProjectImage(
  projectId,
  folderId,
  imageFile,
  '图片名称',
  '图片描述'
);

// 上传视频
const video = await uploadProjectVideo(
  projectId,
  folderId,
  videoFile,
  '视频名称',
  '视频描述'
);
```

## 文档管理 API (`@/lib/api/documents`)

```typescript
import {
  getDocumentTree,
  createDocument,
  updateDocument,
  deleteDocument,
  createDocumentFolder
} from '@/lib/api/documents';

// 获取文档树
const tree = await getDocumentTree(projectId);

// 创建文档
const doc = await createDocument(projectId, {
  name: '新文档',
  folder_id: folderId,
  content: '<p>文档内容</p>'
});

// 更新文档
await updateDocument(projectId, documentId, {
  name: '新名称',
  snapshot: JSON.stringify(snapshotData),
  assets: [
    { blobId: 'blob-id', file: fileBlob, ext: 'png' }
  ]
});

// 创建文档文件夹
const folder = await createDocumentFolder(projectId, {
  name: '新文件夹',
  parent: parentId
});
```

## AI 模型 API (`@/lib/api/ai`)

```typescript
import { getAIModels, getAIModelParams } from '@/lib/api/ai';

// 获取 AI 模型列表
const models = await getAIModels();

// 获取模型参数
const params = await getAIModelParams(modelId, 'image');
```

## 图层管理 API (`@/lib/api/layers`)

```typescript
import {
  createLayer,
  updateLayerTempImage,
  saveLayerProcessedImage
} from '@/lib/api/layers';

// 创建图层
const layer = await createLayer(layerData);

// 更新临时图片
await updateLayerTempImage(layerId, tempImageUrl);

// 保存处理后的图片
await saveLayerProcessedImage(layerId, processedImageUrl);
```

## Workspace API (`@/lib/api/workspace`)

```typescript
import {
  getProjectWorkspace,
  saveProjectWorkspace,
  getWorkspaceDocuments
} from '@/lib/api/workspace';

// 获取项目 workspace
const workspace = await getProjectWorkspace(projectId);

// 保存 workspace
await saveProjectWorkspace(projectId, base64ZipContent);

// 获取 workspace 文档列表
const docs = await getWorkspaceDocuments(projectId);
```

## 核心请求客户端 (`@/lib/api/client`)

```typescript
import { apiRequest } from '@/lib/api/client';

// 自定义 API 请求
const response = await apiRequest('https://api.example.com/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
  timeout: 30000 // 30秒超时
});
```

## 类型定义

```typescript
// 从类型模块导入
import type {
  TokenResponse,
  LoginCredentials,
  ApiRequestOptions
} from '@/lib/types/auth';

import type {
  AIModel,
  AIModelListResponse,
  ParameterSchema
} from '@/lib/types/ai';
```
