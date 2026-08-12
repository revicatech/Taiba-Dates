import Image from "next/image";
import logo from "@/assets/logo.png";

type Props = {
  size?: number;
  priority?: boolean;
  className?: string;
};

export default function Logo({ size = 48, priority, className }: Props) {
  return (
    <Image
      src={logo}
      alt="طيبة للتمور — Tiba Dates"
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: size, display: "block", objectFit: "contain" }}
    />
  );
}
