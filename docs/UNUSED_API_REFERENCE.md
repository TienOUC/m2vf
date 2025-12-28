# 未使用API接口参考文档

本文档列出了项目中定义但尚未在代码中使用的API接口，包括接口类型、参数和功能描述。

## 1. 图片库管理相关API

### `updateFolder`
- **HTTP方法**: PUT
- **参数**: 
  - projectId: number
  - folderId: number
  - folderData: {
    - name?: string
    - parent?: number
    - sort_order?: number
  }
- **功能**: 更新项目中特定文件夹的信息，包括文件夹名称、父文件夹ID和排序顺序等属性

### `deleteFolder`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - folderId: number
- **功能**: 删除项目中的指定文件夹，可能包括删除文件夹内所有内容或移动内容到父目录

### `getFolderImages`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - folderId: number
- **功能**: 获取指定文件夹下的所有图片列表，用于在前端展示文件夹中的图片内容

### `getProjectImageDetail`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - folderId: number
  - imageId: number
- **功能**: 获取项目中特定图片的详细信息，包括元数据、尺寸、路径等详细属性

### `updateProjectImage`
- **HTTP方法**: PUT
- **参数**: 
  - projectId: number
  - folderId: number
  - imageId: number
  - imageData: {
    - name?: string
    - description?: string
    - sort_order?: number
  }
- **功能**: 更新项目中特定图片的信息，如名称、描述和排序顺序等属性

### `deleteProjectImage`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - folderId: number
  - imageId: number
- **功能**: 删除项目中的指定图片文件及其相关信息

## 2. 视频管理相关API

### `uploadProjectVideo`
- **HTTP方法**: POST
- **参数**: 
  - projectId: number
  - folderId: number | null
  - videoFile: File
  - name?: string
  - description?: string
- **功能**: 将视频文件上传到指定项目和文件夹中，支持根目录或特定文件夹上传

### `getFolderVideos`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - folderId: number
- **功能**: 获取指定文件夹下的所有视频列表，用于在前端展示文件夹中的视频内容

### `updateProjectVideo`
- **HTTP方法**: PUT
- **参数**: 
  - projectId: number
  - folderId: number
  - videoId: number
  - videoData: {
    - name?: string
    - description?: string
    - sort_order?: number
  }
- **功能**: 更新项目中特定视频的信息，如名称、描述和排序顺序等属性

### `deleteProjectVideo`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - folderId: number
  - videoId: number
- **功能**: 删除项目中的指定视频文件及其相关信息

## 3. 旧文档管理相关API

### `uploadProjectDocument`
- **HTTP方法**: POST
- **参数**: 
  - projectId: number
  - folderId: number | null
  - content: string (HTML格式)
  - name?: string
  - description?: string
- **功能**: 上传文档内容到文件夹，支持HTML格式的文档内容

### `getProjectDocument`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - folderId: number
  - documentId: number
- **功能**: 获取文档内容

### `updateProjectDocument`
- **HTTP方法**: PUT
- **参数**: 
  - projectId: number
  - folderId: number
  - documentId: number
  - documentData: {
    - content?: string
    - name?: string
    - description?: string
  }
- **功能**: 更新文档内容、名称或描述

### `deleteProjectDocument`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - folderId: number
  - documentId: number
- **功能**: 删除项目中的指定文档

## 4. 文档管理相关API

### `deleteDocument`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - documentId: number
- **功能**: 删除指定项目中的文档，使用新的架构设计

### `getDocumentDetail`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - documentId: number
- **功能**: 获取文档的详细信息，包括快照JSON和资源列表，使用新的架构设计

### `getAssetFile`
- **HTTP方法**: GET
- **参数**: 
  - projectId: number
  - blobId: string
  - ext: string
- **功能**: 获取资源文件，通过blobId和扩展名访问

### `getAssetsBatch`
- **HTTP方法**: POST
- **参数**: 
  - projectId: number
  - blobIds: string[]
- **功能**: 批量获取资源信息，提高资源加载效率

### `updateDocumentFolder`
- **HTTP方法**: PUT
- **参数**: 
  - projectId: number
  - folderId: number
  - folderData: {
    - name?: string
    - parent?: number | null
  }
- **功能**: 更新文档文件夹的属性，如名称和父文件夹等

### `deleteDocumentFolder`
- **HTTP方法**: DELETE
- **参数**: 
  - projectId: number
  - folderId: number
- **功能**: 删除文档文件夹，可能包括删除文件夹内所有内容或移动内容到父目录

### `renameDocumentNode`
- **HTTP方法**: PATCH
- **参数**: 
  - projectId: number
  - nodeId: number
  - nodeData: {
    - name: string
    - type: 'document' | 'folder'
  }
- **功能**: 重命名文档节点（文档或文件夹），支持对文档结构中的任意节点进行重命名操作

### `moveDocumentNode`
- **HTTP方法**: PATCH
- **参数**: 
  - projectId: number
  - nodeId: number
  - nodeData: {
    - target_folder_id?: number | null
    - type: 'document' | 'folder'
  }
- **功能**: 移动文档节点（文档或文件夹）到不同的位置，支持重新组织文档结构

## 5. 图层管理相关API

### `createLayer`
- **HTTP方法**: POST
- **参数**: 
  - layerData: any
- **功能**: 创建一个新的图层，用于图像处理和编辑功能

### `updateLayerTempImage`
- **HTTP方法**: POST
- **参数**: 
  - layerId: string
  - tempEditedImageUrl: string
- **功能**: 更新图层的临时编辑图片，用于保存编辑过程中的中间结果

### `saveLayerProcessedImage`
- **HTTP方法**: POST
- **参数**: 
  - layerId: string
  - processedImageUrl: string
- **功能**: 保存图层处理后的最终图片，用于存储编辑完成的图像结果

## 6. 项目管理相关API

### `saveProject`
- **HTTP方法**: POST
- **参数**: 
  - projectData: any
- **功能**: 专门用于保存项目的API请求，可能用于定期保存项目状态或手动保存功能