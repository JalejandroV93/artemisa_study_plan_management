export function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-center w-full hover:text-red-700">
          © Liceo Taller San Miguel {"  "}  {new Date().getFullYear()} {"  "}
        </p>
      </div>
    </div>
  );
}
