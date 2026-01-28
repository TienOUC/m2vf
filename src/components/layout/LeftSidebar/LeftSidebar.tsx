'use client';

import React from 'react';
import { SidebarButton, ClickMenu } from '@/components/ui';
import UserProfileMenu from '../UserProfileMenu';
import { useAuthStore } from '@/lib/stores';
import { LeftSidebarProps } from './types';
import { getSidebarButtons } from './config'; // config.tsx

export default function LeftSidebar(props: LeftSidebarProps) {
  const { user } = useAuthStore();
  const sidebarButtons = getSidebarButtons(props);

  return (
    <div>
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-neutral-200 z-10 flex flex-col items-center gap-1.5 w-[54px]"
        onClick={(e) => e.stopPropagation()}
      >
        {sidebarButtons.map((button, index) => (
          <React.Fragment key={button.id}>
            {button.menu ? (
              <ClickMenu
                position="right"
                width={button.menuWidth}
                menuContent={button.menu}
                useDefaultStyles={button.useDefaultMenuStyles}
                menuId={button.id}
              >
                <SidebarButton
                  icon={button.icon}
                  title={button.title}
                  onClick={button.onClick}
                  animation={button.animation}
                  className={button.id === 'add' ? 'rounded-full bg-gray-200 hover:bg-gray-300 shadow-md' : ''}
                />
              </ClickMenu>
            ) : (
              <SidebarButton
                icon={button.icon}
                title={button.title}
                onClick={button.onClick}
                animation={button.animation}
              />
            )}

            {/* 添加分隔线：只在添加按钮之后添加 */}
            {button.id === 'add' && (
              <div className="w-8 h-px bg-neutral-200"></div>
            )}
          </React.Fragment>
        ))}

        {/* 分割线 */}
        <div className="w-8 h-px bg-neutral-200 mt-1.5"></div>
        
        {/* 用户头像 - 悬停菜单已在UserProfileMenu组件内部实现 */}
        <div className="mt-auto">
          {user && <UserProfileMenu size="md" variant="sidebar" />}
        </div>
      </div>
    </div>
  );
}
