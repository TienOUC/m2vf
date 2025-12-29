# 工作流数据持久化设计方案

## 概述

本文档描述了针对大量节点工作流的数据持久化设计方案。考虑到性能和可扩展性，采用分离存储方案，将工作流元数据、节点数据和边数据分别存储。

## 数据结构设计

### 1. 工作流元数据 (Workflow Metadata)

```json
{
  "workflow": {
    "id": "workflow_001",
    "projectId": "project_123",
    "name": "多媒体工作流示例",
    "description": "一个包含文本、图片、视频和音频的多媒体工作流",
    "version": "1.0.0",
    "status": "active",
    "tags": ["multimedia", "demo", "workflow"],
    "createdAt": "2024-12-29T10:00:00.000Z",
    "updatedAt": "2024-12-29T15:30:00.000Z",
    "author": "user_123",
    "collaborators": ["user_456", "user_789"],
    "layout": {
      "viewport": {
        "x": -100,
        "y": -100,
        "zoom": 0.8
      },
      "canvas": {
        "size": {
          "width": 1200,
          "height": 800
        },
        "background": {
          "color": "#ffffff",
          "variant": "dots",
          "gap": 12,
          "size": 1
        }
      }
    },
    "metadata": {
      "nodeCount": 2,
      "edgeCount": 1,
      "lastNodeId": 3,
      "lastEdgeId": 2,
      "lastModifiedBy": "user_123",
      "nodeTypesUsed": ["text", "image"],
      "totalFileSize": 1024000,
      "estimatedDuration": 300
    },
    "settings": {
      "snapToGrid": true,
      "gridSize": 20,
      "allowLooseConnections": false,
      "allowMultiSelection": true,
      "readOnly": false,
      "zoomLimits": {
        "min": 0.1,
        "max": 2
      }
    }
  }
}
```

### 2. 节点数据 (Node Data)

```json
{
  "nodes": [
    {
      "id": "node-text-1",
      "workflowId": "workflow_001",
      "type": "text",
      "position": {
        "x": 100,
        "y": 100
      },
      "positionAbsolute": {
        "x": 100,
        "y": 100
      },
      "data": {
        "label": "文本节点",
        "content": "这是文本节点的内容",
        "placeholder": "输入文本内容...",
        "style": {
          "fontSize": 14,
          "fontFamily": "Arial",
          "textAlign": "left",
          "color": "#333333",
          "backgroundColor": "#ffffff",
          "borderColor": "#cccccc",
          "borderRadius": 4,
          "borderWidth": 1
        },
        "onTypeChange": null,
        "onDelete": null
      },
      "width": 240,
      "height": 160,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "parentNode": null,
      "zIndex": 0,
      "hidden": false,
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    },
    {
      "id": "node-image-1",
      "workflowId": "workflow_001",
      "type": "image",
      "position": {
        "x": 400,
        "y": 100
      },
      "positionAbsolute": {
        "x": 400,
        "y": 100
      },
      "data": {
        "label": "图片节点",
        "imageUrl": "/api/files/image/12345",
        "originalFileName": "sample.jpg",
        "fileSize": 1024000,
        "mimeType": "image/jpeg",
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "thumbnailUrl": "/api/thumbnails/12345",
        "altText": "示例图片",
        "style": {
          "borderRadius": 4,
          "borderColor": "#cccccc",
          "borderWidth": 1
        },
        "onTypeChange": null,
        "onDelete": null,
        "onReplace": null
      },
      "width": 240,
      "height": 160,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "parentNode": null,
      "zIndex": 0,
      "hidden": false,
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    },
    {
      "id": "node-video-1",
      "workflowId": "workflow_001",
      "type": "video",
      "position": {
        "x": 100,
        "y": 300
      },
      "positionAbsolute": {
        "x": 100,
        "y": 300
      },
      "data": {
        "label": "视频节点",
        "videoUrl": "/api/files/video/67890",
        "originalFileName": "sample.mp4",
        "fileSize": 5120000,
        "mimeType": "video/mp4",
        "duration": 120,
        "thumbnailUrl": "/api/thumbnails/67890",
        "coverImage": "/api/covers/67890",
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "style": {
          "borderRadius": 4,
          "borderColor": "#cccccc",
          "borderWidth": 1
        },
        "onTypeChange": null,
        "onDelete": null,
        "onReplace": null
      },
      "width": 240,
      "height": 160,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "parentNode": null,
      "zIndex": 0,
      "hidden": false,
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    },
    {
      "id": "node-audio-1",
      "workflowId": "workflow_001",
      "type": "audio",
      "position": {
        "x": 400,
        "y": 300
      },
      "positionAbsolute": {
        "x": 400,
        "y": 300
      },
      "data": {
        "label": "音频节点",
        "audioUrl": "/api/files/audio/11111",
        "originalFileName": "sample.mp3",
        "fileSize": 2048000,
        "mimeType": "audio/mp3",
        "duration": 180,
        "thumbnailUrl": "/api/thumbnails/11111",
        "style": {
          "borderRadius": 4,
          "borderColor": "#cccccc",
          "borderWidth": 1
        },
        "onTypeChange": null,
        "onDelete": null,
        "onReplace": null
      },
      "width": 240,
      "height": 160,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "parentNode": null,
      "zIndex": 0,
      "hidden": false,
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    }
  ]
}
```

