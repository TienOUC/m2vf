'use client';

import React from 'react';
import LeftSidebar from '@/components/layout/LeftSidebar';
import BackButton from '@/components/editor/FlowCanvas/BackButton';

export default function ThreeDPage() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', display: 'block' }}>
      <BackButton />
      
      <LeftSidebar 
        onAddTextNode={() => {}} 
        onAddImageNode={() => {}} 
        onAddVideoNode={() => {}} 
      />
      
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#666',
        fontSize: '18px'
      }}>
        3D页面
      </div>
    </div>
  );
}