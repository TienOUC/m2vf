import * as React from "react";
import { IconProps } from "./types";
import { svgConfig } from "./config"; // 注意：实际文件是 config.tsx，但 TypeScript 会自动处理扩展名

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      name,
      size = 24,
      className,
      color = "currentColor",
      theme = "light",
      viewBox = "0 0 24 24",
      strokeWidth = 0,
      strokeColor,
      ...props
    },
    ref
  ) => {
    // 获取 SVG 内容
    const getSvgContent = React.useCallback(() => {
      const iconConfig = svgConfig[name];
      if (!iconConfig) {
        console.warn(`Icon ${name} is not supported`);
        return svgConfig.jimeng.light;
      }
      
      return iconConfig[theme] || iconConfig.light;
    }, [name, theme]);

    // 克隆 SVG 元素并应用样式
    const renderSvgContent = React.useCallback(() => {
      const svgContent = getSvgContent();
      
      return React.cloneElement(svgContent as React.ReactElement, {
        fill: color,
        stroke: strokeColor || color,
        strokeWidth: strokeWidth,
      });
    }, [getSvgContent, color, strokeColor, strokeWidth]);

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        className={className}
        {...props}
      >
        {renderSvgContent()}
      </svg>
    );
  }
);

Icon.displayName = "Icon";

export { Icon };
