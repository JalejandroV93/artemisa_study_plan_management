interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <div>
      <div className=" pt-8 pb-8 px-4 sm:px-8">{children}</div>
    </div>
  );
}