### 3. 边数据 (Edge Data)

```json
{
  "edges": [
    {
      "id": "edge-1",
      "workflowId": "workflow_001",
      "source": "node-text-1",
      "sourceHandle": "source",
      "target": "node-image-1",
      "targetHandle": "target",
      "type": "default",
      "animated": false,
      "label": "",
      "labelStyle": {
        "fontSize": 12,
        "fill": "#333",
        "textAnchor": "middle"
      },
      "style": {
        "stroke": "#666",
        "strokeWidth": 1
      },
      "markerStart": "none",
      "markerEnd": "arrowclosed",
      "zIndex": 0,
      "data": {
        "connectionType": "sequential",
        "connectionLabel": "顺序连接",
        "connectionProperties": {
          "isConditional": false,
          "condition": null,
          "weight": 1
        }
      },
      "selected": false,
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    },
    {
      "id": "edge-2",
      "workflowId": "workflow_001",
      "source": "node-image-1",
      "sourceHandle": "source",
      "target": "node-video-1",
      "targetHandle": "target",
      "type": "smoothstep",
      "animated": false,
      "label": "",
      "style": {
        "stroke": "#007acc",
        "strokeWidth": 2
      },
      "markerStart": "none",
      "markerEnd": "arrow",
      "data": {
        "connectionType": "dataFlow",
        "connectionLabel": "数据流转",
        "connectionProperties": {
          "isConditional": true,
          "condition": "if image processed",
          "weight": 1
        }
      },
      "createdAt": "2024-12-29T10:00:00.000Z",
      "updatedAt": "2024-12-29T15:30:00.000Z"
    }
  ]
}
```

## API响应结构

### 1. 获取完整工作流数据

```json
{
  "success": true,
  "message": "工作流数据获取成功",
  "data": {
    "workflow": {
      // 工作流元数据
    },
    "nodes": [
      // 节点数据数组
    ],
    "edges": [
      // 边数据数组
    ]
  },
  "timestamp": "2024-12-29T15:30:00.000Z"
}
```

### 2. 部分更新响应

```json
{
  "success": true,
  "message": "节点更新成功",
  "data": {
    "updatedNodes": [
      // 更新的节点数组
    ],
    "updatedEdges": [
      // 更新的边数组
    ],
    "workflow": {
      // 更新后的工作流元数据
    }
  },
  "timestamp": "2024-12-29T15:30:00.000Z"
}
```

## 数据库表设计建议

### 1. workflows 表
- id (主键)
- project_id
- name
- description
- version
- status
- tags (JSON)
- created_at
- updated_at
- author
- layout (JSON)
- metadata (JSON)
- settings (JSON)

### 2. nodes 表
- id (主键)
- workflow_id (外键)
- type
- position (JSON)
- data (JSON)
- width
- height
- created_at
- updated_at

### 3. edges 表
- id (主键)
- workflow_id (外键)
- source
- target
- type
- style (JSON)
- data (JSON)
- created_at
- updated_at

## 性能优化建议

1. **索引优化**：在 workflow_id 上建立索引，加快查询速度
2. **分页加载**：对于大量节点，考虑分页加载节点数据
3. **缓存策略**：对频繁访问的工作流元数据进行缓存
4. **批量操作**：支持批量更新节点和边数据
5. **增量同步**：只同步变更的数据，减少网络传输

## 版本控制

1. **工作流版本**：支持工作流版本管理
2. **变更历史**：记录每次变更的详细信息
3. **回滚功能**：支持回滚到指定版本

## 自动保存机制

1. **定时保存**：定期自动保存草稿
2. **操作保存**：在关键操作后自动保存
3. **冲突处理**：处理多用户编辑冲突
4. **撤销/重做**：支持操作历史记录