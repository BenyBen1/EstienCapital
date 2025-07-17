import React from 'react';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Text({ children, className = '', as: Component = 'span' }: TextProps) {
  return <Component className={className}>{children}</Component>;
}

export default Text;
