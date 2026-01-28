import { Icon } from "./Icon";
import { IconProps } from "./types";

// 便捷的图标组件
export const JimengIcon = (props: Omit<IconProps, "name">) => (
  <Icon name="jimeng" {...props} />
);

export const KlingIcon = (props: Omit<IconProps, "name">) => (
  <Icon name="kling" {...props} />
);

export const MiniMaxIcon = (props: Omit<IconProps, "name">) => (
  <Icon name="minimax" {...props} />
);

export const ViduIcon = (props: Omit<IconProps, "name">) => (
  <Icon name="vidu" {...props} />
);
