import Image from "next/image";
import Link from "next/link";

export function Logo({
  variant = "navy",
  height = 36,
  href = "/",
}: {
  variant?: "navy" | "white";
  height?: number;
  width?: number;
  href?: string | null;
}) {
  const src = variant === "white" ? "/brand/wordmark-white.png" : "/brand/wordmark-navy.png";
  // native wordmark aspect ratio is ~3.65:1
  const width = Math.round(height * 3.65);

  const img = (
    <Image
      src={src}
      alt="Neri Haven"
      width={width}
      height={height}
      priority
      style={{ height, width: "auto" }}
    />
  );

  if (!href) return img;
  return (
    <Link href={href} aria-label="Neri Haven home">
      {img}
    </Link>
  );
}
