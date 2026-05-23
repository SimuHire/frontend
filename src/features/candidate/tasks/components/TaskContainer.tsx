import { ReactNode } from 'react';

type TaskContainerProps = {
  children: ReactNode;
  className?: string;
};

export function TaskContainer({ children, className }: TaskContainerProps) {
  const layoutClassName = className?.trim() ? className : 'mx-auto max-w-3xl';
  return (
    <div
      className={`${layoutClassName} rounded-md border bg-white p-6 shadow-sm`}
    >
      {children}
    </div>
  );
}
