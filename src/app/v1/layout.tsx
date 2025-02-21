import PanelLayout from "@/components/panel-layout/panel-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelLayout>{children}</PanelLayout>;
}
