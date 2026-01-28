import * as React from "react";

// 定义支持的 icon 名称类型
export type IconName = "jimeng" | "kling" | "minimax" | "vidu";

// 定义支持的主题类型
export type IconTheme = "light" | "dark";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** icon 名称 */
  name: IconName;
  /** icon 大小，默认 24 */
  size?: number | string;
  /** 自定义 CSS 类 */
  className?: string;
  /** icon 颜色，默认 currentColor */
  color?: string;
  /** 主题，默认 light */
  theme?: IconTheme;
  /** SVG viewBox，默认 0 0 24 24 */
  viewBox?: string;
  /** 描边宽度 */
  strokeWidth?: number;
  /** 描边颜色 */
  strokeColor?: string;
}
